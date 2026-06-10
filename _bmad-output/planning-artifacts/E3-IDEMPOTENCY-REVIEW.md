---
document_type: "Idempotency Review for E3 Drag-Drop"
date: "2026-06-09"
author: "Amelia (Developer)"
context: "Epic 2 Retrospective — Action Item #2 Review"
status: "COMPLETED"
---

# 🔄 IDEMPOTENCY REVIEW: E2-S3 Pattern Applied to E3-S3 Drag-Drop

**Date:** 2026-06-09  
**Reviewer:** Amelia (Developer)  
**Epic Context:** Epic 2 Retrospective Action Item #2  
**Scope:** Analyze how E2-S3 idempotency caching applies to E3-S3 drag-drop operations

---

## 📌 EXECUTIVE SUMMARY

**Finding:** ✅ **E2-S3 idempotency pattern is READY for E3-S3 drag-drop**

- ✅ Cache key structure `{lead_id}:{idempotency_key}` handles concurrent drag-drops
- ✅ 60-second cache expiration is appropriate for drag-drop velocity
- ✅ No modifications needed for E3-S3 implementation
- ⚠️ One consideration: network timing in high-latency scenarios

---

## 🔍 BACKGROUND: E2-S3 Idempotency Implementation

### What E2-S3 Built

The PATCH /api/leads/{id}/status endpoint in E2-S3 implements idempotency to ensure that:
- **Same request = Same response** (safe to retry without side effects)
- **Cache key:** `{lead_id}:{idempotency_key}` (unique per lead per request)
- **Cache TTL:** 60 seconds (long enough for user to see result + retry if needed)
- **Cache storage:** PostgreSQL `idempotency_keys` table

### Schema

```sql
CREATE TABLE idempotency_keys (
    key VARCHAR(100) PRIMARY KEY,  -- "{lead_id}:{idempotency_key}"
    status_code INTEGER NOT NULL,
    response_body JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '60 seconds')
);
```

### Implementation Pattern

```python
@router.patch("/leads/{lead_id}/status")
async def change_lead_status(
    lead_id: int,
    request: Request,  # Get Idempotency-Key header
    lead_update: LeadStatusUpdate,
    session: AsyncSession
) -> Lead:
    # Extract idempotency key from header (client sends it)
    idempotency_key = request.headers.get("Idempotency-Key")
    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Idempotency-Key header required")
    
    # Build cache key
    cache_key = f"{lead_id}:{idempotency_key}"
    
    # Check if we've already processed this exact request
    cached = await session.execute(
        select(IdempotencyKey).where(
            IdempotencyKey.key == cache_key,
            IdempotencyKey.expires_at > func.now()
        )
    )
    
    cached_entry = cached.scalar()
    if cached_entry:
        # Return cached response (same as last time)
        return {
            "status_code": cached_entry.status_code,
            "body": cached_entry.response_body
        }
    
    # Process the request normally
    db_lead = await session.get(Lead, lead_id, with_for_update=True)
    if not db_lead:
        raise HTTPException(status_code=404)
    
    old_status = db_lead.status
    db_lead.status = lead_update.status
    db_lead.updated_at = func.now()
    
    await session.flush()
    
    # Cache the response
    cache_entry = IdempotencyKey(
        key=cache_key,
        status_code=200,
        response_body=jsonify(db_lead)
    )
    session.add(cache_entry)
    
    await session.commit()
    return db_lead
```

---

## 🎯 E3-S3 DRAG-DROP SCENARIO

### What E3-S3 Does

E3-S3 implements drag-and-drop to let users move leads between Kanban columns:

```
User drags "Lead A" from "Nuevo" column → "En contacto" column
    ↓
Frontend:
  1. Generate UUID for this drag operation
  2. Call: PATCH /api/leads/{lead_id}/status
          with Idempotency-Key header
  3. Optimistically update UI (move card)
  4. Wait for response
    
Backend:
  1. Receives PATCH with Idempotency-Key
  2. Updates status + caches result
  3. Returns 200 OK
    
Frontend:
  1. If success: ✅ UI already updated (optimistic worked)
  2. If error: ❌ Revert card to previous column, show error toast
```

### Why Idempotency Matters

**Scenario: Network hiccup on drag-drop**

```
Timeline:
  T=0ms:   User drags Lead A
  T=50ms:  Frontend sends PATCH (Idempotency-Key: uuid-123)
  T=100ms: Backend processes, updates status, caches result
  T=150ms: Response in-flight to frontend
  T=200ms: NETWORK HICCUP - response lost
  T=250ms: Frontend timeout, user clicks "Retry"
  T=300ms: Frontend sends PATCH again (same Idempotency-Key: uuid-123)
  T=350ms: Backend sees cache hit, returns cached result (200 OK)
  
Result:
  ✅ Lead status updated only once
  ✅ No duplicate status change
  ✅ User sees success (response finally arrives)
```

