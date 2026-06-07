# 📄 Resumen Ejecutivo: Presentación BMAD 20 Minutos

**Fecha:** 8 de Junio de 2026 | **Duración:** 20 minutos | **Objetivo:** Vender servicios BMAD

---

## 🎯 La Idea en Una Frase

**"BMAD no promete consultaría — BMAD entrega: documentación estructurada + código funcional, listos para usar."**

---

## 📊 Arco de 20 Minutos

| Tiempo | Acto | Contenido | Narrativa |
|--------|------|----------|-----------|
| 0:00-4:00 | **I: Problema** | "¿Recuerdas esa reunión? 10 personas, 10 interpretaciones, 6 meses después... equivocado." | Caos de desarrollo tradicional |
| 5:00-10:00 | **II: Artefactos BMAD** | Product Brief → UX Specs → Architecture → Traceability | De caos a claridad |
| 10:00-16:30 | **II: Demo Mini CRM** | Crear lead → Kanban → Cambiar estado → Persistencia | Prueba viva funcional |
| 17:00-20:00 | **III: Promesa** | *"Documentado, sin ambigüedad, listo para producción"* | Cierre memorable |

---

## 🛠️ Stack (No Negociable)

- **Frontend:** pnpm (NO npm) + [Framework TBD]
- **Backend:** Python + FastAPI (único)
- **Database:** PostgreSQL (único)
- **Deploy:** Docker Compose

---

## 📋 4 Artefactos en Presentación

1. **Product Brief** → Problema, propuesta, usuarios
2. **UX Specifications** → Wireframes, flujos, criterios
3. **Architecture Diagram** → Stack + decisiones técnicas
4. **Traceability Matrix** → Requisito → Código (sin pérdidas)

---

## 🎬 Demo (6+ minutos)

**Flujo exacto:**
1. Kanban vacío (4 columnas)
2. Crear lead "Juan Silva" (Acme Corp) → aparece en "Nuevo"
3. Crear segundo lead → también en "Nuevo"
4. Mover primer lead a "En contacto" (debe actualizar en tiempo real)
5. Mover segundo a "Propuesta enviada"
6. Recargar → datos persisten

**Crítica:** Sin errores, sin fricción, actualizaciones < 500ms

---

## 📚 Idioma

✅ **TODO en ESPAÑOL** — Product Brief, UX Specs, Epics, Stories, Tests

---

## 👥 Responsabilidades por Agente

| Agente | Entrega | Validación |
|--------|---------|------------|
| **Saga** | Product Brief, Epics, Traceability | Requisitos claros, sin ambigüedad |
| **Freya** | UX Specs, Wireframes, Criterios | Diseño claro, buildeable |
| **Mimir** | Backend + Frontend + Docker | Demo funciona, código limpio |

---

## 🔑 Insigths Clave

- El método BMAD es el STAR (no el CRM específico)
- Cada artefacto debe demostrar transformación: Caos → Orden
- Demo es prueba de que BMAD produce código real
- Frase de cierre resuena: *"Sin ambigüedad"*

---

## ✅ Pre-Requisitos Demo

- [ ] Backend corriendo `localhost:8000`
- [ ] Frontend corriendo `localhost:3000`
- [ ] PostgreSQL accesible
- [ ] Crear lead sin errores
- [ ] Kanban actualiza en vivo
- [ ] Estado persiste en DB

---

## 🚀 Timeline

**Hoy:** Documentar + Artefactos draft  
**Mañana:** Último ensayo + Presentación

---

**Lectura Adicional:** Ver `proyecto-presentacion-bmad.md`, `stack-tecnico.md`, `instrucciones-agentes.md`
