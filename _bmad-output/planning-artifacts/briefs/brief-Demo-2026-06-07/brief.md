---
title: "Product Brief: Mini CRM de Seguimiento de Clientes Potenciales"
status: ready
created: 2026-06-07
updated: 2026-06-07
document_type: "Product Brief"
audience: "BMAD Partner Demo + Development Team"
---

# Product Brief: Mini CRM de Seguimiento de Clientes Potenciales

## Executive Summary

Los equipos de venta pierden el **65% de leads potenciales** por fragmentación operacional: notas dispersas en OneNote, emails perdidos, llamadas sin registro, seguimiento manual errático. El Mini CRM centraliza el ciclo de vida del lead en una única fuente de verdad, permitiendo que los ejecutivos de venta capten, rastreen y cierren oportunidades sin fricción.

Este producto es también una demostración viva de la metodología **BMAD**: requirements claros → documentación estructurada → código funcional + tests → demo ejecutiva. El Mini CRM será presentado a partners estratégicos el 8 de junio como prueba de que BMAD no solo promete, entrega.

---

## The Problem

### La Realidad Hoy

Cuando un lead llega, el ejecutivo de venta:
1. Abre OneNote (o papel) y anota el nombre y contacto
2. Intenta llamar — si no contesta, no queda registro de nada
3. Envía un email — sin log de seguimiento
4. Recuerda (o olvida) hacer follow-up en 3-5 días
5. **Resultado:** 65% de los leads se pierden en la grieta de la fragmentación

El dolor es visceral: ejecutivos agotados sin poder alcanzar sus metas, oportunidades que nunca se ven, revenue predecible que desaparece.

### Por Qué Importa Ahora

Para un equipo de venta, **el orden es dinero.** Si cada lead se pierde por falta de sistema, el crecimiento no es un problema de producto o marketing — es un problema de operaciones. BMAD resuelve esto demostrando que el orden es posible en 72 horas.

---

## The Solution

### What Gets Built (MVP)

**Un CRM reducido, pero completo en su enfoque.** Centralización funcional para leads, sin distracciones:

**Interfaz Principal:**
- **Tabla "Mis Leads"** con columnas: Nombre, Empresa, Estado (New / Contacted / Follow-up / Closed), Última Interacción, Riesgo
- **Modal de Creación Rápida** (nombre + empresa + email + teléfono)
- **Timeline de Actividad** por lead: muestra última llamada, último email, anotaciones

**Automatización Esencial:**
- [ASSUMPTION] Dashboard de **"Leads en Riesgo"**: muestra automáticamente leads sin contacto en >7 días
- Cambio de estado (New → Contacted → Follow-up → Closed) en un click
- Historial completo de interacciones guardado por lead

**Backend:**
- API REST en FastAPI (async-first)
- PostgreSQL como fuente de verdad
- Alembic para migraciones seguras
- Validación y manejo de errores exhaustivo

---

## What Makes This Different

### BMAD es Serio

Este no es "un CRM bonito." Es una demostración pública de rigor:

1. **Documentación Estructurada** — especificación funcional, diagrama de API, diagrama ER
2. **Código Limpio** — arquitectura por capas, patrones async, error handling defensivo
3. **Tests Automáticos** — cobertura significativa (no token coverage, coverage real)
4. **Docker Listo** — reproduce el ambiente en cualquier máquina

Para partners: "Esto no es código de fin de semana. Es código de producción, documentado para ser transferible."

### El Diferencial

- **Velocidad:** De requirements a demo en <48 horas
- **Transferibilidad:** Tu equipo de partners puede tomar este código, entender cada decisión, y escalar
- **Prueba de Concepto Real:** No un prototipo — un sistema que funciona

---

## Who This Serves

**Usuario Primario: Ejecutivo de Venta**
- Necesita capturar leads rápidamente sin dejar la interfaz
- Necesita saber qué hacer después (¿cuándo fue la última llamada?)
- Necesita alertas automáticas sobre leads en riesgo (sin que tenga que revisar manualmente)
- **Éxito:** Cierra el 35% de los leads que hoy se pierden

**Audiencia Secundaria: Partner/Decisor**
- Necesita ver que BMAD es proceso + disciplina, no magia
- Necesita creer que código así se puede escalar a un sistema mayor
- **Éxito:** Confianza de que BMAD entrega

---

## Success Criteria

### V1 Lanzamiento (Demo 8 de Junio)

- [ ] Interfaz corre sin fricciones (tabla de leads + modal de creación + timeline visible)
- [ ] Datos persisten en PostgreSQL entre sesiones
- [ ] Estados cambian y se reflejan en tiempo real
- [ ] Dashboard de "Leads en Riesgo" es automático (sin refresh manual)
- [ ] API documentada (Swagger/OpenAPI)
- [ ] Tests ejecutan y pasan (>70% cobertura)
- [ ] Docker Compose levanta stack completo de cero en 1 comando

### Señales de Éxito de Usuario

- Ejecutivo crea 10 leads en <2 minutos
- Ejecutivo ve un lead con timeline completo de actividad
- Ejecutivo recibe alerta visual de lead en riesgo sin acción

### Señales de Éxito de Partner

- Partner entiende la arquitectura al verla documentada
- Partner siente que el código es "profesional, transferible"
- Partner pregunta "¿cuánto tiempo tardó construir esto?" y sorprende la respuesta

---

## Scope

### In V1

- ✅ CRUD de leads (crear, leer, actualizar, cambiar estado)
- ✅ Timeline de actividad por lead
- ✅ Dashboard de "Leads en Riesgo" (automático, sin acción manual)
- ✅ Autenticación mínima [ASSUMPTION: un login básico o sin autenticación para demo]
- ✅ UI impactante y responsive (mobile-first)
- ✅ API REST completa
- ✅ Documentación técnica (SPEC, ER diagram, diagrama de API)
- ✅ Tests e2e y unitarios
- ✅ Docker Compose (dev + prod-like)

### Out V1

- ❌ Reportes avanzados (pipeline analytics, forecasting)
- ❌ Integración con email/calendario
- ❌ Sistema de equipos/permisos complejos
- ❌ Mobile app nativa
- ❌ Capacidad de importar leads masivos (CSV)

---

## Vision

Si esto tiene éxito — si partners ven BMAD aquí y firman — el Mini CRM se convierte en:

**Fase 2:** Colaboración en equipo — asignación de leads, comentarios, alertas de actividad compartidas, reportes de pipeline

**Fase 3:** Integraciones — webhooks desde Slack, sincronización con calendario, importación desde LinkedIn/Hubspot

**Fase 4:** Análisis Predictivo — modelo que predice cuál es el lead con mayor probabilidad de cerrar

**Pero no ahora.** Ahora es: centralización, claridad, disciplina. Demostración viva de BMAD.

---

## Implementation Notes (for the dev team)

### Tech Stack (Locked)
- **Backend:** Python + FastAPI (async)
- **Database:** PostgreSQL + Alembic migrations
- **Frontend:** [ASSUMPTION: React/Next.js con Tailwind — TBD con equipo de UX]
- **DevOps:** Docker + Docker Compose
- **Testing:** pytest (backend) + [ASSUMPTION: Playwright o Cypress for e2e]

### Deployment
- Local: `docker-compose up`
- [ASSUMPTION] Production target: TBD (AWS/Heroku/other)

### Critical Non-Negotiables
- Zero ambiguity in the API contract (OpenAPI/Swagger)
- Every database mutation logged for audit
- Error handling that tells the user what went wrong (no generic 500s)
- All business logic testable and tested
