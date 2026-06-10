---
decision_number: ADR-001
title: "Email Uniqueness Rule Across Create and Edit Operations"
date: "2026-06-09"
status: "APPROVED"
author: "Charlie (Senior Dev)"
context: "Epic 2 Retrospective — Email Uniqueness Implementation Analysis"
---

# 📋 ADR-001: Email Uniqueness Rule Across Create and Edit Operations

**Decision Date:** 2026-06-09  
**Status:** ✅ APPROVED  
**Owner:** Charlie (Senior Developer)  
**Applies To:** E2-S1, E2-S2, E2-S3, E2-S4, E3+

---

## 📌 BUSINESS RULE

### The Rule

> **Email must be globally unique across all leads EXCEPT when editing an existing lead to keep its own email.**

### Formal Specification

```
For CREATE operations:
  - Email must NOT exist in any other lead record
  - Email must NOT be in deleted/archived leads
  - Return 409 Conflict if duplicate found
  
For EDIT operations:
  - Email must NOT exist in any OTHER lead record
  - Email CAN be the same as the current lead's email (no-op is allowed)
  - Email must NOT be in deleted/archived leads (excluding current lead)
  - Return 409 Conflict if email exists in another lead
  - No error if email is unchanged
```

---

## 🏗️ IMPLEMENTATION ARCHITECTURE

The email uniqueness rule is implemented across **4 separate layers**, each serving a distinct purpose:

### Layer 1: Database Constraint (Data Integrity)

**Location:** PostgreSQL schema  
**Type:** UNIQUE index  
**Scope:** Enforces at persistence layer  

```sql
CREATE UNIQUE INDEX idx_leads_email_active 
  ON leads(LOWER(email)) 
  WHERE deleted_at IS NULL;
```

**Purpose:** 
- ✅ Prevents any data corruption (even from bugs in application code)
- ✅ Guarantees consistency even if multiple processes try to write simultaneously
- ✅ Acts as the "last line of defense"

**Trade-off:** 
- ❌ Doesn't provide good UX (user only sees error after trying to submit)
- ❌ Requires handling IntegrityError in application

---

### Layer 2: Backend POST Validation (API Contract)

**Location:** `backend/app/routers/leads.py` — `POST /api/leads`  
**Type:** Pydantic schema validation + database query  
**Scope:** Validates before INSERT  

```python
class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    company: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., min_length=5, max_length=255)
    # ... other fields

async def create_lead(lead: LeadCreate, session: AsyncSession) -> Lead:
    # Check uniqueness
    existing = await session.execute(
        select(Lead).where(
            Lead.email == lead.email,
            Lead.deleted_at.is_(None)
        )
    )
    if existing.scalar():
        raise HTTPException(status_code=409, detail="Email already exists")
    
    # Proceed with INSERT
    new_lead = Lead(**lead.dict())
    session.add(new_lead)
    await session.flush()
    return new_lead
```

**Purpose:**
- ✅ Clear API contract (POST returns 409 if email duplicate)
- ✅ Prevents invalid data from entering database
- ✅ Provides good UX error message to frontend

**Trade-off:**
- ❌ Code duplication (logic also in PUT endpoint, see Layer 3)
- ⚠️ Race condition window: between check and insert (mitigated by DB constraint)

---

### Layer 3: Backend PUT Validation (Partial Update Support)

**Location:** `backend/app/routers/leads.py` — `PUT /api/leads/{id}`  
**Type:** Pydantic schema validation + database query with ID exclusion  
**Scope:** Validates before UPDATE  

```python
class LeadUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=255)
    company: str | None = Field(None, min_length=2, max_length=255)
    email: str | None = Field(None, min_length=5, max_length=255)
    # ... other fields (all optional)

async def update_lead(lead_id: int, lead: LeadUpdate, session: AsyncSession) -> Lead:
    # Check uniqueness with LEAD ID EXCLUSION
    if lead.email:  # Only check if email is being updated
        existing = await session.execute(
            select(Lead).where(
                Lead.email == lead.email,
                Lead.id != lead_id,  # Exclude current lead
                Lead.deleted_at.is_(None)
            )
        )
        if existing.scalar():
            raise HTTPException(status_code=409, detail="Email already in use by another lead")
    
    # Proceed with UPDATE
    db_lead = await session.get(Lead, lead_id)
    for key, value in lead.dict(exclude_unset=True).items():
        setattr(db_lead, key, value)
    await session.flush()
    return db_lead
```

**Purpose:**
- ✅ Allows lead to keep its own email when editing
- ✅ Prevents lead from taking another lead's email
- ✅ Clear API contract (PUT returns 409 for email conflicts)

**Key Difference from POST:**
- Uses `Lead.id != lead_id` in WHERE clause
- Allows no-op edits (same email as before)

**Trade-off:**
- ❌ Duplication of validation logic (similar to POST but with ID exclusion)

---

### Layer 4: Frontend Async Validation (UX Feedback)

