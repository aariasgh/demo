---
title: "React Query Optimistic Updates Pattern Guide"
created: "2026-06-12"
epic_context: "Lessons from Epic 4-S3 drag&drop bug"
version: "1.0"
---

# 🎯 React Query Optimistic Updates — Pattern Guide

> **Why This Guide Exists:** E4-S3 discovered a critical data structure mismatch that broke optimistic updates. This guide prevents recurrence in Epic 5 (Timeline) and future features.

---

## 📌 THE PROBLEM (E4-S3 Bug)

### What Went Wrong
```typescript
// ❌ BROKEN: Assumed query cache structure
const onMutate = async (newStatus) => {
  const previousLeads = queryClient.getQueryData(['leads']);
  
  queryClient.setQueryData(['leads'], (old: any) => ({
    ...old,
    data: old.data.map(lead =>
      lead.id === id ? { ...lead, status: newStatus } : lead
    )
  }));
};
```

**Error Thrown:**
```
TypeError: Cannot read properties of undefined (reading 'data')
```

**Why It Broke:**
- Code assumed query data structure: `{ data: [...], meta: {} }`
- **Actual structure:** Direct array `[...]`
- Result: `old.data` tried to access property on undefined

---

## ✅ THE FIX (Defensive Programming)

### Correct Pattern
```typescript
const onMutate = async (newStatus: string) => {
  // Backup existing data
  const previousLeads = queryClient.getQueryData(['leads']);
  
  // Update with defensive structure check
  queryClient.setQueryData(['leads'], (old: any) => {
    // Validate data structure - array vs. wrapped object
    if (!Array.isArray(old)) {
      console.warn('❌ Query data is not array:', typeof old);
      return old; // Don't modify if structure unexpected
    }
    
    // Safe to map over array
    return old.map(lead =>
      lead.id === id
        ? { ...lead, status: newStatus }
        : lead
    );
  });
  
  return { previousLeads };
};
```

**Why This Works:**
1. ✅ Checks if `old` is actually an array
2. ✅ Returns early if structure unexpected (safe fallback)
3. ✅ Only maps if we're sure it's an array
4. ✅ Logs warning if assumptions violated (for debugging)

---

## 🏗️ REACT QUERY DATA STRUCTURE DECISIONS

### Decision 1: Query Response Structure

**When creating a query that returns a list:**

**Option A: Direct Array (PREFERRED in our codebase)**
```typescript
// Backend returns: [lead1, lead2, lead3]
const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads');
      return res.json(); // Returns: Lead[]
    }
  });
};

// Query data structure: Lead[]
const data = useQuery(['leads']).data; // Type: Lead[] | undefined
```

**Option B: Wrapped Object (for metadata)**
```typescript
// Backend returns: { data: [...], meta: { total, offset } }
const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads');
      return res.json(); // Returns: { data: Lead[], meta: {} }
    }
  });
};

// Query data structure: { data: Lead[], meta: Meta }
const data = useQuery(['leads']).data; // Type: { data: Lead[], meta: Meta }
```

**Our Standard:**
- ✅ **Use Option A (Direct Array)** in Mini-CRM codebase
- Reason: Simpler state management, less nesting
- Backend returns: `[lead1, lead2, ...]`
- Frontend query cache stores: `[lead1, lead2, ...]`

### Decision 2: Mutation Optimization

**When using optimistic updates:**

```typescript
const mutation = useMutation({
  mutationFn: async (payload) => {
    const res = await fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  onMutate: async (newStatus) => {
    // STEP 1: Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: ['leads'] });
    
    // STEP 2: Snapshot old data for rollback
    const previousLeads = queryClient.getQueryData(['leads']);
    
    // STEP 3: Optimistically update cache
    queryClient.setQueryData(['leads'], (old: any) => {
      if (!Array.isArray(old)) return old;
      return old.map(lead =>
        lead.id === id ? { ...lead, status: newStatus } : lead
      );
    });
    
    // STEP 4: Return context for error handling
    return { previousLeads };
  },
  onSuccess: (data) => {
    // STEP 5: Success feedback
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    toast.success('Status updated');
  },
  onError: (error, variables, context) => {
    // STEP 6: Rollback on failure
    if (context?.previousLeads) {
      queryClient.setQueryData(['leads'], context.previousLeads);
    }
    toast.error('Failed to update status');
  }
});
```

