# Project Context: Mini CRM & BMAD Presentation

## 📋 Información del Proyecto

**Proyecto:** Mini CRM de Seguimiento de Clientes Potenciales + Presentación BMAD  
**Consultor:** Anuar  
**Fecha de Presentación:** 8 de Junio de 2026 (20 minutos)  
**Fase Actual:** Preparación de presentación + validación técnica  

---

## 🎯 Objetivo Estratégico

Presentar los servicios de consultoría bajo la metodología BMAD, demostrando con el Mini CRM cómo BMAD transforma un requerimiento de negocio en código producción documentado sin ambigüedad.

**Proposición Única:**
> "BMAD no promete consultaría — BMAD entrega resultados: documentación estructurada + código funcional, listos para usar."

---

## 🏗️ Arquitectura Técnica

### Stack de Desarrollo

**Frontend:**
- Node.js con **pnpm** como package manager (NO npm)
- Tecnología: [Especificar: React, Vue, Svelte, etc. - TBD con agentes]

**Backend:**
- **Python** como código único del backend (sin alternativas)
- Framework: FastAPI (recomendado para velocidad + async)
- Async patterns para operaciones I/O intensivas

**Base de Datos:**
- **PostgreSQL** como único motor de BD
- Migrations: Alembic + SQLAlchemy

**Deployment & Containerización:**
- **Docker Desktop** para desarrollo local
- Docker Compose para multi-contenedor (backend + DB + frontend)
- Producción: [TBD]

---

## 📊 Especificación Funcional (Mini CRM)

### MVP Funcionalidades

**CU-01: Crear Lead**
- Registro: nombre, empresa (campos básicos)
- Estado inicial: "Nuevo"
- Visible inmediatamente en la lista

**CU-02: Actualizar Estado del Lead**
- Estados permitidos: Nuevo → En contacto → Propuesta enviada → Cerrado
- Cambio manual por usuario
- Se refleja en tiempo real en el pipeline

**CU-03: Visualizar Pipeline**
- Vista Kanban con 4 columnas (una por estado)
- Leads agrupados por estado
- Información clara de cada lead

**CU-04: Editar Datos del Lead**
- Nombre, empresa
- Cambios persistidos en DB

### Estados del Proceso

```
Nuevo → En contacto → Propuesta enviada → Cerrado
```

### Criterios de Aceptación Globales

- ✅ Usuario puede crear y actualizar leads sin fricción
- ✅ Estado del lead siempre visible
- ✅ Pipeline refleja el estado real

### Fuera de Alcance (MVP)

- ❌ Integraciones con correo
- ❌ Automatización de seguimiento
- ❌ Reportes avanzados
- ❌ Multiusuario complejo

---

## 📁 Estructura del Proyecto

```
demo/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── db/
│   ├── migrations/             # Alembic
│   ├── requirements.txt         # Dependencias Python
│   ├── pyproject.toml           # Configuración del proyecto
│   └── Dockerfile
├── frontend/                    # Node + pnpm
│   ├── src/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── Dockerfile
│   └── [Build config]
├── docker-compose.yml          # Orquestación local
├── docs/
│   ├── Mini CRM de Seguimiento de Clien.md
│   ├── proyecto-presentacion-bmad.md
│   └── project-context.md
└── _bmad-output/               # Artefactos BMAD generados
    ├── design-artifacts/
    │   ├── A-Product-Brief/
    │   ├── B-Trigger-Map/
    │   ├── C-UX-Scenarios/
    │   ├── D-Design-System/
    │   └── E-Development/
    └── implementation-artifacts/
```

---

## 🔧 Configuración de Herramientas

### Node.js & pnpm

**Justificación:** pnpm es más rápido, eficiente en espacio y tiene mejor manejo de dependencias que npm.

```bash
# Instalación de pnpm (si no está)
npm install -g pnpm

# En el proyecto frontend:
pnpm install
pnpm run dev      # Desarrollo
pnpm run build    # Producción
```

### Python

**Versión:** Python 3.11+ (TBD confirmar con backend)  
**Gerenciador de dependencias:** pip (con requirements.txt) o poetry  
**Entorno virtual:** venv o uv  

```bash
# Crear entorno
python -m venv venv

# Activar
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt
```

### PostgreSQL & Docker

**Desarrollo local:**
```bash
docker-compose up -d
```

Levantará:
- Backend Python (puerto 8000)
- Frontend Node (puerto 3000)
- PostgreSQL (puerto 5432)

---

## 📚 Estándares de Documentación

### Idioma Único: Español