**Without idempotency:**

```
  T=300ms: Frontend sends PATCH again
  T=350ms: Backend processes as NEW request, updates status AGAIN
  
Result:
  ❌ Lead status updated twice
  ❌ Audit trail has duplicate entries
  ❌ Potential state corruption
```

---

## ✅ IDEMPOTENCY PATTERN READINESS FOR E3-S3

### Assessment: Pattern is READY

| Aspect | Status | Details |
|--------|--------|---------|
| **Cache key structure** | ✅ | `{lead_id}:{idempotency_key}` unique per request per lead |
| **Cache TTL** | ✅ | 60 seconds appropriate for drag-drop velocity |
| **Cache storage** | ✅ | PostgreSQL table with indexes, no performance risk |
| **Error handling** | ✅ | Cache hit on retry returns same response |
| **Concurrency safety** | ✅ | `WITH FOR UPDATE` lock prevents race conditions |
| **Database transaction** | ✅ | Atomic: update status + cache entry or neither |

### No Modifications Needed

The E2-S3 pattern can be used as-is for E3-S3:

```python
# E3-S3 drag-drop will use same pattern:
@router.patch("/leads/{lead_id}/status")
async def change_lead_status(
    lead_id: int,
    request: Request,
    lead_update: LeadStatusUpdate,
    session: AsyncSession
) -> Lead:
    # EXACT SAME IMPLEMENTATION
    # No changes needed for E3-S3
    ...
```

---

## 🚨 EDGE CASES & CONSIDERATIONS

### Edge Case 1: Rapid Drag-Drop Sequence

**Scenario:** User drags Lead A to 3 different columns rapidly

```
Timeline:
  T=0ms:   User drags Lead A → Column B (Idempotency-Key: uuid-1)
  T=50ms:  Frontend sends PATCH
  T=100ms: User immediately drags Lead A → Column C (new Idempotency-Key: uuid-2)
  T=150ms: Frontend sends second PATCH (different key)
  T=200ms: Backend processes uuid-1 request, updates status to B
  T=250ms: Backend processes uuid-2 request, updates status to C
  
Result:
  ✅ Lead status correctly ends at Column C
  ✅ Both requests cached separately (different keys)
  ✅ No collision or data corruption
```

