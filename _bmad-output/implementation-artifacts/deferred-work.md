# Deferred Work Log

## Deferred from: Code Review of E1-S2 (2026-06-07)

- **CASCADE behavior not documented** — `lead_id` foreign key has `ondelete="CASCADE"` which destroys audit trail when lead is deleted. Ensure this is documented in model docstring or separate runbook. *Deferral reason: Design decision, should be intentional but needs documentation.*

- **Status enum not implemented as Python Enum** — 4 values hardcoded in CHECK constraint. MVP acceptable, but consider Enum class for better type safety in E2+. *Deferral reason: MVP scope OK, scalability improvement for future stories.*

- **Missing reverse relationships in ORM** — `Lead` model lacks `audit_logs: Mapped[List[LeadAuditLog]]` reverse relationship. Improves DX but not blocking. *Deferral reason: Nice-to-have improvement, not affecting functionality.*

## Deferred from: Code Review of E2-S2 (2026-06-07)

- **No se pueden limpiar campos opcionales (phone/notes) a NULL** — `LeadUpdate` usa `Optional[...]=None`, así que `{"notes": null}` es indistinguible de un campo ausente y el guard `is not None` impide borrar valores existentes. *Deferral reason: Aceptable para el MVP; el spec no lo requiere. Usar `model_fields_set`/`exclude_unset` en story futura.*

- **Unicidad de email case-sensitive** — `Juan@x.com` y `juan@x.com` se tratan como distintos (sin `lower()`/citext ni `func.lower()` en query ni constraint). Permite duplicados lógicos. *Deferral reason: Pre-existente en modelo Lead/create_lead, no introducido por E2-S2.*

- **Filtro soft-delete (Decision #5) no aplicado** — Las queries de unicidad no incluyen `WHERE deleted_at IS NULL` y el modelo `Lead` no tiene columna `deleted_at`. *Deferral reason: Requiere cambio de schema; el spec lo marca como future-ready.*

- **Regex de email permisivo** — Acepta formatos inválidos como `a@b..com`, `.a@x.com`, `a@-x.com`. *Deferral reason: Pre-existente en LeadBase (mismo regex en create).*

- **Whitespace no normalizado en phone/email** — Solo `name`/`company` reciben strip; phone/email se guardan verbatim. *Deferral reason: Pre-existente en LeadBase.*

- **Falta `extra="forbid"` en LeadUpdate** — Campos no declarados (`status`, `id`, `created_at`) se ignoran silenciosamente con 200 OK, enmascarando errores del cliente. *Deferral reason: El spec se cumple (status no es editable); endurecimiento opcional que rompería clientes que envían campos extra.*

- **Semántica string-vacío vs NULL** — `notes`/`phone` pueden quedar como `""` o `None` sin normalización, creando dos estados "vacío". *Deferral reason: Consistencia de datos menor, no bloqueante.*

- **Validadores custom ensombrecidos por constraints de `Field`** (descubierto durante el patching de E2-S2) — En `LeadUpdate`, `name`/`company` tienen `min_length=2` y `notes` tiene `max_length=1000` a nivel de `Field`. Pydantic evalúa esas constraints ANTES que los validadores `@field_validator` custom, así que `not_empty_after_strip` y `validate_notes_length` (con sus mensajes amigables "cannot be empty..." / "notes cannot exceed...") nunca disparan para esos casos — el mensaje real es el genérico de Pydantic ("String should have at least 2 characters"). *Deferral reason: El rechazo 422 es correcto; solo el texto del mensaje difiere. Resolver eligiendo una sola fuente (quitar la constraint de Field y dejar el validador custom como autoridad, o aceptar el mensaje de Pydantic).*
