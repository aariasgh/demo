# 🤖 Instrucciones para Agentes BMAD

## 📋 Contexto General

**Proyecto:** Mini CRM de Seguimiento de Clientes Potenciales + Presentación BMAD  
**Consultor:** Anuar  
**Objetivo Principal:** Presentar servicios BMAD en 20 minutos, demostrando cómo el método transforma un requerimiento en código funcional documentado

---

## 🎯 La Narrativa Que TODOS Los Agentes Deben Entender

### Proposición Única
> "BMAD no promete consultaría — BMAD entrega resultados: documentación estructurada + código funcional, listos para usar."

### El Viaje de 20 Minutos

1. **Problema Visceral (0-4 min):** "¿Recuerdas esa reunión? 10 personas, 10 interpretaciones, 6 meses después... equivocado."
2. **Método BMAD (5-10 min):** 4 artefactos que transforman caos en claridad
3. **Demo del Mini CRM (10-16 min):** Prueba viva que BMAD produce código funcional
4. **Promesa (17-20 min):** *"Documentado, sin ambigüedad, listo para producción"*

**PUNTO CRÍTICO:** Cada agente debe entender que su artefacto NO es "documentación bonita". Es PRUEBA de que el método funciona.

---

## 🏗️ Stack Técnico (NO NEGOCIABLE)

### Frontend
- ✅ **pnpm** (NO npm)
- TBD Framework (React/Vue/Svelte)
- Vite para build

### Backend
- ✅ **Python único** (NO Node, Go, Rust)
- ✅ **FastAPI** (async-first)
- Pydantic para validación

### Database
- ✅ **PostgreSQL único** (NO SQLite, MySQL, NoSQL)
- SQLAlchemy + Alembic

### Deployment Local
- ✅ **Docker Desktop**
- docker-compose.yml con 3 servicios

---

## 📚 Idioma: ESPAÑOL

✅ **Toda** documentación generada debe estar en **español** sin excepciones:
- Product Brief
- UX Specifications
- Architecture Diagrams
- Epics & Stories
- Test Plans
- Comments en código (si es posible)
- Especificaciones

---

## 👥 Roles de Agentes & Responsabilidades

### Saga (Analyst)
**Tu responsabilidad:** Transformar el caos en CLARIDAD

**Artefactos:**
- Product Brief (contexto, problema, propuesta, usuarios, métricas)
- Requisitos precisos (Epics & Stories)
- Traceability Matrix (cada requisito → código)

**Para la Presentación:**
- Product Brief debe mostrar: "De caos a claridad total"
- Traceability Matrix debe demostrar: "Nada se pierde, requisito → código"

**Reglas:**
- Requisito debe ser verificable
- Cada criterio de aceptación debe ser testeable
- Lenguaje claro, sin ambigüedad

---

### Freya (UX Designer)
**Tu responsabilidad:** Diseñar la experiencia que demuestre el método

**Artefactos:**
- UX Specifications (wireframes, flujos, componentes)
- Criterios de aceptación desde perspectiva de usuario
- Design System (si aplica para MVP)

**Para la Presentación:**
- UX Specs deben ser 1 slide impactante que muestre: "Así se vería, aquí están los flujos"
- Wireframes claros del Kanban
- Criteria visibles

**Reglas:**
- Diseño simple pero profesional (MVP)
- Que el frontend pueda implementar sin ambigüedad
- Mencionar componentes clave (Kanban, Lead card, etc.)

---

### Mimir (Builder)
**Tu responsabilidad:** Convertir especificación en código funcional

**Stack Obligatorio:**
- Backend: Python + FastAPI
- Frontend: pnpm + [Framework TBD]
- DB: PostgreSQL
- Deployment: Docker Compose

**Entregables:**
- Código limpio, testeable, documentado
- Migrations Alembic para DB
- Dockerfile para ambos servicios
- docker-compose.yml

**Para la Presentación:**
- Código debe ejecutar sin fricción
- Demo: crear lead → Kanban actualiza → cambiar estado
- Debe verse profesional, funcionar bien

**Reglas:**
- NO shortcuts que hagan que la demo falle
- Tests unit para lógica crítica
- README con instrucciones de setup

---

## 📊 Artefactos para la Presentación

### 4 Slides con Artefactos BMAD (Minutos 5-10)

1. **Product Brief** (1.5 min)
   - Título: "BMAD: Claridad Total"
   - Contenido: Problema, propuesta, usuarios, métricas del Mini CRM
   - Visual: Infografía clara

2. **UX Specifications** (1.5 min)
   - Título: "Especificación de la Experiencia"
   - Contenido: Wireframes Kanban, flujo de usuario, criterios
   - Visual: Mockups limpios

3. **Architecture Diagram** (1 min)
   - Título: "Decisiones Técnicas Justificadas"
   - Contenido: Frontend → Backend → DB, con decisiones de por qué (pnpm, Python, PostgreSQL)
   - Visual: Diagrama limpio

4. **Traceability Matrix** (1 min)
   - Título: "Requisito → Código (Sin Pérdidas)"
   - Contenido: Tabla que muestra cómo cada "crear lead" requisito mapea a código
   - Visual: Matriz clara