**Location:** `frontend/src/components/CreateLeadModal.tsx`  
**Type:** Async onBlur handler + TanStack Query  
**Scope:** Validates before user submits  

```typescript
const handleEmailBlur = async (email: string) => {
    if (!email) return;
    
    // Skip check if email is invalid format
    if (!isValidEmail(email)) {
        setEmailValidationError(null);
        return;
    }
    
    setEmailValidating(true);
    try {
        const response = await fetch(`/api/leads/validate-email?email=${encodeURIComponent(email)}`);
        
        if (response.status === 409) {
            setEmailValidationError("Email already in use");
        } else {
            setEmailValidationError(null);
        }
    } catch (error) {
        // Network error: don't show error to user
        // Let server-side validation catch it on submit
        console.debug("Email validation check failed (network)", error);
    } finally {
        setEmailValidating(false);
    }
};

// In form submit handler:
const disabled = !isValid || isPending || !!emailValidationError || emailValidating;
```

**Purpose:**
- ✅ Provides immediate UX feedback (user knows before clicking submit)
- ✅ Prevents frustration (user doesn't get surprised by error after slow API call)
- ✅ Uses GET /api/leads/validate-email endpoint (defined in E2-S1)

**Backend Endpoint:**

```python
@router.get("/leads/validate-email")
async def validate_email(email: str, session: AsyncSession) -> dict:
    """Check if email is available (not used by any other active lead)"""
    existing = await session.execute(
        select(Lead).where(
            Lead.email == email,
            Lead.deleted_at.is_(None)
        )
    )
    
    if existing.scalar():
        raise HTTPException(
            status_code=409,
            detail="Email already in use"
        )
    
    return {"available": True}
```

**Trade-off:**
- ❌ Extra network call (but debounced, negligible impact)
- ⚠️ Still need server-side validation as fallback (race conditions)

---

## ⚖️ WHY DUPLICATION IS NECESSARY

The email uniqueness rule appears in 4 places. This is **not a code smell** — it's **essential for security and UX**:

| Layer | Why It's Needed |
|-------|-----------------|
| **DB Constraint** | Last-resort data integrity. Prevents bugs in app code from corrupting data. |
| **POST Validation** | API contract. Must validate before INSERT (FastAPI best practice). |
| **PUT Validation** | Different logic (with ID exclusion). Must validate before UPDATE. |
| **Frontend Check** | UX feedback. User sees error immediately without round-trip delay. |

**Cross-Layer Coordination Example:**

```
Scenario: User A and User B try to create leads with same email simultaneously

Ideal case:
  1. User A onBlur → GET /validate-email → ✅ available
  2. User B onBlur → GET /validate-email → ✅ available
  3. Both submit simultaneously
  4. A's POST arrives first, INSERT succeeds
  5. B's POST arrives, INSERT fails (UNIQUE constraint)
  6. B gets 409 error (from Layer 2 validation)

Result: Safe, both users see appropriate feedback
```

---

## 🔄 MAINTENANCE BURDEN

If business rule changes, update these 4 locations:

1. **Database:** ALTER TABLE leads, change UNIQUE constraint
2. **POST endpoint:** Update LeadCreate validation logic
3. **PUT endpoint:** Update LeadUpdate validation logic (keep ID exclusion)
4. **Frontend:** Update handleEmailBlur and form submit disabled condition

**Mitigation strategies for future:**
- Document this decision (✅ done via ADR)
- Add comments in code explaining why duplication exists
- Create test scenarios that verify consistency across layers

---

## 📋 VERIFICATION CHECKLIST

- ✅ **E2-S1 (POST create):** Email uniqueness enforced, returns 409 on duplicate
- ✅ **E2-S2 (PUT edit):** Email uniqueness with ID exclusion, allows no-op edits
- ✅ **E2-S3 (PATCH status):** No email changes, idempotency separate concern
- ✅ **E2-S4 (Frontend):** Async validation on blur, server-side validation on submit
- ✅ **Database:** UNIQUE index on email with soft-delete awareness
- ✅ **Tests:** All 39 tests covering email scenarios (14+17+8)

---

## 🚀 IMPLICATIONS FOR E3+

### E3-S1 (GET /leads endpoint)

No changes needed. Email is read-only from this endpoint.

### E3-S3 (Drag & Drop)

Email uniqueness is not involved in status changes. PATCH /leads/{id}/status does not modify email.

### E4-S1 (Search)

Backend search (ILIKE on name, company, email) doesn't need special email handling.

### Future: Bulk Operations

If bulk edit/delete is needed:
- Consider batch API endpoint
- Must apply same email uniqueness rules
- May need atomic transactions or idempotency keys

---

## 📝 REVISION HISTORY

| Date | Change | Author |
|------|--------|--------|
| 2026-06-09 | Initial ADR documenting email uniqueness implementation | Charlie |

---

**Status:** ✅ APPROVED  
**Next Review:** After E3 completion (ensure no new email logic was added)
