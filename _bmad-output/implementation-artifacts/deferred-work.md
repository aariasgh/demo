# Deferred Work Log

## Deferred from: Code Review of E1-S2 (2026-06-07)

- **CASCADE behavior not documented** — `lead_id` foreign key has `ondelete="CASCADE"` which destroys audit trail when lead is deleted. Ensure this is documented in model docstring or separate runbook. *Deferral reason: Design decision, should be intentional but needs documentation.*

- **Status enum not implemented as Python Enum** — 4 values hardcoded in CHECK constraint. MVP acceptable, but consider Enum class for better type safety in E2+. *Deferral reason: MVP scope OK, scalability improvement for future stories.*

- **Missing reverse relationships in ORM** — `Lead` model lacks `audit_logs: Mapped[List[LeadAuditLog]]` reverse relationship. Improves DX but not blocking. *Deferral reason: Nice-to-have improvement, not affecting functionality.*