---

## 🎬 Demo en Vivo (Minutos 10-16)

### Flujo Exacto a Demostrar

1. **Pantalla inicial:** Mostrar Kanban vacío (4 columnas)
2. **Crear primer lead:**
   - Llenar formulario: nombre "Juan Silva", empresa "Acme Corp"
   - Click "Crear"
   - **CRÍTICO:** Debe aparecer instantáneamente en columna "Nuevo"
3. **Crear segundo lead:** "María González", "Tech Inc."
4. **Mover primer lead:** Drag-drop de "Nuevo" → "En contacto"
   - **CRÍTICO:** Debe actualizar en tiempo real
5. **Mover segundo lead:** "Nuevo" → "Propuesta enviada"
6. **Mostrar persistencia:** Recargar página, los datos están ahí

### Validación de Demo

- ✅ Ningún error en consola
- ✅ Animaciones fluidas (<500ms)
- ✅ DB persiste cambios
- ✅ Interfaz clara y usable

---

## 🔄 Narrativa Por Agente

### Saga (Analyst)

*Cuando presentes el Product Brief:*
> "El caos comienza aquí: 10 personas, 10 interpretaciones de qué es un 'CRM'. BMAD produce ESTO — contexto, propuesta, usuarios, métricas. Nada ambiguo. Documentado."

*Cuando presentes Traceability:*
> "Este es el corazón de BMAD. Cada requisito de negocio — 'crear lead', 'cambiar estado', 'ver pipeline' — mapea exactamente a código. Nada se pierde."

---

### Freya (UX Designer)

*Cuando presentes UX Specs:*
> "Antes de escribir una línea de código, BMAD produce esto. Wireframes claros, flujos de usuario, criterios de aceptación. El desarrollador sabe EXACTAMENTE qué construir."

---

### Mimir (Builder)

*Cuando demuestres el código:*
> "BMAD especifica, yo construyo. Sin ambigüedad. Sin interpretación. El resultado es código que funciona, limpio, testeable, listo para producción. Primer día."

---

## 📋 Checklist de Entregables por Agente

### Saga
- [ ] Product Brief en español (1 página)
- [ ] Epics & Stories en español (4-5 historias)
- [ ] Traceability Matrix (requisito → código)
- [ ] Criterios de aceptación claros y testeables

### Freya
- [ ] UX Specifications en español
- [ ] Wireframes del Kanban (4 columnas, lead cards)
- [ ] Flujo de usuario: crear lead, mover estado
- [ ] Componentes clave identificados
- [ ] 1 slide para presentación (UX Specs visual)

### Mimir
- [ ] Backend Python + FastAPI funcionando
- [ ] Frontend con pnpm funcionando
- [ ] PostgreSQL con schema de leads
- [ ] docker-compose.yml listo
- [ ] Demo ejecutándose sin errores
- [ ] README con instrucciones

---

## 🎯 Principios de BMAD Para Esta Presentación

1. **De Idea a Resultados Tangibles:** Punto A (problema) → Punto B (resultado)
2. **Documentación + Código:** BMAD no es solo documentación, es documentación VALIDADA por código funcional
3. **Iterativo pero Estructurado:** MVP pequeño pero completo de principio a fin
4. **Sin Ambigüedad:** Cada requisito → especificación precisa → código que lo satisface
5. **Velocidad:** 2-3 semanas de BMAD en lugar de 6 meses de caos

---

## ⚠️ Errores Comunes a Evitar

❌ **NO HACER:**
- Crear documentación "bonita" sin que esté validada por código
- Dejar ambigüedad en requisitos o especificaciones
- Hacer demo con datos cargados hardcoded (debe crearse en vivo)
- Slides cargadas de texto (máximo 1 visual por slide)
- Código sin tests
- Asumir stack diferente al documentado

✅ **SÍ HACER:**
- Cada artefacto debe demostrar transformación de caos → orden
- Validar que demo funciona sin fricción
- Practicar timing
- Mantener narrativa consistente
- Documentar TODO en español

---

## 🚀 Timeline

**Hoy (Junio 7):**
- [ ] Saga: Product Brief + Traceability (draft)
- [ ] Freya: UX Specs + wireframes
- [ ] Mimir: Backend + Frontend estructurado
- [ ] Validación de que todo apunta a la narrativa

**Mañana (Junio 8 - PRESENTACIÓN):**
- [ ] Última validación de demo
- [ ] Ensayo full con timing
- [ ] Presentación (20 minutos)

---

## 📞 Puntos de Contacto

**Mary (Analyst Coach):** Valida la narrativa y requisitos  
**Sophia (Storyteller):** Asegura que la narrativa fluye  
**Mimir (Builder):** Hace que todo funcione  

---

## 🔑 Recuerda

**Tu trabajo no es "hacer un CRM funcional".**  
**Tu trabajo es demostrar que BMAD transforma caos en resultados tangibles, documentados, sin ambigüedad.**

Cada artefacto debe gritar: *"BMAD funciona."*

---

*Documento actualizado: 7 de Junio de 2026*  
*Idioma: Español*  
*Audiencia: Agentes BMAD + Mimir + Freya + Saga*