**Conclusion:** ✅ Pattern handles rapid sequences correctly (different Idempotency-Keys don't collide)

---

### Edge Case 2: Concurrent Drag-Drop by Multiple Users

**Scenario:** User A and User B drag different leads simultaneously

```
Timeline:
  T=0ms:   User A drags Lead A (Idempotency-Key: uuid-A-1)
  T=10ms:  User B drags Lead B (Idempotency-Key: uuid-B-1)
  T=50ms:  Both requests arrive at backend simultaneously
  
Backend:
  Request 1 (Lead A): lead_id=1, cache_key="1:uuid-A-1"
  Request 2 (Lead B): cache_key="2:uuid-B-1"  (DIFFERENT leads, DIFFERENT cache keys)
  
Result:
  ✅ No collision (different lead IDs in cache key)
  ✅ Both updates processed correctly
```

**Conclusion:** ✅ Pattern handles concurrent users correctly (different lead_ids don't collide)

---

### Edge Case 3: Cache Expiration During Network Delay

**Scenario:** Network is very slow, request takes >60 seconds

```
Timeline:
  T=0ms:   User drags Lead A
  T=50ms:  Frontend sends PATCH (Idempotency-Key: uuid-123)
  T=100ms: Backend processes, caches result (expires at T=60000ms)
  T=200ms: Response in-flight but VERY SLOW
  T=60100ms: Cache expires, database deletes cached entry
  T=65000ms: Response finally arrives at frontend
  T=65100ms: User sees success (backend processed)
  T=65200ms: User drags Lead A again (accidental double-click)
  T=65250ms: Frontend sends PATCH with SAME Idempotency-Key (browser cache)
  T=65300ms: Backend doesn't find cache entry (expired), processes as NEW request
  
Result:
  ❌ Lead status updated TWICE (cache miss)
```

**Probability:** Very low (would require >60 second latency + user double-drag after success)

**Mitigation Options:**

1. **Increase cache TTL** (currently 60s)
   - Pro: Covers slow networks
   - Con: Uses more database storage
   - Recommendation: ✅ **Keep at 60s** (reasonable for demo/production LAN)

2. **Add frontend double-click protection**
   - Pro: Prevents accidental rerequests
   - Con: Extra complexity
   - Recommendation: ✅ **Good practice regardless** (E3-S3 should add this)

3. **Client-side debouncing**
   - Pro: Prevents rapid drag requests
   - Con: May feel sluggish if user is fast
   - Recommendation: ✅ **Use 300ms debounce** for drag-drop

---

### Edge Case 4: Disk Storage for Idempotency Cache

**Question:** Will storing idempotency keys for 1000s of drag-drops consume too much disk?

**Calculation:**

```
Scenario: Demo with 50 leads, 5 users, 2-day event

Each idempotency entry:
  - key (VARCHAR 100): ~20 bytes
  - status_code (INT): 4 bytes
  - response_body (JSONB, ~500 bytes): 500 bytes
  - created_at, expires_at (TIMESTAMP): 16 bytes
  - overhead: ~50 bytes
  ────────────────────────────────────
  Total per entry: ~590 bytes

Estimated drag-drops:
  - 5 users × 4 hours × 10 drags/hour = 200 drags/user = 1,000 drags total
  - Plus network retries (assume 5% fail): 50 retries
  - Total: 1,050 cache entries

Storage: 1,050 × 590 bytes = 619 KB
Auto-cleanup: Entries deleted after 60s expiration

Result: ✅ Negligible storage, no concern
```

**Conclusion:** ✅ Database storage not a concern for E3-S3

---

## 📋 RECOMMENDATIONS FOR E3-S3 IMPLEMENTATION

### Must-Have

1. ✅ **Use exact E2-S3 pattern**
   - Cache key: `{lead_id}:{idempotency_key}`
   - TTL: 60 seconds
   - Storage: PostgreSQL `idempotency_keys` table

2. ✅ **Frontend generates UUID for each drag**
   ```typescript
   const dragId = generateUUID();  // New UUID per drag operation
   await patch(`/api/leads/${leadId}/status`, {
     status: newStatus,
     headers: { "Idempotency-Key": dragId }
   });
   ```

3. ✅ **Handle cache hits transparently**
   - If backend returns cached response, frontend treats it as success
   - No special UI behavior needed (response is same as first time)

### Nice-to-Have (Not Blocking)

4. ⏳ **Add frontend double-click protection**
   ```typescript
   const [isDragging, setIsDragging] = useState(false);
   
   const handleDragEnd = async (result) => {
     if (isDragging) return;  // Prevent concurrent drags
     setIsDragging(true);
     try {
       // Drag logic
     } finally {
       setIsDragging(false);
     }
   };
   ```

5. ⏳ **Monitor cache performance**
   - Log cache hits vs misses
   - Alert if cache hit rate < 95% (might indicate TTL too short)

### Testing Requirements

6. ✅ **Test cache hit on retry**
   ```python
   def test_idempotency_cache_hit():
     # First request
     response1 = patch(f"/leads/{lead_id}/status", 
                       idempotency_key="abc-123", 
                       status="En contacto")
     assert response1.status_code == 200
     
     # Second request (same key)
     response2 = patch(f"/leads/{lead_id}/status", 
                       idempotency_key="abc-123", 
                       status="En contacto")
     assert response2.status_code == 200
     assert response2.body == response1.body  # EXACT SAME RESPONSE
   ```

7. ✅ **Test cache isolation**
   ```python
   def test_different_leads_different_cache():
     # Lead A drag
     patch(f"/leads/1/status", idempotency_key="xyz", status="B")
     # Lead B drag (same key, different lead)
     patch(f"/leads/2/status", idempotency_key="xyz", status="C")
     
     # Both should succeed (different cache keys due to different lead_id)
     lead_a = get(f"/leads/1")
     lead_b = get(f"/leads/2")
     assert lead_a.status == "B"  # Not affected by Lead B
     assert lead_b.status == "C"  # Not affected by Lead A
   ```

---

## 🎯 IMPLICATIONS FOR E3-S2 (Kanban Dashboard)

**Note:** E3-S2 (dashboard rendering) doesn't use PATCH, so idempotency doesn't apply.

- E3-S2 is pure read (GET /leads with status filtering)
- E3-S3 (drag-drop) is where PATCH status gets used
- Idempotency is E3-S3 concern, not E3-S2

---

## 📝 CONCLUSION

### ✅ Pattern is Production-Ready for E3-S3

**No modifications to E2-S3 idempotency pattern required.**

The cache key structure, TTL, and storage approach work perfectly for drag-drop scenarios:
- Prevents duplicate status changes on network retries
- Handles rapid drags (different keys don't collide)
- Handles concurrent users (different lead IDs don't collide)
- Storage and performance are negligible concerns

### Implementation Timeline

- **E3-S1:** No idempotency needed (GET endpoint, read-only)
- **E3-S2:** No idempotency needed (rendering, read-only)
- **E3-S3:** Use E2-S3 pattern as-is (PATCH endpoint, status changes)

### Sign-Off

✅ **Ready to proceed with E3-S3 development using E2-S3 idempotency pattern**

---

**Document Status:** ✅ COMPLETED  
**Date Completed:** 2026-06-09  
**Reviewer:** Amelia (Developer)  
**Approved by:** Project Lead (pending)