**Pattern Breakdown:**
1. **cancelQueries** - Stop pending requests to prevent race conditions
2. **Snapshot** - Save old data for rollback
3. **setQueryData** - Update cache immediately (optimistic)
4. **Return context** - Pass rollback data to error handler
5. **invalidateQueries** - Refetch on success to sync with server
6. **Rollback** - Restore old data on error

---

## 🔍 DEBUGGING: HOW TO DETECT MISMATCHES

### Logging Checklist

Add these logs when implementing optimistic updates:

```typescript
onMutate: async (payload) => {
  const previousLeads = queryClient.getQueryData(['leads']);
  
  // DEBUG 1: What structure did we get?
  console.log('🔍 Query data type:', Array.isArray(previousLeads) ? 'array' : 'object');
  console.log('🔍 Query data keys:', Object.keys(previousLeads || {}));
  console.log('🔍 Query data:', previousLeads);
  
  queryClient.setQueryData(['leads'], (old: any) => {
    // DEBUG 2: Inside setQueryData, what did we receive?
    console.log('📊 Inside setQueryData - old type:', Array.isArray(old) ? 'array' : 'object');
    console.log('📊 Inside setQueryData - old:', old);
    
    if (!Array.isArray(old)) {
      console.warn('⚠️ STRUCTURE MISMATCH: Expected array, got:', typeof old);
      return old;
    }
    
    // DEBUG 3: Update successful
    console.log('✅ Optimistic update successful');
    return old.map(lead => 
      lead.id === id ? { ...lead, status: payload.new_status } : lead
    );
  });
}
```

**Expected Console Output (Correct):**
```
🔍 Query data type: array
🔍 Query data keys: (they're numeric indices, not keys)
🔍 Query data: [Lead{id:1,...}, Lead{id:2,...}]
📊 Inside setQueryData - old type: array
📊 Inside setQueryData - old: [Lead{id:1,...}, Lead{id:2,...}]
✅ Optimistic update successful
```

**Problem Console Output (Mismatch):**
```
🔍 Query data type: object
🔍 Query data keys: ['data', 'meta']
🔍 Query data: {data: [...], meta: {...}}
📊 Inside setQueryData - old type: object
📊 Inside setQueryData - old: {data: [...], meta: {...}}
⚠️ STRUCTURE MISMATCH: Expected array, got: object
```

---

## 📋 CODE REVIEW CHECKLIST

When reviewing React Query optimistic updates:

- [ ] **Data Structure** - Query returns array or wrapped object?
- [ ] **Defensive Check** - `if (!Array.isArray(old)) return old;` present?
- [ ] **Snapshot Saved** - Previous data captured in context?
- [ ] **Mutation Captured** - New payload logged for debugging?
- [ ] **setQueryData Correct** - Maps over correct structure?
- [ ] **invalidateQueries** - Called in onSuccess to sync?
- [ ] **Rollback Logic** - onError restores previousLeads?
- [ ] **Error Messages** - Toast/logs help debug failures?
- [ ] **Race Conditions** - cancelQueries called in onMutate?
- [ ] **Tests** - Optimistic + error paths covered?

---

## 🎯 PATTERN APPLICATION: EPIC 5-S1 (Timeline)

### E5-S1: Timeline de Actividad

**Likely Mutations in Timeline:**
```typescript
// Add event to timeline
useMutation({
  mutationFn: POST /api/leads/{id}/events
  payload: { event_type, description, timestamp }
})

// Delete event from timeline  
useMutation({
  mutationFn: DELETE /api/leads/{id}/events/{event_id}
})

// Update event
useMutation({
  mutationFn: PATCH /api/leads/{id}/events/{event_id}
  payload: { description, timestamp }
})
```