- ✅ Toda documentación generada por agentes BMAD: **español**
- ✅ Comentarios en código: **español**
- ✅ Especificaciones, epics, stories: **español**
- ✅ Mensajes de error/logs: **consideración a español si aplicable**

### Generación de Artefactos BMAD

Los siguientes artefactos se generarán en **español**:

1. **Product Brief:** Contexto, propuesta de valor, usuarios, métricas
2. **UX Specifications:** Wireframes, flujos, criterios de aceptación
3. **Architecture Diagram:** Decisiones técnicas, justificación
4. **Traceability Matrix:** Requisito → Especificación → Código → Test
5. **Epics & Stories:** Desglose del trabajo
6. **Test Plans:** Estrategia de QA

---

## 🎬 Artefactos Clave para la Presentación

### Artefactos a Mostrar (Minutos 5-10)

1. **Product Brief** (1.5 min)
   - Problema, propuesta de valor, usuarios objetivo
   - Métricas de éxito

2. **UX Specifications** (1.5 min)
   - Wireframes del Kanban
   - Flujos de usuario
   - Criterios de aceptación

3. **Architecture Diagram** (1 min)
   - Stack visual: Frontend Node → Backend Python → PostgreSQL
   - Componentes principales

4. **Traceability Matrix** (1 min)
   - Cómo cada "crear lead" requisito mapea a código específico
   - Demostra zero-ambigüedad

### Demo en Vivo (Minutos 10-16)

**Flujo a demostrar:**
1. Crear lead nuevo (nombre "Juan Silva", empresa "Acme Corp")
2. Verlo aparecer en Kanban (columna "Nuevo")
3. Mover a "En contacto"
4. Crear otro lead, mover a "Propuesta enviada"
5. Mostrar que todo funciona sin fricción

**Ambiente de demo:**
- Laptop con Docker Desktop ejecutando los contenedores
- Frontend accesible en `http://localhost:3000`
- Backend en `http://localhost:8000`
- DB PostgreSQL en `localhost:5432`

---

## 📈 Métricas de Éxito del Mini CRM

**Funcionales:**
- ✅ Crear lead en <2 segundos sin errores
- ✅ Kanban actualiza en tiempo real (<500ms)
- ✅ Cambiar estado sin perder datos
- ✅ Persistencia en PostgreSQL

**De Presentación:**
- ✅ Demo ejecuta sin fallos
- ✅ Transiciones fluidas entre slides y demo
- ✅ Audiencia comprende el viaje: Problema → Método → Resultado
- ✅ Frase de cierre resuena: *"Documentado, sin ambigüedad, listo para producción"*

---

## 🤝 Roles y Responsabilidades

**Anuar (Consultor Principal):**
- Narrativa y flujo de presentación
- Validación de que todo comunica el mensaje BMAD

**Agentes BMAD:**
- **Freya (UX Designer):** Especificaciones, wireframes
- **Mimir (Builder):** Código backend + frontend
- **Saga (Analyst):** Requisitos, product brief, traceability

**Entorno:**
- Docker Desktop: desarrollo local aislado
- GitHub: versionado de código + documentación

---

## 🚀 Timeline

**Hoy (Junio 7):**
- ✅ Documentar narrativa y contexto del proyecto
- ✅ Preparar artefactos BMAD iniciales
- ⏳ Validar Mini CRM en Docker

**Mañana (Junio 8):**
- ✅ Ensayo full de presentación con timing
- ✅ Prueba de demo en vivo
- ✅ Presentación (20 minutos)

---

## 📌 Reglas de Negocio

**Mini CRM:**
1. Todo lead DEBE tener un estado
2. No existen estados fuera de los 4 definidos
3. Estado inicial siempre es "Nuevo"
4. Flujo es lineal pero puede retroceder manualmente
5. Cambio de estado es inmediato y persistido

**Presentación:**
1. Máximo 20 minutos (no negociable)
2. Demo debe ser 6+ minutos de visibilidad
3. Narrativa: Problema → BMAD → Resultado (sin desvíos)
4. Frase de cierre no puede cambiar

---

## 🔑 Insights para Agentes

- **El método es el diferencial:** No es "mira este CRM", es "mira cómo el MÉTODO produce esto"
- **La documentación + código = prueba:** BMAD no promete, BMAD entrega artefactos
- **La velocidad es credibilidad:** 20 minutos demuestran que BMAD es rápido, preciso, documentado
- **Cada artefacto responde una pregunta:**
  - Product Brief: "¿Qué problema resolvemos?"
  - UX Specs: "¿Cómo se ve la solución?"
  - Architecture: "¿Cómo la construimos?"
  - Traceability: "¿Cómo validamos que todo mapea?"
  - Demo: "¿Funciona de verdad?"
