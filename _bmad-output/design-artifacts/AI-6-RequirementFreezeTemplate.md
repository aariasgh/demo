---
title: "Requirement Freeze Template"
author: "Alice (Product Owner)"
date: 2026-06-15
category: "Process Template"
status: "DOCUMENTED"
owner_team: ["Product", "Management"]
---

# AI-6: Requirement Freeze Template

## Overview

Template for freezing requirements at the beginning of each sprint/epic. Prevents mid-development changes that cause rework and scope creep.

**Lesson from Epic 5 & 6:** Epic 5 suffered from requirement changes mid-dev. Epic 6 froze requirements and zero changes occurred, improving efficiency by ~20%.

---

## Template

```yaml
# ============================================================
# REQUIREMENT FREEZE DOCUMENT
# ============================================================

project: "Demo - Mini CRM de Seguimiento de Clientes"
epic: "Epic N: [Epic Title]"
frozen_date: "YYYY-MM-DD"
frozen_by: "[Product Owner Name]"
valid_until: "[Epic Completion Date or Sprint End]"
version: "1.0 - FINAL"

# ============================================================
# FROZEN REQUIREMENTS
# ============================================================

frozen_scope:
  - Story N-S1: [Story Title]
  - Story N-S2: [Story Title]
  - Story N-S3: [Story Title]
  # ... list all stories in epic

total_points: XX

# ============================================================
# CHANGE CONTROL PROCESS
# ============================================================

change_control_policy: |
  ANY changes to frozen requirements MUST:
  1. Be documented in CHANGE_REQUEST.md (at project root)
  2. Be approved by Product Owner AND Project Lead
  3. Include impact analysis: time cost, scope impact, technical debt
  4. Be communicated to development team BEFORE work begins
  5. Result in formal Change Request logged in this document

# Example Change Request:
# CR-1: Add "Export to CSV" feature in E6-S1
#   Requested by: Alice (PO)
#   Impact: +4 points, pushes delivery to 2026-06-16 18:00
#   Status: APPROVED (2026-06-14 14:30 by Anuar)

change_requests: []  # Populated if changes occur

# ============================================================
# ACCEPTANCE GATES
# ============================================================

acceptance_before_dev_start:
  - [ ] All Acceptance Criteria written
  - [ ] All stories have AC examples
  - [ ] No ambiguous terminology
  - [ ] Technical designs reviewed
  - [ ] Dependency map created
  - [ ] Risk assessment completed
  - [ ] Team capacity verified
  - [ ] Stakeholder sign-off obtained

team_sign_off: |
  I acknowledge that I have reviewed all frozen requirements and 
  understand the scope, dependencies, and acceptance criteria.

dev_lead_signature: "[Developer Name], [Date]"
qa_lead_signature: "[QA Name], [Date]"
product_owner_signature: "[PO Name], [Date]"
project_lead_signature: "[Lead Name], [Date]"

# ============================================================
# NOTES
# ============================================================

notes: |
  - No new features after this date without formal Change Request
  - Focus is delivery and quality of current scope
  - If change arrives, assess impact before development
  - Communication is key: unclear requirements = delays
```

---

## Usage in Sprint Planning

### Step 1: Create Document

```yaml
# File: epic-6-requirements-frozen.yaml
project: "Demo - Mini CRM de Seguimiento de Clientes"
epic: "Epic 6: UX/UI, Responsivo y Accesibilidad"
frozen_date: "2026-06-13"
frozen_by: "Alice (Product Owner)"
valid_until: "2026-06-15"
version: "1.0 - FINAL"
```

### Step 2: List All Requirements

```yaml
frozen_scope:
  - E6-S1: Diseño Responsivo (Mobile, Tablet, Desktop) - 8 pts
  - E6-S2: Animaciones y Feedback - 8 pts
  - E6-S3: Accesibilidad Base (WCAG AA) - 5 pts
  - E6-S4: Keyboard Navigation (11 shortcuts) - 8 pts
  - E6-S5: Code-Splitting y Lazy Loading - 5 pts
  - E6-S6: E2E Accessibility Tests - 8 pts

total_points: 42
```

### Step 3: Get Signatures

**Amelia (Developer Lead):** "I understand all requirements. No new features will be added without change control."  
**Dana (QA Lead):** "I've reviewed AC. Test strategy is clear."  
**Alice (Product Owner):** "These requirements are final. No scope changes."  
**Anuar (Project Lead):** "Approved. Scope is frozen until 2026-06-15."

### Step 4: Communicate to Team

**Team Meeting:** "Epic 6 requirements are now frozen. If new ideas arise, file a Change Request instead of interrupting development."

---

## What Changes Are Allowed?

### ✅ ALLOWED (No Change Request)
- Bug fixes discovered during development
- Technical improvements that don't change acceptance criteria
- Documentation corrections
- Test refinements (same AC, clearer tests)

### ❌ NOT ALLOWED (Requires Change Request)
- New features added to story
- Modified acceptance criteria
- Scope expansion
- Different technology choices
- New stories added to epic
- Story point estimates increased

---

## Example Change Request

If stakeholder asks to add "Export to CSV" to E6-S2:

```yaml
change_request:
  id: "CR-001"
  title: "Add Export to CSV to Error State"
  requested_by: "Stakeholder Name"
  requested_date: "2026-06-14"
  description: |
    Stakeholder wants ability to export error logs to CSV
    for compliance audit trail
  
  impact_analysis:
    effort_estimate: "4 additional story points"
    timeline_impact: "Pushes delivery to 2026-06-16 18:00"
    technical_debt: "None - straightforward feature"
    risk_level: "LOW (isolated to E6-S2)"
  
  recommendation: "Approve - low effort, high stakeholder value"
  
  approvals:
    product_owner: "Alice, 2026-06-14 14:00 - APPROVED"
    project_lead: "Anuar, 2026-06-14 14:15 - APPROVED"
    developer_lead: "Amelia, 2026-06-14 14:30 - APPROVED"
  
  outcome: "APPROVED - Adding 4 points to E6-S2"
```

---

## Epic 5 → Epic 6 Comparison

### Epic 5 (No Requirement Freeze)
- Changes mid-development: 3 times
- Rework hours: ~8 hours
- Team frustration: HIGH
- Delivery confidence: LOW

### Epic 6 (With Requirement Freeze)
- Changes mid-development: 0 times
- Rework hours: 0 hours
- Team frustration: LOW
- Delivery confidence: HIGH

**Lesson:** Frozen requirements = predictable delivery.

---

## Checklist for Epic 7

Before Epic 7 begins:
- [ ] Create `epic-7-requirements-frozen.yaml`
- [ ] List all E7 stories and AC
- [ ] Get team sign-off
- [ ] Communicate freeze date to stakeholders
- [ ] Create CHANGE_REQUEST.md process doc
- [ ] Set up Change Request review cadence (daily standup)
- [ ] Post freeze document in team Slack/Wiki

---

**Status:** ✅ TEMPLATE DOCUMENTED  
**Last Updated:** 2026-06-15  
**Owner:** Alice (Product Owner)  
**Next Application:** Epic 7 (2026-06-18)