**Query Structure Decision (MUST FOLLOW):**
```typescript
// Option 1: Direct array of events
const useTimelineEvents = (leadId: number) => {
  return useQuery({
    queryKey: ['timeline', leadId],
    queryFn: async () => {
      const res = await fetch(`/api/leads/${leadId}/events`);
      return res.json(); // Returns: Event[]
    }
  });
};

// Option 2: Wrapped object with pagination
const useTimelineEvents = (leadId: number) => {
  return useQuery({
    queryKey: ['timeline', leadId],
    queryFn: async () => {
      const res = await fetch(`/api/leads/${leadId}/events?limit=50`);
      return res.json(); // Returns: { data: Event[], meta: {} }
    }
  });
};
```

**DECISION FOR E5-S1: Use Option 1 (Direct Array)**
- Consistency with E4 (leads array)
- Simpler state management
- If pagination needed later, wrap then

**Implementation Pattern for E5-S1:**
```typescript
const addTimelineEvent = useMutation({
  mutationFn: (newEvent) => POST /api/leads/{leadId}/events,
  onMutate: async (newEvent) => {
    await queryClient.cancelQueries({ queryKey: ['timeline', leadId] });
    const previous = queryClient.getQueryData(['timeline', leadId]);
    
    queryClient.setQueryData(['timeline', leadId], (old: any) => {
      // ✅ PATTERN FROM THIS GUIDE
      if (!Array.isArray(old)) return old;
      return [...old, { ...newEvent, id: 'temp-' + Date.now() }];
    });
    
    return { previous };
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['timeline', leadId] });
  },
  onError: (_, __, context) => {
    if (context?.previous) {
      queryClient.setQueryData(['timeline', leadId], context.previous);
    }
  }
});
```

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ Mistake 1: Assuming Structure Without Checking
```typescript
// WRONG
queryClient.setQueryData(['leads'], (old) => ({
  ...old,
  data: old.data.map(...) // ❌ Crashes if old is array
}));

// CORRECT
queryClient.setQueryData(['leads'], (old: any) => {
  if (!Array.isArray(old)) return old; // ✅ Check first
  return old.map(...);
});
```

### ❌ Mistake 2: Forgetting invalidateQueries
```typescript
// WRONG - UI never updates after success
onSuccess: () => {
  toast.success('Updated');
  // ❌ Missing: queryClient.invalidateQueries(...)
}

// CORRECT - Refetch to sync with server
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['leads'] });
  toast.success('Updated');
}
```

### ❌ Mistake 3: Not Handling Race Conditions
```typescript
// WRONG - Multiple requests might interfere
onMutate: async (newData) => {
  // ❌ Missing: cancelQueries
  queryClient.setQueryData(['leads'], ...);
}

// CORRECT - Cancel in-flight to prevent conflicts
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ['leads'] });
  queryClient.setQueryData(['leads'], ...);
}
```

### ❌ Mistake 4: Not Rolling Back on Error
```typescript
// WRONG - Error silently fails, UI left in weird state
onError: (error) => {
  console.error(error);
  // ❌ Missing: Rollback previousData
}

// CORRECT - Restore previous data
onError: (error, __, context) => {
  if (context?.previous) {
    queryClient.setQueryData(['leads'], context.previous);
  }
  toast.error('Failed to update');
}
```

---

## ✅ VALIDATION CHECKLIST FOR E5-S1

Before E5-S1 development starts:

- [ ] Query structure decision documented (array vs wrapped)
- [ ] Defensive structure checking code in place
- [ ] onMutate cancels queries + snapshots data
- [ ] setQueryData includes array validation
- [ ] onSuccess includes invalidateQueries
- [ ] onError includes rollback logic
- [ ] Debug logging present for troubleshooting
- [ ] Test cases cover: success, error, and race conditions
- [ ] Code review checklist customized for Timeline feature
- [ ] Team trained on pattern (link to this guide)

---

## 📚 RELATED DOCUMENTATION

- **FILTER_PATTERNS.md** - Zustand + React Query for filters
- **STORY_TEMPLATE.md** - Story structure standard
- **Code Review Standards** - Updated checklist with React Query validation

---

**Guide Status:** Ready for E5-S1 implementation  
**Last Updated:** 2026-06-12  
**Version:** 1.0  

**Next Step:** Share with Epic 5 development team before E5-S1 dev starts
