---
document_type: Epics_and_User_Stories
version: 2.0
date: 2026-06-07
project_name: "Demo - Mini CRM de Seguimiento de Clientes"
audience: "Equipo de Desarrollo, QA, Product Manager, Stakeholders"
status: "DETALLE FINAL - LISTO PARA SPRINT"
total_epics: 8
total_stories: 26
total_story_points: 144
---

# 📚 EPICS & USER STORIES DETALLADAS
## Mini CRM de Seguimiento de Clientes Potenciales

**Versión:** 2.0  
**Fecha:** 2026-06-07  
**Plazos:** 48 horas hasta demostración (2026-06-08 09:00)  
**Equipo:** 1 Developer Full-stack + 1 QA Automation  

---

## 📊 RESUMEN EJECUTIVO

### Estructura General
- **Total de Epics:** 8
- **Total de User Stories:** 26
- **Estimación Total:** 144 Story Points
- **Duración Estimada:** 48 horas (2 días)
- **Distribución:**
  - Epic 1 (Setup): 4 stories, 42 pts
  - Epic 2 (CRUD Leads): 4 stories, 47 pts
  - Epic 3 (Kanban): 3 stories, 34 pts
  - Epic 4 (Búsqueda/Alertas): 3 stories, 21 pts
  - Epic 5 (Timeline/Auditoría): 2 stories, 13 pts
  - Epic 6 (UX/Responsivo): 3 stories, 21 pts
  - Epic 7 (Performance): 3 stories, 13 pts
  - Epic 8 (Testing/Docs): 3 stories, -3 pts (tasks, no estimation)

### Criterios de Éxito Global
✓ Stack técnico completamente dockerizado y funcional  
✓ CRUD de leads 100% operacional con validaciones  
✓ Dashboard Kanban interactivo y responsivo  
✓ >70% cobertura de testing  
✓ Documentación y demo runbook listos  
✓ 0 errores críticos en log de aplicación  

---

## 🏗️ EPIC 1: INFRAESTRUCTURA Y SETUP
**Goal:** Establecer stack técnico completo, listo para desarrollo sin fricciones  
**Duración:** 8 horas (Day 1)  
**Criterio de Éxito:** `docker-compose up` levanta 3 servicios sin errores

---

### 📌 STORY 1.1: Setup FastAPI Backend + PostgreSQL + Docker

**ID:** E1-S1  
**Tipo:** Technical Setup  
**Story Points:** 13  
**Prioridad:** P0 (Blocker)  
**Asignado a:** Developer Full-stack  

**Como** desarrollador,  
**quiero** tener un backend FastAPI con PostgreSQL local dockerizado,  
**para que** pueda desarrollar y testear la API sin problemas de dependencias.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: FastAPI Backend + PostgreSQL Docker Setup
  
  Scenario: Docker Compose levanta servicios sin errores
    Given que clono el repositorio en mi máquina
    When ejecuto "docker-compose up"
    And espero 15 segundos para que los servicios se inicien
    Then el backend FastAPI está disponible en "http://localhost:8000"
    And PostgreSQL está disponible en "localhost:5432"
    And no hay errores en los logs (exit codes = 0)
  
  Scenario: Swagger UI está accesible
    Given que FastAPI está corriendo en puerto 8000
    When accedo a "http://localhost:8000/docs"
    Then veo Swagger UI con documentación OpenAPI
    And puedo ver los endpoints listados en el spec
  
  Scenario: Health check endpoint funciona
    Given que el backend está corriendo
    When hago "GET /api/health"
    Then recibo respuesta 200 OK
    And el body es "{ "status": "ok", "timestamp": "2026-06-07T..." }"
  
  Scenario: PostgreSQL conexión exitosa
    Given que PostgreSQL está en el contenedor
    When el backend intenta conectar a la BD
    Then la conexión es exitosa (pool de 20 conexiones)
    And SQLAlchemy engine está configurado con asyncpg
  
  Scenario: Persistencia de datos en Docker
    Given que ejecuto "docker-compose down"
    When vuelvo a ejecutar "docker-compose up"
    Then los volúmenes de PostgreSQL persisten
    And la BD no se borra al reiniciar
    And puedo verificar datos anteriores en la BD
  
  Scenario: Hot reload en desarrollo
    Given que docker-compose está corriendo en background
    When edito un archivo en src/ del backend
    Then el servidor auto-recarga sin detener el contenedor
    And no pierdo la conexión con PostgreSQL
```

#### Tareas Técnicas
- [ ] Crear Dockerfile para FastAPI (multi-stage, <500MB)
- [ ] Crear docker-compose.yml con 3 servicios: backend, frontend, postgres
- [ ] Crear .env.example con variables requeridas
- [ ] FastAPI app básica con health check endpoint
- [ ] Configurar SQLAlchemy con asyncpg driver
- [ ] Configurar connection pool (min: 5, max: 20)
- [ ] Añadir healthcheck directive en docker-compose
- [ ] Crear Makefile con targets útiles

#### Definición de Hecho (DoD)
- [x] Dockerfile builds sin warnings
- [x] docker-compose.yml es válido (pasa validación yaml)
- [x] Todos los servicios tienen health checks
- [x] Auto-reload funciona en desarrollo
- [x] Logs son estructurados y legibles (no spam)
- [x] README contiene setup instructions
- [x] .env.example está completo y comentado
- [x] No hay secrets hardcodeados

#### Testing
- [ ] Manual: `docker-compose up` desde 0
- [ ] Manual: Verificar endpoints accesibles
- [ ] Manual: Verificar logs en tiempo real

#### Notas
- Por ahora, sin autenticación (demo simplificada)
- No deployar a producción en this story
- Hot reload debe usar volumen mount, no rebuild

---

### 📌 STORY 1.2: Diseño e Implementación del Schema PostgreSQL

**ID:** E1-S2  
**Tipo:** Database Schema  
**Story Points:** 8  
**Prioridad:** P0 (Blocker)  
**Asignado a:** Developer Full-stack  

**Como** desarrollador,  
**quiero** tener un schema PostgreSQL completo con migraciones Alembic,  
**para que** la BD esté estructurada y optimizada desde el inicio.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: PostgreSQL Schema Design & Alembic Migrations
  
  Scenario: Alembic crea tablas principales
    Given que PostgreSQL está corriendo
    When ejecuto "alembic upgrade head"
    Then el comando finaliza sin errores
    And existen las tablas: leads, lead_audit_log, users
    And todas las tablas tienen índices requeridos
  
  Scenario: UNIQUE constraint en email
    Given que la tabla leads existe
    When intento insertar dos leads con mismo email
    Then la inserción falla con UNIQUE constraint violation (código 23505)
    And el mensaje de error es claro y específico
  
  Scenario: Índices están creados
    Given que la tabla leads existe
    When inspecciono los índices con psql
    Then existen índices en: leads(email), leads(status), leads(updated_at)
    And los índices son B-tree (default)
  
  Scenario: Tabla audit log tiene estructura correcta
    Given que la tabla lead_audit_log existe
    When inspecciono su estructura con \d lead_audit_log
    Then tiene columnas: id, lead_id, event_type, old_value, new_value, description, created_by_id, created_at, metadata
    And los tipos de datos son correctos (SERIAL, UUID, VARCHAR, JSONB, TIMESTAMP)
  
  Scenario: Migraciones son reversibles
    Given que tengo la primera migración aplicada
    When ejecuto "alembic downgrade -1"
    Then las tablas se eliminan sin errores
    And puedo ejecutar "alembic upgrade" nuevamente exitosamente
```

#### Tareas Técnicas
- [ ] Inicializar Alembic en el proyecto
- [ ] Crear env.py configurado para asyncpg
- [ ] Escribir primera migración con tablas:
  - `leads`: id (SERIAL PK), name (VARCHAR 255), company (VARCHAR 255), email (VARCHAR 255 UNIQUE), phone (VARCHAR 20), status (ENUM), created_at (TIMESTAMP), updated_at (TIMESTAMP), notes (TEXT)
  - `lead_audit_log`: id (SERIAL PK), lead_id (INT FK), event_type (VARCHAR), old_value (JSONB), new_value (JSONB), description (TEXT), created_by_id (INT), created_at (TIMESTAMP), metadata (JSONB)
  - `users`: id (SERIAL PK), username (VARCHAR 255 UNIQUE), password_hash (VARCHAR), created_at (TIMESTAMP)
- [ ] Crear índices: email, status, updated_at
- [ ] Crear UNIQUE constraint en email
- [ ] Crear ENUM para status: 'Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'
- [ ] Crear seed migration (o separado) con usuario demo

#### Definición de Hecho (DoD)
- [x] Migration names siguen convención: `YYYYMMDD_HHMM_description.py`
- [x] Todas las tablas tienen timestamps (created_at, updated_at)
- [x] UNIQUE constraints están en su sitio
- [x] Foreign keys correctamente definidas
- [x] Default values configurados (ej: status='Nuevo')
- [x] Downgrade reversible sin pérdida de lógica
- [x] No hay hardcoded IDs (usar SERIAL)

#### Testing
- [ ] `alembic upgrade head` funciona
- [ ] `alembic downgrade -1` funciona
- [ ] `SELECT * FROM pg_indexes WHERE tablename='leads'` muestra índices
- [ ] `INSERT INTO leads(...) VALUES(...); INSERT INTO leads(...) VALUES(...);` falla si emails duplicados

#### Notas
- JSONB en old_value/new_value permite futuro análisis de cambios
- No seed data en esta story (irá en Epic 8)
- Usuarios: dejar hardcoded por ahora (demo)

---

### 📌 STORY 1.3: Setup React Frontend + TypeScript + State Management

**ID:** E1-S3  
**Tipo:** Technical Setup  
**Story Points:** 13  
**Prioridad:** P0 (Blocker)  
**Asignado a:** Developer Full-stack  

**Como** desarrollador frontend,  
**quiero** tener un proyecto React con TypeScript, Zustand, TanStack Query y Tailwind,  
**para que** tenga base sólida para desarrollar componentes.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: React Frontend Stack Setup

  Scenario: Frontend carga sin errores
    Given que ejecuto "docker-compose up" incluido frontend
    When accedo a "http://localhost:3000"
    Then la página carga exitosamente
    And veo el título "Mini CRM de Seguimiento de Leads"
    And console del navegador no tiene errores críticos

  Scenario: Estructura de proyecto existe
    Given que el frontend está corriendo
    When inspecciono la estructura de archivos
    Then existen carpetas: src/components/, src/hooks/, src/store/, src/pages/, src/types/
    And existe src/App.tsx como punto de entrada
    And existe vite.config.ts con configuración correcta

  Scenario: Build produce bundle optimizado
    Given que ejecuto "npm run build" o "pnpm build"
    When el build finaliza sin errores
    Then la carpeta dist/ existe con archivos: index.html, assets/
    And el bundle total <2MB (comprimido)
    And no hay warnings sobre unsupported imports

  Scenario: Linter está configurado
    Given que ejecuto "npm run lint"
    When se ejecuta ESLint
    Then no hay errores de código (0 violations)
    And el formato está consistente

  Scenario: TanStack Query está integrado
    Given que importo useQuery de TanStack Query
    When uso useQuery para fetch datos
    Then la query se ejecuta automáticamente
    And los resultados se cachean
    And refetch funciona correctamente

  Scenario: Zustand store funciona
    Given que importo la store de Zustand
    When creo un hook useLeadsStore()
    Then puedo acceder a estado y acciones (getState, setState)
    And los cambios se propagan a componentes suscritos

  Scenario: CORS comunicación con backend
    Given que el frontend intenta conectar a API backend
    When hace un request a "http://localhost:8000/api/leads"
    Then recibe la respuesta correctamente
    And los headers CORS están configurados en backend
```

#### Tareas Técnicas
- [ ] Setup Vite con React 18 + TypeScript
- [ ] Instalar dependencias: zustand, @tanstack/react-query, tailwindcss, @headlessui/react
- [ ] Configurar Tailwind CSS
- [ ] Crear structure: components/, hooks/, store/, pages/, types/, services/
- [ ] Setup ESLint + Prettier
- [ ] Crear types/index.ts con tipos principales (Lead, LeadStatus, etc.)
- [ ] Crear store/leadsStore.ts con Zustand
- [ ] Crear hooks/useLeads.ts que use TanStack Query
- [ ] Configurar API client con axios/fetch y .env.local
- [ ] Crear Dockerfile para frontend (multi-stage)
- [ ] Crear docker-compose entry para frontend service

#### Definición de Hecho (DoD)
- [x] TypeScript strict mode está habilitado
- [x] Tailwind está configurado con purge/content paths
- [x] No hay console errors o warnings
- [x] Build size <2MB
- [x] ESLint 0 violations
- [x] .env.local.example existe con VITE_API_BASE_URL
- [x] Dockerfile frontend es multi-stage

#### Testing
- [ ] Navegador carga página sin errores
- [ ] `npm run lint` pasa
- [ ] `npm run build` pasa sin warnings
- [ ] Bundle tamaño verificado

#### Notas
- Por ahora, componentes pueden ser placeholders (full impl. en Epic 3)
- Zustand store simplificado (solo estructura)
- API_BASE_URL via .env.local

---

### 📌 STORY 1.4: Docker Compose Integración y Ambiente Local

**ID:** E1-S4  
**Tipo:** DevOps/Deployment  
**Story Points:** 8  
**Prioridad:** P0 (Blocker)  
**Asignado a:** Developer Full-stack  

**Como** desarrollador,  
**quiero** que un único comando `docker-compose up` levante el stack completo,  
**para que** cualquiera pueda correr el proyecto sin fricción.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Docker Compose Full Stack Integration

  Scenario: Un comando levanta todo el stack
    Given que clono el repositorio
    When ejecuto "docker-compose up" desde la raíz
    And espero 20 segundos
    Then los 3 servicios están disponibles:
    | service   | url                    | status |
    | Frontend  | http://localhost:3000  | 200    |
    | Backend   | http://localhost:8000  | 200    |
    | Swagger   | http://localhost:8000/docs | 200 |
    | PostgreSQL| localhost:5432         | ready  |
    And no hay errores en los logs
    And todo está listo para usar

  Scenario: Hot reload en backend
    Given que docker-compose está corriendo
    When edito un archivo en backend/app/main.py
    Then el servidor detecta el cambio automáticamente
    And recarga sin detener el contenedor
    And los request siguen llegando sin downtime

  Scenario: Hot reload en frontend
    Given que docker-compose está corriendo
    When edito un archivo en frontend/src/App.tsx
    Then Vite detecta el cambio automáticamente
    And el navegador recarga la página (HMR)
    And el estado de la aplicación se preserva

  Scenario: Datos persisten entre reinicios
    Given que docker-compose está corriendo
    When creo un lead en la aplicación
    And ejecuto "docker-compose down"
    And luego ejecuto "docker-compose up" nuevamente
    Then el lead que creé sigue existiendo
    And la BD no fue eliminada

  Scenario: Logs son accesibles
    Given que docker-compose está corriendo
    When ejecuto "docker-compose logs -f backend"
    Then veo los logs en tiempo real
    And incluyen: timestamp, service name, log level, message
    And cuando hago un request, veo el log correspondiente
```

#### Tareas Técnicas
- [ ] Completar docker-compose.yml con:
  - Backend service: build: ./backend, ports: 8000:8000, volumes: ./backend:/app/backend
  - Frontend service: build: ./frontend, ports: 3000:3000, volumes: ./frontend:/app/frontend
  - PostgreSQL service: image: postgres:15, ports: 5432:5432, volumes: postgres_data:/var/lib/postgresql/data, environment: POSTGRES_PASSWORD=postgres
  - Networks entre servicios
  - Healthchecks para cada servicio
- [ ] Crear .env con variables requeridas
- [ ] Crear docker-compose.override.yml para desarrollo (opcional)
- [ ] Crear Makefile con targets:
  - `make up`: docker-compose up -d
  - `make down`: docker-compose down
  - `make logs`: docker-compose logs -f
  - `make logs-backend`: docker-compose logs -f backend
  - `make reset`: down + remove volumes + up
  - `make shell-backend`: exec backend bash
  - `make db-reset`: reset database
- [ ] Verificar CORS está habilitado en backend para http://localhost:3000
- [ ] Crear docker/.dockerignore files para ambos servicios

#### Definición de Hecho (DoD)
- [x] docker-compose.yml pasa validación (docker-compose config)
- [x] Todos los servicios tienen healthchecks
- [x] Volúmenes están correctamente mapeados
- [x] .env.example existe y está completo
- [x] Makefile funciona en Windows/Mac/Linux
- [x] No hay hardcoded IPs (usar service names)
- [x] Logs son estructurados y útiles

#### Testing
- [ ] `docker-compose up` desde 0
- [ ] Verificar los 3 endpoints accesibles
- [ ] `make logs-backend` muestra logs
- [ ] `make down` y `make up` preserva datos
- [ ] Editar archivo en backend y verificar auto-reload

---

## 💼 EPIC 2: GESTIÓN DE LEADS (CRUD)
**Goal:** Implementar operaciones CRUD completas con validaciones exhaustivas  
**Duración:** 20 horas (Day 1.5 - Day 2)  
**Criterio de Éxito:** CRUD endpoints funcionales, >80% cobertura tests

---

### 📌 STORY 2.1: Crear Lead - API Endpoint + Validaciones Backend

**ID:** E2-S1  
**Tipo:** Feature Implementation  
**Story Points:** 13  
**Prioridad:** P0  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** crear un nuevo lead con nombre, empresa, email, teléfono y notas,  
**para que** comience a aparecer en el pipeline.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Crear Lead - API Backend

  Scenario: Crear lead con datos válidos
    Given que tengo payload válido:
      """json
      {
        "name": "Juan García",
        "company": "TechCorp SL",
        "email": "juan@techcorp.com",
        "phone": "+34917777777",
        "notes": "Lead muy interesado en soluciones cloud"
      }
      """
    When hago POST a "/api/leads"
    Then recibo status 201 Created
    And la respuesta incluye: id, name, company, email, status="Nuevo", created_at, updated_at
    And el lead se almacena en BD con los datos correctos

  Scenario: Email duplicado es rechazado
    Given que existe un lead con email "juan@techcorp.com"
    When intento crear otro lead con mismo email
    Then recibo status 409 Conflict
    And el mensaje es: "Email ya existe en el sistema"
    And no se crea el lead en BD

  Scenario: Nombre faltante es validado
    Given que intento crear lead sin campo "name"
    When hago POST sin el name
    Then recibo status 400 Bad Request
    And el error incluye: "name es requerido y debe tener >= 2 caracteres"

  Scenario: Email inválido es detectado
    Given que intento crear lead con email "invalido@"
    When hago POST con ese email inválido
    Then recibo status 400 Bad Request
    And el error es: "email debe ser un formato válido (user@domain.ext)"

  Scenario: Notas no pueden exceder límite
    Given que intento crear lead con 1500 caracteres en notas
    When hago POST con notas > 1000 caracteres
    Then recibo status 400 Bad Request
    And el error es: "notas no pueden exceder 1000 caracteres, tienes 1500"

  Scenario: Lead creado aparece en BD con audit
    Given que creé un lead exitosamente
    When inspecciono lead_audit_log
    Then existe un evento con: type="CREATED", lead_id=<id>, created_at=now
    And el evento registra el usuario que creó el lead

  Scenario: Teléfono es opcional
    Given que hago POST sin incluir "phone"
    When la request se procesa
    Then el lead se crea sin errores
    And phone es NULL en BD
    And no hay validación de formato de teléfono por ahora
```

#### Tareas Técnicas
- [ ] Crear model SQLAlchemy: `models/lead.py` con tabla leads
- [ ] Crear schemas Pydantic: `schemas/lead.py` con LeadCreate, LeadResponse
- [ ] Crear endpoint POST `/api/leads` en `routes/leads.py`
- [ ] Validaciones con Pydantic:
  - name: str, min_length=2, max_length=255, required
  - company: str, min_length=2, max_length=255, required
  - email: str, EmailStr (from pydantic), required, unique
  - phone: str, optional, max_length=20
  - notes: str, optional, max_length=1000
- [ ] Validación de email único: query BD antes de INSERT
- [ ] Error handling: IntegrityError catch → 409, ValueError → 400
- [ ] Transaction: INSERT lead + INSERT audit_log en misma transacción
- [ ] Logging: log cada creación con request_id, user_id, lead_id
- [ ] Test fixtures con pytest y asyncio

#### Definición de Hecho (DoD)
- [x] Todos los validadores funcionan correctamente
- [x] Error messages son claros y accionables
- [x] Audit log se crea automáticamente
- [x] Response incluye todos los campos requeridos
- [x] Email unique constraint está en BD
- [x] Tests cubren los 5 scenarios principales
- [x] Código pasa mypy type checking

#### Testing
```python
# pytest tests/test_leads_create.py
- test_create_lead_valid()
- test_create_lead_email_duplicate()
- test_create_lead_missing_name()
- test_create_lead_invalid_email()
- test_create_lead_notas_exceeds_limit()
```

#### Notas
- Por ahora sin autenticación, todo usuario puede crear
- Status por defecto: "Nuevo"
- Teléfono: formato libre, no validar

---

### 📌 STORY 2.2: Editar Lead - API Endpoint + Validaciones Backend

**ID:** E2-S2  
**Tipo:** Feature Implementation  
**Story Points:** 13  
**Prioridad:** P0  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** editar los datos de un lead existente,  
**para que** pueda corregir información o agregar detalles.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Editar Lead - API Backend

  Scenario: Editar lead con datos válidos
    Given que existe un lead con id=1
    When hago PUT a "/api/leads/1" con:
      """json
      {
        "name": "Juan García García",
        "company": "NewCorp Inc",
        "email": "juan.garcia@newcorp.com",
        "phone": "+34917888888",
        "notes": "Información actualizada"
      }
      """
    Then recibo status 200 OK
    And el lead en BD tiene los nuevos valores
    And updated_at refleja la fecha actual

  Scenario: Cambiar email a uno que ya existe
    Given que existen leads con emails: juan@corp1.com, pedro@corp2.com
    When intento editar lead 1 con email="pedro@corp2.com"
    Then recibo status 409 Conflict
    And el lead no se modifica

  Scenario: Edición parcial funciona
    Given que existe un lead con nombre="Juan" y empresa="Corp1"
    When hago PUT a "/api/leads/1" con solo:
      """json
      { "phone": "+34917999999" }
      """
    Then recibo status 200 OK
    And el lead tiene nombre="Juan" (sin cambios)
    And el lead tiene empresa="Corp1" (sin cambios)
    And el lead tiene phone="+34917999999" (cambió)

  Scenario: Audit log registra cambios
    Given que edité un lead cambiando name="Juan" → "Juan García"
    When inspecciono lead_audit_log
    Then existe evento: type="FIELD_EDITED", lead_id=1
    And el evento tiene: old_value="Juan", new_value="Juan García"
    And el evento registra el timestamp del cambio

  Scenario: Lead inexistente retorna 404
    Given que intento editar un lead inexistente (id=99999)
    When hago PUT a "/api/leads/99999"
    Then recibo status 404 Not Found
    And el mensaje es: "Lead con id 99999 no existe"

  Scenario: Validaciones aplican igual que create
    Given que intento editar un lead con email="invalido@"
    When hago PUT con ese email inválido
    Then recibo status 400 Bad Request
    And se valida: formato email, longitud fields, UNIQUE email
```

#### Tareas Técnicas
- [ ] Crear schema LeadUpdate con todos los campos opcionales
- [ ] Crear endpoint PUT `/api/leads/{id}` en `routes/leads.py`
- [ ] Lógica de partial update: solo actualizar campos que vienen en payload
- [ ] Validaciones: same as create (except id no puede editarse)
- [ ] Email unique check pero excluyendo lead actual (no error si edit mismo email)
- [ ] Audit log: registrar FIELD_EDITED con old/new values para campos que cambiaron
- [ ] Actualizar updated_at automáticamente
- [ ] Error handling: 404 si lead no existe, 409 si email dup, 400 si validación

#### Definición de Hecho (DoD)
- [x] Partial updates funcionan correctamente
- [x] Audit log creado para cada cambio
- [x] Validaciones igual a create
- [x] 404 cuando lead no existe
- [x] 409 cuando email duplicate (excepto mismo lead)
- [x] Tests cubren scenarios principales
- [x] No se actualiza ID o created_at (inmutable fields)

#### Testing
```python
# pytest tests/test_leads_edit.py
- test_edit_lead_valid()
- test_edit_lead_email_duplicate()
- test_edit_lead_not_found()
- test_edit_lead_partial_update()
- test_edit_lead_audit_log()
```

---

### 📌 STORY 2.3: Cambiar Estado de Lead - API PATCH Backend

**ID:** E2-S3  
**Tipo:** Feature Implementation  
**Story Points:** 8  
**Prioridad:** P0  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** cambiar el estado de un lead (Nuevo → En contacto → Propuesta → Cerrado),  
**para que** el pipeline refleje el progreso comercial.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Cambiar Estado de Lead

  Scenario: Cambiar status a estado válido
    Given que existe un lead con status="Nuevo"
    When hago PATCH a "/api/leads/1/status" con:
      """json
      { "new_status": "En contacto" }
      """
    Then recibo status 200 OK
    And el lead tiene status="En contacto"
    And updated_at fue actualizado

  Scenario: Status inválido es rechazado
    Given que intento cambiar a un status no válido
    When hago PATCH con new_status="Invalido"
    Then recibo status 400 Bad Request
    And el error es: "status debe ser uno de: Nuevo, En contacto, Propuesta enviada, Cerrado"

  Scenario: Audit log registra cambio de estado
    Given que cambié status de "Nuevo" a "En contacto"
    When inspecciono lead_audit_log
    Then existe evento: type="STATUS_CHANGED", lead_id=1
    And old_value="Nuevo", new_value="En contacto"
    And el timestamp está en la fecha actual

  Scenario: Cambios rápidos con idempotency
    Given que envío PATCH 3 veces con mismo Idempotency-Key
    When el servidor procesa los requests
    Then el lead solo cambia de status una sola vez
    And las requests subsecuentes retornan el mismo resultado
    And no hay duplicados en audit_log

  Scenario: Transiciones múltiples funcionan
    Given que un lead está en status="Nuevo"
    When cambio a "En contacto", luego "Propuesta", luego "Cerrado"
    Then todos los cambios se registran
    And audit_log tiene 3 eventos STATUS_CHANGED

  Scenario: Cambiar a mismo status es permitido
    Given que un lead tiene status="Nuevo"
    When hago PATCH cambiando a status="Nuevo"
    Then recibo 200 OK (idempotente)
    And no se crea audit_log (no cambio real)
```

#### Tareas Técnicas
- [ ] Crear Enum de estados: class LeadStatus(str, Enum)
- [ ] Crear endpoint PATCH `/api/leads/{id}/status` en `routes/leads.py`
- [ ] Schema: StatusChange(new_status: LeadStatus)
- [ ] Validación: new_status debe ser uno de los 4 enums
- [ ] Idempotency key: header `Idempotency-Key` → cache result (dict o redis)
- [ ] Audit log: STATUS_CHANGED event con old/new
- [ ] Solo crear audit event si status realmente cambió
- [ ] Actualizar updated_at
- [ ] Error handling: 400 si status inválido, 404 si lead no existe

#### Definición de Hecho (DoD)
- [x] Enum states son correctos (4 estados)
- [x] Idempotency key funciona
- [x] Audit log solo se crea si cambio real
- [x] Validaciones son exhaustivas
- [x] Tests cubren scenarios
- [x] Transiciones múltiples funcionan

#### Testing
```python
# pytest tests/test_leads_status.py
- test_change_status_valid()
- test_change_status_invalid()
- test_change_status_idempotent()
- test_change_status_audit_log()
- test_change_status_same_no_audit()
```

---

### 📌 STORY 2.4: Crear Lead - Modal y Formulario Frontend

**ID:** E2-S4  
**Tipo:** UI Implementation  
**Story Points:** 13  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** hacer click en "+ Nuevo Lead" y rellenar un modal intuitivo,  
**para que** crear un lead sea rápido (<30 segundos) sin dejar de ver el pipeline.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Modal Crear Lead - Frontend

  Scenario: Abrir modal de creación
    Given que estoy en el dashboard
    When hago click en botón "+ Nuevo Lead"
    Then se abre un modal con título "Nuevo Lead"
    And el modal tiene un formulario con campos ordenados

  Scenario: Campos requeridos vs opcionales
    Given que el modal está abierto
    When inspecciono los campos
    Then veo campos requeridos (asterisco rojo): nombre, empresa, email
    And veo campos opcionales: teléfono, notas
    And hay ayuda visual (icons, placeholders)

  Scenario: Validación inline en tiempo real
    Given que escribo "J" en el campo nombre
    When salgo del campo (blur)
    Then aparece error rojo: "Mínimo 2 caracteres"
    And el botón "Crear Lead" está deshabilitado

  Scenario: Validación de email duplicado
    Given que escribo un email que ya existe
    When salgo del campo email
    Then hace una llamada a POST /api/leads/validate-email
    And muestra error rojo: "Email ya existe"
    And botón está deshabilitado

  Scenario: Botón crear deshabilitado inicialmente
    Given que el modal se abre
    When inspecciono el botón "Crear Lead"
    Then está deshabilitado (disabled=true)
    And el color es gris (opacity 0.5)

  Scenario: Botón se habilita cuando validaciones pasan
    Given que todos los campos requeridos son válidos
    When inspecciono el botón
    Then está habilitado (enabled=true)
    And el color es azul (clickeable)

  Scenario: Crear lead exitosamente
    Given que rellenée todos los campos correctamente
    When hago click en "Crear Lead"
    Then aparece spinner + "Creando lead..."
    And después de 1-2 segundos, aparece toast verde: "Lead creado exitosamente"
    And el modal se cierra automáticamente
    And el nuevo lead aparece en columna "Nuevo" del Kanban

  Scenario: Manejo de error en creación
    Given que la creación falla (ej: error 409 email duplicate)
    When la request retorna error
    Then el modal permanece abierto
    And aparece toast rojo con el mensaje de error
    And usuario puede corregir y reintentar

  Scenario: Límite de caracteres en notas
    Given que escribo 1100 caracteres en notas
    When inspecciono el contador
    Then muestra "1100 / 1000" en rojo
    And aparece error: "Máximo 1000 caracteres"
    And botón está deshabilitado

  Scenario: Botón limpiar en modal
    Given que escribí datos en varios campos
    When hago click en botón "Limpiar" (si existe)
    Then todos los campos se vacían
    And validaciones se resetean
    And botón crear vuelve a estar deshabilitado

  Scenario: Cerrar modal con ESC o X
    Given que el modal está abierto
    When presiono ESC o hago click en X
    Then el modal se cierra
    And los datos se descartan (no se guarda borrador)
```

#### Tareas Técnicas
- [ ] Crear componente React: `components/CreateLeadModal.tsx`
- [ ] Usar react-hook-form para manejo de formulario
- [ ] Usar Zod o Yup para validaciones cliente
- [ ] Integrar con Zustand store para estado global
- [ ] Integrar TanStack Query mutation para POST /api/leads
- [ ] Estados visuales:
  - Normal: input blanco
  - Focus: border azul
  - Valid: checkmark verde
  - Error: border/texto rojo
  - Disabled: opacity 0.5
- [ ] Toast notifications (react-hot-toast o similar)
- [ ] Modal styling con Tailwind
- [ ] Validación inline onBlur, onChange debounce
- [ ] Contador de caracteres para notas
- [ ] Endpoint POST /api/leads/validate-email para email unique check

#### Definición de Hecho (DoD)
- [x] Validaciones inline funcionan
- [x] Toast notifications aparecen
- [x] Modal abre/cierra correctamente
- [x] Integración con API funciona
- [x] Error handling está implementado
- [x] Nuevo lead aparece en Kanban inmediatamente
- [x] No hay console errors o warnings

#### Testing
```javascript
// vitest + React Testing Library
- test_modal_opens()
- test_field_validation_inline()
- test_email_duplicate_validation()
- test_create_lead_success()
- test_create_lead_error_handling()
- test_modal_closes_on_success()
```

---

## 🎨 EPIC 3: VISUALIZACIÓN DEL PIPELINE (KANBAN)
**Goal:** Implementar tablero Kanban interactivo con 4 columnas y drag & drop  
**Duración:** 20 horas (Day 1.5 - Day 2)  
**Criterio de Éxito:** Kanban funcional, responsive, drag & drop suave

---

### 📌 STORY 3.1: Listar Leads - API GET /leads Backend

**ID:** E3-S1  
**Tipo:** Feature Implementation  
**Story Points:** 8  
**Prioridad:** P0  
**Asignado a:** Developer Full-stack  

**Como** desarrollador frontend,  
**quiero** un endpoint GET /api/leads que retorne todos los leads,  
**para que** pueda renderizar el Kanban.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Listar Leads - API Backend

  Scenario: Obtener todos los leads
    Given que existen 50 leads en la BD
    When hago GET a "/api/leads"
    Then recibo status 200 OK
    And la respuesta contiene un array con los 50 leads
    And cada lead tiene: id, name, company, email, status, created_at, updated_at

  Scenario: Filtro por status
    Given que existen 50 leads: 15 Nuevo, 10 En contacto, 15 Propuesta, 10 Cerrado
    When hago GET a "/api/leads?status=Nuevo"
    Then recibo solo los 15 leads con status="Nuevo"

  Scenario: Paginación funciona
    Given que existen 100 leads
    When hago GET a "/api/leads?limit=20&offset=0"
    Then recibo 20 leads
    And la respuesta incluye metadata: { total: 100, limit: 20, offset: 0 }
    When hago GET a "/api/leads?limit=20&offset=20"
    Then recibo los siguientes 20 leads (21-40)

  Scenario: Performance está dentro del SLA
    Given que existen 50 leads
    When hago GET a "/api/leads"
    And mido el tiempo de respuesta
    Then es <100ms (p95)

  Scenario: Ordenamiento por fecha
    Given que existen múltiples leads
    When obtengo /api/leads
    Then los leads están ordenados por created_at DESC (más recientes primero)

  Scenario: Response incluye todos los campos
    Given que hago GET /api/leads
    When inspecciono un lead en la respuesta
    Then tiene campos: id, name, company, email, phone, notes, status, created_at, updated_at
    And no contiene campos sensibles o internos
```

#### Tareas Técnicas
- [ ] Crear endpoint GET `/api/leads` en `routes/leads.py`
- [ ] Query params: status (filter), limit (default 100), offset (default 0)
- [ ] Response schema: { data: [LeadResponse], meta: { total, limit, offset } }
- [ ] Optimizaciones:
  - Índice en status column
  - Query sin N+1 (no refetch individual leads)
  - Límite máximo de results (ej: 1000)
- [ ] Ordenamiento: ORDER BY created_at DESC
- [ ] Error handling: 400 si limit/offset inválidos

#### Definición de Hecho (DoD)
- [x] Query performance <100ms
- [x] Paginación funciona correctamente
- [x] Filtro por status funciona
- [x] Response schema válido
- [x] Tests cubren scenarios

#### Testing
```python
# pytest tests/test_leads_list.py
- test_get_leads_all()
- test_get_leads_filter_by_status()
- test_get_leads_pagination()
- test_get_leads_performance()
```

---

### 📌 STORY 3.2: Dashboard Kanban - Render de 4 Columnas Frontend

**ID:** E3-S2  
**Tipo:** UI Implementation  
**Story Points:** 13  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** ver un tablero Kanban con 4 columnas (Nuevo, En contacto, Propuesta, Cerrado),  
**para que** tenga una vista clara del pipeline comercial.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Dashboard Kanban - Render Columnas

  Scenario: 4 columnas renderean lado a lado
    Given que accedo a "/" (dashboard principal)
    When la página carga en desktop
    Then veo 4 columnas Kanban lado a lado
    And cada columna tiene encabezado con: nombre, contador, icono de color

  Scenario: Contador de leads por columna
    Given que existen 50 leads: 12 Nuevo, 8 En contacto, 5 Propuesta, 3 Cerrado
    When las columnas se renderizan
    Then veo: "Nuevo (12)", "En contacto (8)", "Propuesta (5)", "Cerrado (3)"
    And los contadores son actualizados en tiempo real

  Scenario: Colores por estado
    Given que las columnas están renderizadas
    When inspecciono el icono de cada columna
    Then: Nuevo=Azul #3B82F6, En contacto=Naranja #F59E0B, Propuesta=Púrpura #A855F7, Cerrado=Verde #10B981

  Scenario: Tarjetas de leads dentro de columnas
    Given que la columna "Nuevo" tiene 12 leads
    When inspecciono la columna
    Then veo 12 tarjetas draggables
    And cada tarjeta muestra: nombre (bold), empresa (gris), email (gris claro)
    And la tarjeta tiene altura mínima 120px, ancho 100% de la columna

  Scenario: Scroll dentro de columnas
    Given que una columna tiene 50 leads (mucho contenido)
    When scroll dentro de la columna
    Then puedo ver todos los leads (scroll vertical)
    And scroll horizontal está deshabilitado (las 4 columnas siempre visibles)

  Scenario: Responsive: Mobile 320px
    Given que la viewport es 320px (mobile)
    When la página renderiza
    Then las columnas están stackeadas verticalmente (una encima de otra)
    And puedo scrollear verticalmente para ver todas
    And cada columna ocupa 100% del ancho

  Scenario: Responsive: Tablet 768px
    Given que la viewport es 768px (tablet)
    When la página renderiza
    Then veo 2 columnas lado a lado
    And puedo scrollear horizontalmente para ver las otras 2

  Scenario: Responsive: Desktop 1200px+
    Given que la viewport es 1200px+ (desktop)
    When la página renderiza
    Then veo las 4 columnas lado a lado sin scroll horizontal

  Scenario: Estados visuales de tarjetas
    Given que una tarjeta está en estado normal
    When la inspecciono
    Then tiene fondo blanco, border gris claro, shadow normal
    When hago hover
    Then border se pone azul, shadow se hace más fuerte
    When estoy arrastrando la tarjeta
    Then opacity=0.7, shadow es muy grande

  Scenario: Cursor indica draggable
    Given que estoy sobre una tarjeta
    Then el cursor cambia a "grab"
    And cuando arrastro, cambia a "grabbing"

  Scenario: Empty state cuando no hay leads
    Given que la columna "Nuevo" no tiene leads
    When la columna renderiza
    Then muestra placeholder: "No hay leads aún"
    And muestra CTA "Crear primer lead"
```

#### Tareas Técnicas
- [ ] Crear componente `KanbanBoard.tsx`
- [ ] Crear componente `KanbanColumn.tsx`
- [ ] Crear componente `LeadCard.tsx`
- [ ] Instalar react-beautiful-dnd para drag & drop
- [ ] Estructura:
  - KanbanBoard: contenedor principal (grid responsive)
  - KanbanColumn: columna individual (flex-col, scroll-y)
  - LeadCard: tarjeta de lead (draggable)
- [ ] Usar Zustand para estado: leads por columna
- [ ] Usar TanStack Query para fetch: GET /api/leads
- [ ] Responsive grid: desktop (grid-cols-4), tablet (grid-cols-2), mobile (grid-cols-1)
- [ ] Estilos Tailwind:
  - Colores: colors mapping por status
  - Tamaños: card 120px min-height
  - Shadows: normal/hover/dragging
- [ ] Cursor CSS: grab/grabbing
- [ ] Empty state con SVG/imagen

#### Definición de Hecho (DoD)
- [x] 4 columnas renderean correctamente
- [x] Contadores son precisos
- [x] Colores por estado están correctos
- [x] Responsive funciona en 3 breakpoints
- [x] Drag & drop es smooth (visual feedback)
- [x] Scroll dentro de columnas funciona
- [x] No hay console errors o warnings

#### Testing
```javascript
// vitest + React Testing Library
- test_kanban_renders_4_columns()
- test_lead_cards_display_correctly()
- test_counters_are_accurate()
- test_responsive_layout()
- test_empty_state()
```

---

### 📌 STORY 3.3: Drag & Drop - Cambiar Estado de Lead en Kanban Frontend

**ID:** E3-S3  
**Tipo:** UI Implementation  
**Story Points:** 13  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** arrastrar un lead entre columnas para cambiar su estado,  
**para que** el proceso sea intuitivo y rápido.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Drag & Drop - Cambiar Estado de Lead

  Scenario: Arrastrar lead de columna a columna
    Given que estoy en el Kanban
    When arrastro un lead de "Nuevo" a "En contacto"
    Then el lead se mueve visualmente a la columna destino
    And el contador "Nuevo" disminuye, "En contacto" aumenta
    And se envía PATCH /api/leads/{id}/status al backend

  Scenario: Optimistic update en UI
    Given que arrastro un lead
    When suelto el lead
    Then la UI se actualiza INMEDIATAMENTE (antes de que el servidor responda)
    And el lead aparece en la columna destino sin delay

  Scenario: Backend sync después del drag
    Given que arrastré un lead y la UI se actualizó
    When el backend procesa el PATCH /api/leads/{id}/status
    Then la UI y BD están en sync
    And no hay conflicts o estado inconsistente

  Scenario: Error en drag & drop se revierte
    Given que arrastro un lead pero la request falla (error 500)
    When el error se detecta
    Then el lead vuelve a su posición anterior en la UI
    And aparece toast rojo: "Error al cambiar estado, reintentando..."

  Scenario: Retry automático en caso de fallo
    Given que el drag falló con error de red
    When se detecta fallo
    Then se hace retry automático (exponential backoff)
    And después de 3 intentos exitosos, todo está sincronizado

  Scenario: No permitir drag a columnas inválidas
    Given que arrastro un lead
    When intento soltarlo en un área no válida (ej: barra lateral)
    Then la acción se cancela
    And el lead vuelve a su posición original
    And no se envía request al backend

  Scenario: Drag dentro de misma columna reordena
    Given que estoy en la columna "Nuevo"
    When arrastro un lead a una posición diferente dentro de la misma columna
    Then el lead se reordena (visual)
    And el ordenamiento se persiste pero NO cambiar en BD por ahora (futuro feature)

  Scenario: Disabled drag cuando loading
    Given que acabo de arrastrar un lead y está en estado "enviando"
    When intento arrastrar otro lead durante el sync
    Then el drag está deshabilitado temporalmente
    And aparece overlay con spinner
    And despues del sync, el drag se re-habilita

  Scenario: Animación suave en movimiento
    Given que arrastro un lead
    When se mueve entre columnas
    Then el movimiento es suave (no jarring)
    And la animación dura ~300ms
    And no hay lag o stuttering

  Scenario: Multi-select y drag múltiples leads (futuro)
    Given que TODO: Por ahora solo single select
    Then se implementará en future epic
```

#### Tareas Técnicas
- [ ] Integrar `react-beautiful-dnd` en `KanbanBoard.tsx`
- [ ] Implementar `onDragEnd` handler
- [ ] Optimistic update: actualizar state local + Zustand inmediatamente
- [ ] PATCH /api/leads/{id}/status con nuevo status basado en destino
- [ ] Error handling: revert state si falla la request
- [ ] Retry logic: exponential backoff (100ms, 200ms, 400ms)
- [ ] Loading state: disable dragging mientras se sincroniza
- [ ] Animaciones Tailwind/CSS: transition suave
- [ ] Toast notifications para errores
- [ ] Idempotency key para retry seguro

#### Definición de Hecho (DoD)
- [x] Drag & drop funciona suavemente
- [x] Optimistic updates implementado
- [x] Retry logic funciona
- [x] Error revert funciona
- [x] Contadores actualizan correctamente
- [x] Backend recibe el PATCH correcto
- [x] No hay race conditions

#### Testing
```javascript
// vitest + React Testing Library
- test_drag_lead_between_columns()
- test_optimistic_update()
- test_backend_sync()
- test_error_revert()
- test_retry_logic()
```

---

## 🔍 EPIC 4: BÚSQUEDA, FILTRADO Y ALERTAS
**Goal:** Implementar búsqueda, filtros y widget de leads en riesgo  
**Duración:** 12 horas (Day 1.5 - Day 2)  
**Criterio de Éxito:** Búsqueda funcional, filtros responsivos, alertas actualizadas

---

### 📌 STORY 4.1: Búsqueda y Filtro de Leads Frontend

**ID:** E4-S1  
**Tipo:** UI Feature  
**Story Points:** 8  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** buscar leads por nombre, empresa o email rápidamente,  
**para que** encuentre leads específicos sin scrollear todo el pipeline.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Búsqueda y Filtro de Leads

  Scenario: Buscar por nombre
    Given que escribo "juan" en la barra de búsqueda
    When el debounce se ejecuta (300ms)
    Then el Kanban filtra y muestra solo leads con "juan" en el nombre
    And los contadores de columna se actualizan

  Scenario: Búsqueda OR entre campos
    Given que escribo "techcorp" en la búsqueda
    When la búsqueda se ejecuta
    Then aparecen leads donde: nombre contiene "techcorp" O empresa contiene "techcorp" O email contiene "techcorp"

  Scenario: Búsqueda case-insensitive
    Given que escribo "JUAN" o "juan" o "Juan"
    Then la búsqueda funciona igual (sin importar mayúsculas/minúsculas)

  Scenario: Débounce evita requests excesivas
    Given que escribo rápidamente: "j", "ju", "jua", "juan"
    When inspecciono las requests al backend
    Then solo se envía 1 request (no 4)
    And la request se envía 300ms después de terminar de escribir

  Scenario: Botón limpiar búsqueda
    Given que tengo un término de búsqueda escrito
    When hago click en botón "X" (clear)
    Then la búsqueda se limpia
    And el Kanban vuelve a mostrar todos los leads
    And los contadores vuelven a sus valores originales

  Scenario: Placeholder claro en input
    Given que el input de búsqueda está vacío
    Then muestra placeholder: "Buscar por nombre, empresa o email..."

  Scenario: Búsqueda no válida retorna vacío
    Given que busco un término que no existe
    Then el Kanban muestra 0 leads
    And aparece mensaje: "No hay leads que coincidan con tu búsqueda"

  Scenario: Performance de búsqueda
    Given que tengo 100 leads
    When busco y el backend procesa
    Then la búsqueda tarda <500ms
    And los resultados aparecen sin lag en la UI
```

#### Tareas Técnicas
- [ ] Crear componente `SearchBar.tsx`
- [ ] Input con placeholder, icono de búsqueda, botón X
- [ ] useQuery TanStack con query string: GET /api/leads?q=juan
- [ ] Debounce 300ms en input onChange
- [ ] Zustand action: setSearchQuery
- [ ] Filtrar leads en el Kanban según query
- [ ] Backend endpoint: GET /api/leads?q=search_term
  - Query por nombre ILIKE, empresa ILIKE, email ILIKE
  - Usar OR lógica: WHERE name ILIKE %q% OR company ILIKE %q% OR email ILIKE %q%

#### Definición de Hecho (DoD)
- [x] Búsqueda funciona en 3 campos
- [x] Debounce implementado correctamente
- [x] Performance <500ms
- [x] Case-insensitive
- [x] Botón clear funciona
- [x] Empty state cuando no hay resultados

#### Testing
```javascript
// vitest + React Testing Library
- test_search_by_name()
- test_search_or_logic()
- test_search_case_insensitive()
- test_debounce()
- test_clear_button()
```

---

### 📌 STORY 4.2: Widget "Leads en Riesgo" + Alertas Backend

**ID:** E4-S2  
**Tipo:** Feature Implementation  
**Story Points:** 8  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** ver un widget con leads que no han sido tocados en más de 7 días,  
**para que** pueda identificar oportunidades abandonadas y hacer follow-up.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Widget Leads en Riesgo

  Scenario: Calcular leads en riesgo
    Given que existen leads con última modificación hace: 2 días, 5 días, 9 días, 15 días
    When se calcula el widget
    Then aparecen 2 leads en riesgo (aquellos sin cambios hace >7 días)

  Scenario: Badge visual en widget
    Given que hay 2 leads en riesgo
    When el widget renderiza
    Then muestra un badge rojo con el número "2"
    And el texto dice "Leads en Riesgo"

  Scenario: Click en widget filtra Kanban
    Given que hago click en el widget "Leads en Riesgo"
    When el Kanban se actualiza
    Then muestra SOLO los leads en riesgo
    And el Kanban tiene un filter badge mostrando "Filtrando: Leads en Riesgo"

  Scenario: Click otra vez desfiltra
    Given que el Kanban está filtrado por riesgo
    When hago click de nuevo en el widget
    Then el filtro se remove
    And el Kanban muestra todos los leads

  Scenario: Actualización real-time
    Given que tengo el widget visible
    When un lead en riesgo es modificado (change status)
    Then el widget se actualiza automáticamente
    And el badge cambia de "2" a "1"

  Scenario: Endpoint para calcular leads en riesgo
    Given que llamo a GET /api/leads/at-risk
    When el backend procesa
    Then retorna lista de leads donde: updated_at < now() - 7 días
    And retorna conteo exacto
```

#### Tareas Técnicas
- [ ] Crear endpoint GET `/api/leads/at-risk` en backend
  - Query: SELECT * FROM leads WHERE updated_at < NOW() - INTERVAL '7 days'
  - Retorna: { count: int, leads: [LeadResponse] }
- [ ] Crear componente `AtRiskWidget.tsx`
- [ ] Badge visual con número
- [ ] Click handler para toggle filter
- [ ] Integración Zustand: setFilterAtRisk(boolean)
- [ ] Real-time update: refetch GET /api/leads/at-risk cuando status cambio
- [ ] Estilos: badge rojo, hover effect

#### Definición de Hecho (DoD)
- [x] Cálculo es correcto (7 días desde updated_at)
- [x] Widget actualiza en tiempo real
- [x] Filtro funciona correctamente
- [x] Badge muestra número correcto
- [x] Endpoint retorna datos correctos

#### Testing
```python
# pytest backend
- test_at_risk_calculation()
- test_at_risk_endpoint()

// vitest frontend
- test_at_risk_widget_renders()
- test_at_risk_filter_toggle()
```

---

### 📌 STORY 4.3: Filtro por Status en Kanban Frontend

**ID:** E4-S3  
**Tipo:** UI Feature  
**Story Points:** 5  
**Prioridad:** P2  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** filtrar el Kanban por status específico,  
**para que** pueda enfocarse en una etapa del pipeline particular.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Filtro por Status en Kanban

  Scenario: Botones de status para filtrar
    Given que estoy en el dashboard
    When inspecciono la barra de controles
    Then veo botones: "Todos", "Nuevo", "En contacto", "Propuesta", "Cerrado"

  Scenario: Filtrar por status
    Given que hago click en botón "Nuevo"
    When el Kanban se actualiza
    Then muestra SOLO la columna "Nuevo" (las otras 3 desaparecen)
    And el botón "Nuevo" está highlighted en azul

  Scenario: Ver todos los status
    Given que estoy filtrando por "Nuevo"
    When hago click en botón "Todos"
    Then vuelven a aparecer las 4 columnas
    And todos los botones están desenhighlighted

  Scenario: Información en buttons
    Given que los botones de status están visibles
    When inspecciono cada botón
    Then muestran el nombre + contador: "Nuevo (12)", "En contacto (8)", etc
```

#### Tareas Técnicas
- [ ] Crear componente `StatusFilterBar.tsx`
- [ ] Botones para cada status + "Todos"
- [ ] Zustand action: setStatusFilter
- [ ] Condicional en KanbanBoard: if (statusFilter !== null) mostrar solo esa columna
- [ ] Estilos: highlighted cuando activo

#### Definición de Hecho (DoD)
- [x] Filtros funcionan correctamente
- [x] Contadores actualizan
- [x] UI clara y responsive
- [x] Integración con Zustand

#### Testing
```javascript
// vitest
- test_status_filter_buttons()
- test_filter_by_status()
- test_view_all_status()
```

---

## 📅 EPIC 5: TIMELINE Y AUDITORÍA
**Goal:** Implementar timeline de actividad y auditoría completa de cambios  
**Duración:** 8 horas (Day 2)  
**Criterio de Éxito:** Timeline funcional, auditoría registrada

---

### 📌 STORY 5.1: Timeline de Actividad por Lead - Backend + Frontend

**ID:** E5-S1  
**Tipo:** Feature Implementation  
**Story Points:** 13  
**Prioridad:** P2  
**Asignado a:** Developer Full-stack  

**Como** ejecutivo de venta,  
**quiero** ver el historial completo de eventos de un lead (creación, cambios, notas),  
**para que** tenga visibilidad sobre la evolución del lead.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Timeline de Actividad

  Scenario: Acceder al timeline de un lead
    Given que estoy en el Kanban
    When hago click en un lead card
    Then se abre un drawer/modal con detalles del lead
    And veo un "Timeline" tab con la historia completa

  Scenario: Eventos en el timeline
    Given que veo el timeline
    Then veo eventos ordenados cronológicamente (más reciente arriba)
    Y cada evento muestra: tipo, descripción, timestamp, usuario

  Scenario: Tipos de eventos
    Given que inspecciono el timeline
    Then veo eventos de tipo:
    | event_type       | ejemplo                              |
    | CREATED          | "Lead creado por juan@corp.com"     |
    | STATUS_CHANGED   | "Estado cambió de Nuevo a En contacto" |
    | FIELD_EDITED     | "Nombre cambió de 'Juan' a 'Juan García'" |
    | NOTE_ADDED       | "Nota agregada: 'Follow-up mañana'" |

  Scenario: Detalle de cambios de campo
    Given que un evento es FIELD_EDITED
    When inspecciono el evento
    Then veo: campo, valor anterior, nuevo valor, timestamp
    And el diff es claro y legible

  Scenario: Agregar nota desde timeline
    Given que estoy viendo el timeline
    When hago click en "+ Agregar nota"
    Then se abre un input para escribir la nota
    And hago click "Guardar"
    And la nota se agrega al timeline como evento NOTE_ADDED
    And el backend inserta el evento en lead_audit_log
```

#### Tareas Técnicas
- [ ] Backend endpoint: GET `/api/leads/{id}/timeline` o GET `/api/leads/{id}/audit`
  - Retorna: { events: [{ id, type, description, old_value, new_value, created_at, created_by }] }
  - Ordered by created_at DESC
  - Limit 100 eventos
- [ ] Crear componente `LeadDetailModal.tsx`
- [ ] Crear componente `TimelineView.tsx`
- [ ] Crear componente `EventItem.tsx` (para cada evento)
- [ ] Endpoint POST `/api/leads/{id}/notes` para agregar notas
- [ ] Esquema evento: id, lead_id, event_type, description, old_value, new_value, created_at, created_by_id
- [ ] Enum EventType: CREATED, STATUS_CHANGED, FIELD_EDITED, NOTE_ADDED

#### Definición de Hecho (DoD)
- [x] Timeline se carga correctamente
- [x] Eventos se ordenan por fecha (DESC)
- [x] Detalles de cambios son legibles
- [x] Notas se pueden agregar
- [x] Eventos se registran automáticamente

#### Testing
```python
# pytest backend
- test_get_timeline()
- test_timeline_events_ordered()

// vitest frontend
- test_modal_opens()
- test_timeline_displays()
- test_add_note()
```

---

### 📌 STORY 5.2: Auditoría Completa - Registro de Cambios Backend

**ID:** E5-S2  
**Tipo:** Technical Implementation  
**Story Points:** 8  
**Prioridad:** P2  
**Asignado a:** Developer Full-stack  

**Como** auditor/compliance officer,  
**quiero** que todos los cambios en leads sean registrados automáticamente en lead_audit_log,  
**para que** tengamos trazabilidad completa y auditoria.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Auditoría Completa de Cambios

  Scenario: CREATE event registrado
    Given que creo un lead nuevo
    When el lead se inserta en la BD
    Then se crea un evento en lead_audit_log: type="CREATED", description="Lead creado por <user>"

  Scenario: STATUS_CHANGED event registrado
    Given que cambio status de un lead
    When el PATCH /api/leads/{id}/status se ejecuta
    Then se crea evento: type="STATUS_CHANGED", old_value="Nuevo", new_value="En contacto"

  Scenario: FIELD_EDITED events registrados
    Given que edito múltiples campos de un lead
    When el PUT /api/leads/{id} se ejecuta
    Then se crean eventos separados para CADA campo que cambió
    And cada evento tiene: field_name, old_value, new_value

  Scenario: NOTE_ADDED event registrado
    Given que agrego una nota a un lead
    When POST /api/leads/{id}/notes se ejecuta
    Then se crea evento: type="NOTE_ADDED", description="Nota: <contenido de la nota>"

  Scenario: Auditoría es inmutable
    Given que se registró un evento
    When intento modificarlo o borrarlo
    Then no puedo (tabla read-only para usuarios)
    And solo admin puede modificar (future feature)

  Scenario: Información completa en cada evento
    Given que veo un evento en lead_audit_log
    Then contiene: id, lead_id, event_type, description, old_value, new_value, created_at, created_by_id, metadata
    And created_at es automático (NOW())
    And created_by_id es automático (usuario actual, por ahora hardcoded a 1)
```

#### Tareas Técnicas
- [ ] Crear modelo SQLAlchemy para lead_audit_log
- [ ] Crear factory/helper `audit.create_event()` para registrar eventos
- [ ] Llamar helper en cada CREATE/UPDATE/DELETE en endpoints
- [ ] Estructura evento:
  ```python
  class AuditEvent(Base):
      __tablename__ = "lead_audit_log"
      id: int (PK)
      lead_id: int (FK)
      event_type: str (Enum)
      description: str
      old_value: dict (JSONB, nullable)
      new_value: dict (JSONB, nullable)
      created_at: datetime (default NOW())
      created_by_id: int (default 1 por ahora)
      metadata: dict (JSONB, nullable)
  ```
- [ ] No index en lead_audit_log por ahora (será para tabla grande más adelante)

#### Definición de Hecho (DoD)
- [x] Todos los cambios se registran automáticamente
- [x] Eventos tienen información completa
- [x] Tabla audit_log es read-only para usuarios normales
- [x] Tests verifican que eventos se crean

#### Testing
```python
# pytest backend
- test_create_event_on_lead_creation()
- test_status_changed_event()
- test_field_edited_event()
- test_note_added_event()
- test_audit_log_immutable()
```

---

## 🎨 EPIC 6: UX/UI, RESPONSIVO Y ACCESIBILIDAD
**Goal:** Implementar diseño responsivo, accesibilidad y animaciones suaves  
**Duración:** 12 horas (Day 2)  
**Criterio de Éxito:** Responsive en 3 breakpoints, WCAG AA compliance

---

### 📌 STORY 6.1: Diseño Responsivo - Mobile, Tablet, Desktop

**ID:** E6-S1  
**Tipo:** UI Implementation  
**Story Points:** 8  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** usuario,  
**quiero** usar la aplicación en mobile, tablet y desktop sin problemas,  
**para que** pueda acceder desde cualquier dispositivo.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Diseño Responsivo

  Scenario: Mobile 320px - Columnas stackeadas
    Given que la viewport es 320px (mobile)
    When accedo al Kanban
    Then las 4 columnas están stackeadas verticalmente
    And scroll es solo vertical (no horizontal)
    And lead cards son 100% del ancho

  Scenario: Mobile - Buttons y modals
    Given que estoy en mobile
    When hago click en "+ Nuevo Lead"
    Then el modal ocupa 90% del viewport
    And los inputs son full-width y fáciles de tocar (>44px altura)
    And el botón "Crear Lead" es clickeable sin esfuerzo

  Scenario: Tablet 768px - 2 columnas
    Given que la viewport es 768px (tablet)
    When el Kanban renderiza
    Then veo 2 columnas lado a lado
    And puedo scrollear horizontalmente para ver las otras 2

  Scenario: Desktop 1200px+ - 4 columnas
    Given que la viewport es 1200px+ (desktop)
    When el Kanban renderiza
    Then veo las 4 columnas lado a lado sin scroll horizontal
    And el layout es confortable para trabajar

  Scenario: Transiciones entre breakpoints
    Given que redimensiono la ventana de 320px a 1200px
    When el layout se adapta
    Then no hay layout shift abrupto
    And la transición es suave (no jarring)

  Scenario: Fonts y spacing escalables
    Given que verifico el diseño
    Then los textos se hacen más grandes en desktop
    And el spacing se adapta según viewport
    And legibilidad se mantiene en todos los tamaños
```

#### Tareas Técnicas
- [ ] Tailwind responsive classes:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
- [ ] Grid layout:
  - mobile: grid-cols-1
  - tablet: md:grid-cols-2
  - desktop: lg:grid-cols-4
- [ ] Lead cards:
  - mobile: p-3 text-sm
  - desktop: p-4 text-base
- [ ] Modal:
  - mobile: w-90% max-h-90vh
  - desktop: w-500px max-h-80vh
- [ ] Touch targets: min 44x44px en mobile
- [ ] Buttons: min 48x48px en mobile

#### Definición de Hecho (DoD)
- [x] Testeable en 3 breakpoints
- [x] No horizontal scroll en mobile
- [x] Touch targets suficientemente grandes
- [x] Fonts legibles en todos los tamaños
- [x] Modals adaptan al viewport

#### Testing
```javascript
// vitest + React Testing Library
- test_mobile_layout()
- test_tablet_layout()
- test_desktop_layout()
- test_responsive_transitions()
```

---

### 📌 STORY 6.2: Animaciones, Transiciones y Feedback Visual

**ID:** E6-S2  
**Tipo:** UI Polish  
**Story Points:** 8  
**Prioridad:** P2  
**Asignado a:** Developer Full-stack  

**Como** usuario,  
**quiero** ver animaciones suaves y feedback visual claro,  
**para que** la aplicación se sienta pulida y responsive.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Animaciones y Transiciones

  Scenario: Modal open/close animation
    Given que hago click en "+ Nuevo Lead"
    When el modal abre
    Then aparece con animación fade-in suave (200ms)
    And cuando cierro, desaparece con fade-out suave

  Scenario: Lead card drag animation
    Given que arrastro un lead
    When se mueve entre columnas
    Then la transición es suave (no jarring)
    And la card tiene opacity 0.7 mientras se arrastra
    And cuando se suelta, vuelve a opacity 1 con transición suave

  Scenario: Load spinner
    Given que se está cargando el Kanban
    When el data está siendo fetched
    Then aparece un spinner rotando suavemente
    Y el spinner tiene color azul (matches brand)

  Scenario: Toast notifications
    Given que creo un lead exitosamente
    When aparece el toast
    Then aparece deslizándose desde bottom-right (slide-in 300ms)
    And desaparece después de 3 segundos con slide-out

  Scenario: Hover effects en cards
    Given que estoy sobre una lead card
    When inspecciono el estilo
    Then el border cambia a azul
    And shadow se hace más pronunciado
    And el cursor es "grab"
    And la transición de estilos es suave (100ms)

  Scenario: Button feedback
    Given que hago click en un botón
    When lo presiono
    Then el botón tiene un estado "active" visual
    And después del click, vuelve al estado normal

  Scenario: Loading state en botón
    Given que estoy creando un lead
    When hago click en "Crear Lead"
    Then el botón muestra spinner + "Creando..."
    And el botón está deshabilitado temporalmente
    And después, vuelve a estado normal
```

#### Tareas Técnicas
- [ ] Tailwind transition utilities: transition-all, duration-200, ease-in-out
- [ ] CSS animations para spinner (rotate)
- [ ] Framer Motion (opcional) para animaciones complejas
- [ ] Estados hover/active en Tailwind:
  - hover:border-blue-500, hover:shadow-lg
- [ ] Modal animations: animate-fadeIn, animate-fadeOut
- [ ] Toast animations: animate-slideIn, animate-slideOut
- [ ] Button loading state: disabled:opacity-50

#### Definición de Hecho (DoD)
- [x] Todas las transiciones son suaves
- [x] Timing es consistente (200-300ms)
- [x] Feedback visual es claro
- [x] No hay lag o stuttering
- [x] Animaciones son accesibles (prefers-reduced-motion)

#### Testing
```javascript
// vitest
- test_modal_animation()
- test_hover_effects()
- test_loading_state()
```

---

### 📌 STORY 6.3: Accesibilidad (WCAG AA) e Internacionalización Base

**ID:** E6-S3  
**Tipo:** Accessibility Implementation  
**Story Points:** 8  
**Prioridad:** P2  
**Asignado a:** Developer Full-stack  

**Como** usuario con discapacidad,  
**quiero** que la aplicación sea accesible con keyboard y screen reader,  
**para que** todos puedan usar Mini CRM.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Accesibilidad WCAG AA

  Scenario: Focus outline visible
    Given que presiono Tab
    When un elemento recibe focus
    Then aparece un outline visible (color diferente al fondo)
    And el outline tiene contrast >= 3:1

  Scenario: Tab navigation funcional
    Given que presiono Tab múltiples veces
    When navego por la aplicación
    Then puedo llegar a todos los elementos interactivos (buttons, inputs)
    And el orden es lógico (left-to-right, top-to-bottom)

  Scenario: Keyboard shortcuts
    Given que estoy en el dashboard
    When presiono "Escape"
    Then modals abiertos se cierran
    When presiono "Enter" en un input
    Then el formulario se envía (si es válido)

  Scenario: ARIA labels en inputs
    Given que inspecciono los campos del modal
    Then cada input tiene aria-label o label asociado
    And los labels describen el propósito del input

  Scenario: ARIA labels en buttons
    Given que inspecciono los botones
    Then botones sin texto tienen aria-label (ej: botón X de cerrar)
    And los labels son descriptivos

  Scenario: Screen reader support
    Given que uso un screen reader (NVDA, JAWS)
    When navego por la aplicación
    Then el screen reader anuncia: encabezados, labels, roles, estados
    And los contadores son anunciados ("Nuevo, 12 leads")

  Scenario: Color contrast
    Given que inspecciono el diseño
    Then el contraste entre foreground y background es >= 4.5:1 (texto normal)
    And >= 3:1 (texto grande)
    And no hay información solo transmitida por color

  Scenario: Alt text en imágenes
    Given que hay imágenes en la UI
    Then cada imagen tiene alt text descriptivo
    And el alt text es útil, no "imagen"

  Scenario: Reduced motion support
    Given que tengo "prefers-reduced-motion: reduce" en SO
    When accedo a la aplicación
    Then las animaciones no se ejecutan (o son muy sutiles)
    And la funcionalidad se mantiene igual

  Scenario: Internacionalización base
    Given que la aplicación está en español
    Then todos los textos están en español
    And no hay textos hardcodeados en inglés (excepto code comments)
    And los números/fechas usan formato español (dd/mm/yyyy)
```

#### Tareas Técnicas
- [ ] ARIA attributes:
  - aria-label en buttons sin texto
  - aria-labelledby para sections
  - aria-live para updates dinámicos (toast, contadores)
  - aria-hidden para elementos decorativos
- [ ] Focus management:
  - Outline visible en focus (focus:outline-2 focus:outline-blue-500)
  - Outline offset (focus:outline-offset-2)
- [ ] Keyboard navigation:
  - Tab index correcto (no negative tab index excepto necesario)
  - Focus trap en modals (cuando abierto)
- [ ] Contrast:
  - Verificar con contrast checker (WCAG AA = 4.5:1)
  - Usar colores de Tailwind que cumplan
- [ ] Reduced motion:
  - CSS media query: @media (prefers-reduced-motion: reduce)
  - Desabilitar animaciones en esta condición
- [ ] i18n base:
  - Todos los strings en variable (hardcodear en español por ahora)
  - Formato de fechas: dd/mm/yyyy español
- [ ] Screen reader testing:
  - Usar NVDA o JAWS para testear (gratuito)

#### Definición de Hecho (DoD)
- [x] Todos los elementos son tab-navigables
- [x] Focus outline visible y contrastante
- [x] ARIA labels descriptivos
- [x] Contrast >= 4.5:1 en todos lados
- [x] Reduced motion respetado
- [x] Screen reader anuncia información relevante
- [x] Textos en español

#### Testing
```javascript
// vitest + axe-core for accessibility
- test_focus_visible()
- test_tab_navigation()
- test_aria_labels()
- test_contrast()
- test_reduced_motion()
```

---

## ⚡ EPIC 7: PERFORMANCE, OPTIMIZACIÓN Y CONFIABILIDAD
**Goal:** Optimizar performance, asegurar confiabilidad, implementar patterns técnicos  
**Duración:** 8 horas (Day 2)  
**Criterio de Éxito:** <2s initial load, API p95 <300ms, 99.5% uptime

---

### 📌 STORY 7.1: Optimización de Performance - Frontend Bundle

**ID:** E7-S1  
**Tipo:** Performance Optimization  
**Story Points:** 5  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** usuario con conexión lenta,  
**quiero** que la aplicación cargue rápidamente,  
**para que** no abandone la aplicación por lentitud.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Frontend Performance Optimization

  Scenario: Bundle size < 2MB
    Given que ejecuto "npm run build"
    When inspecciono el archivo dist/
    Then el bundle total (HTML + JS + CSS) es < 2MB
    And el main.js es < 1.5MB

  Scenario: Code splitting automático
    Given que el build se completa
    When inspecciono los chunks
    Then hay code splitting: main, components, pages
    And los chunks se cargan bajo demanda

  Scenario: Load inicial < 2 segundos
    Given que accedo a http://localhost:3000
    When mido el tiempo hasta que la página está interactiva
    Then tarda < 2 segundos en:
      - Render inicial (First Contentful Paint)
      - Cargar datos del Kanban (GET /api/leads)
      - Página es clickeable (Time to Interactive)

  Scenario: Caching de dependencias
    Given que tengo las dependencias cacheadas en el navegador
    When recargo la página
    Then los chunks cacheados se cargan desde cache local
    And el segundo load es <500ms

  Scenario: Lazy loading de componentes
    Given que la página carga
    When aún no acceso a ciertas secciones (ej: lead detail modal)
    Then esos componentes se cargan bajo demanda (no en el bundle inicial)

  Scenario: Optimización de imágenes
    Given que hay imágenes en la aplicación
    When inspecciono sus tamaños
    Then están comprimidas y en formato eficiente (webp si posible)
```

#### Tareas Técnicas
- [ ] Vite build optimization:
  - rollupOptions para code splitting
  - minify: terser
  - sourcemap: false en production
- [ ] Dependency cleanup:
  - Remover dependencias no usadas
  - Usar tree-shaking
- [ ] Lazy loading:
  - React.lazy() para componentes pesados
  - Suspense fallback
- [ ] Bundle analysis:
  - `npm install -D rollup-plugin-visualizer`
  - Generar visualización de bundle
- [ ] Image optimization:
  - Usar webp con fallback
  - Comprimir SVGs

#### Definición de Hecho (DoD)
- [x] Bundle size verificado <2MB
- [x] Load time medido <2s
- [x] Code splitting implementado
- [x] No dependencias no-usadas
- [x] Bundle analysis realizado

#### Testing
```javascript
// vitest
- test_bundle_size()
- test_load_time()
- test_code_splitting()
```

---

### 📌 STORY 7.2: Optimización de Performance - Backend Query y Caching

**ID:** E7-S2  
**Tipo:** Performance Optimization  
**Story Points:** 5  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** usuario con muchos leads en el sistema,  
**quiero** que las queries sean rápidas,  
**para que** el Kanban responda al instante.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Backend Performance - Queries & Caching

  Scenario: API p95 < 300ms
    Given que tengo 100+ leads en la BD
    When hago GET /api/leads
    And mido el tiempo de respuesta (p95)
    Then es < 300ms

  Scenario: No N+1 queries
    Given que el backend fetcha leads
    When inspecciono las queries SQL
    Then solo hace 1 query para traer todos los leads
    And no hace 1 query por lead (N+1 problem)

  Scenario: Índices en BD
    Given que tengo índices en email, status, updated_at
    When hago query con filtro: WHERE status = 'Nuevo'
    Then la query usa el índice (EXPLAIN plan muestra Index Scan)
    Y la query tarda <50ms

  Scenario: Connection pooling
    Given que tengo múltiples requests simultáneos
    When se conectan a PostgreSQL
    Then usan una pool de conexiones (min: 5, max: 20)
    And no hay connection timeout

  Scenario: Response caching con TanStack Query
    Given que fetch GET /api/leads
    When hago la misma request de nuevo
    Then TanStack Query retorna cached data
    And no hace segunda request al backend (stale-while-revalidate)

  Scenario: Pagination reduce data
    Given que tengo 1000 leads
    When hago GET /api/leads?limit=50&offset=0
    Then solo retorno 50 records (no 1000)
    And el response size es ~50KB (manageable)
```

#### Tareas Técnicas
- [ ] SQLAlchemy query optimization:
  - Usar `joinedload()` o `selectinload()` para evitar N+1
  - Query profiling: print(query) para ver SQL
- [ ] Índices en BD (ya creado en Story 1.2):
  - leads(email)
  - leads(status)
  - leads(updated_at)
  - Verificar con EXPLAIN
- [ ] Connection pool:
  - SQLAlchemy engine: pool_size=5, max_overflow=20
- [ ] Caching layer:
  - TanStack Query en frontend (stale-while-revalidate)
  - Backend: HTTP caching headers (Cache-Control: max-age=60)
- [ ] Pagination:
  - Implementar limit/offset en queries
  - Default limit=50, max=100

#### Definición de Hecho (DoD)
- [x] API p95 <300ms verificado
- [x] No N+1 queries (EXPLAIN validado)
- [x] Connection pool configurado
- [x] Índices creados y funcionando
- [x] Caching implementado

#### Testing
```python
# pytest backend
- test_query_performance()
- test_no_n_plus_one()
- test_pagination()

# Manual EXPLAIN
- EXPLAIN SELECT * FROM leads WHERE status='Nuevo';
```

---

### 📌 STORY 7.3: Confiabilidad - Error Handling y Retry Logic

**ID:** E7-S3  
**Tipo:** Reliability Implementation  
**Story Points:** 5  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** usuario,  
**quiero** que la aplicación sea confiable y se recupere de errores,  
**para que** pueda continuar trabajando incluso si hay fallos de red.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Confiabilidad - Error Handling & Retry

  Scenario: Error 500 muestra mensaje claro
    Given que el backend está temporalmente down
    When hago una request
    Then recibo error 500
    And la UI muestra: "Error en el servidor, reintentando..."
    And NO muestra stack trace (seguridad)

  Scenario: Retry automático en fallos de red
    Given que me desconecto de la red
    When intento crear un lead
    Then la request falla
    And se hace retry automático con exponential backoff
    And después de 3 intentos, muestra: "No hay conexión, reintente"

  Scenario: Optimistic update revierte en error
    Given que hago drag & drop de un lead
    When la request falla (error 500)
    Then el lead vuelve a su posición anterior en la UI
    And aparece toast rojo: "Error, se revertió el cambio"

  Scenario: Idempotency previene duplicados
    Given que intento crear un lead 2 veces rápidamente
    When ambas requests se envían
    Then si la primera se completa, la segunda se cancela
    Y solo 1 lead se crea en la BD (no duplicados)

  Scenario: Timeout en requests largas
    Given que el backend tarda más de 10 segundos en responder
    When se cumple el timeout
    Then la request se cancela
    Y aparece: "La solicitud tardó demasiado, reintente"

  Scenario: Graceful degradation si BD está down
    Given que PostgreSQL está unavailable
    When el backend intenta conectar
    Then muestra error 503 Service Unavailable
    Y la UI muestra: "Base de datos temporalmente unavailable"
    Y propone: "Reintente en unos momentos"
```

#### Tareas Técnicas
- [ ] Backend error handling:
  - try-except en todos los endpoints
  - Custom exception classes: ResourceNotFound, ValidationError, DatabaseError
  - Error response format: { error: string, code: string, details: object }
  - Logging con stack trace internamente (no exponer al cliente)
- [ ] Frontend retry logic:
  - axios interceptor para retry automático
  - Exponential backoff: 100ms, 200ms, 400ms
  - Max 3 intentos
- [ ] Optimistic update + revert:
  - Update Zustand state inmediatamente
  - Si request falla, deshacer cambio
  - Toast notification para user
- [ ] Idempotency:
  - Usar Idempotency-Key header
  - Backend cache para resultados previos (dict o Redis)
- [ ] Timeout:
  - axios timeout: 10000ms
  - Frontend toast cuando timeout

#### Definición de Hecho (DoD)
- [x] Todos los errores tienen mensajes claros
- [x] Retry logic funciona sin loops infinitos
- [x] Idempotency implementado
- [x] Optimistic update revierte en error
- [x] No expone stack traces al usuario
- [x] Logging interno detallado

#### Testing
```python
# pytest backend
- test_error_500_message()
- test_idempotency_key()

// vitest frontend
- test_retry_logic()
- test_optimistic_update_revert()
- test_timeout_handling()
```

---

## 🧪 EPIC 8: TESTING, DOCUMENTACIÓN Y PREPARACIÓN DEMO
**Goal:** Testing exhaustivo, documentación completa, runbook de demo  
**Duración:** 8 horas (Day 2)  
**Criterio de Éxito:** >70% cobertura, documentación lista, demo runbook

---

### 📌 STORY 8.1: Automated Testing - Backend Tests (pytest)

**ID:** E8-S1  
**Tipo:** Quality Assurance  
**Story Points:** 8  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** desarrollador,  
**quiero** tener tests automatizados que verifiquen la lógica del backend,  
**para que** refactorizar sin miedo a romper functionality.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Backend Testing - pytest

  Scenario: Tests para CREATE lead
    Given que tengo tests para todos los casos de create
    When ejecuto "pytest tests/test_leads_create.py"
    Then todos los tests pasan
    And la cobertura es >= 90% para create logic

  Scenario: Tests para UPDATE lead
    Given que tengo tests para todos los casos de edit
    When ejecuto "pytest tests/test_leads_edit.py"
    Then todos los tests pasan
    And la cobertura es >= 90%

  Scenario: Tests para STATUS change
    Given que tengo tests para status change
    When ejecuto "pytest tests/test_leads_status.py"
    Then todos los tests pasan
    And incluye idempotency tests

  Scenario: Tests para GET leads (list, filter, pagination)
    Given que tengo tests para list endpoint
    When ejecuto "pytest tests/test_leads_list.py"
    Then todos los tests pasan
    And cobertura >= 85%

  Scenario: Tests para validaciones
    Given que tengo tests para todas las validaciones
    When ejecuto "pytest tests/test_validations.py"
    Then todos los tests pasan (email format, length, unique, etc)

  Scenario: Tests para timeline/audit
    Given que tengo tests para audit log
    When ejecuto "pytest tests/test_audit.py"
    Then se verifica que eventos se crean automáticamente

  Scenario: Coverage >= 75% total
    Given que ejecuto coverage report
    When se analiza la cobertura
    Then backend tiene >= 75% coverage (código + branches)
    And los gaps están documentados (why intentionally untested)

  Scenario: Tests pasan en CI/CD
    Given que hago push a GitHub
    When GitHub Actions ejecuta tests
    Then todos los pytest pasan
    And coverage es >= 75%
    And no hay regressions
```

#### Tareas Técnicas
- [ ] Fixtures pytest:
  - db_session (SQLAlchemy session)
  - client (TestClient de FastAPI)
  - sample_leads (datos de prueba)
- [ ] Tests escritos para:
  - POST /api/leads (válido, duplicado email, validaciones)
  - PUT /api/leads/{id} (válido, parcial, not found)
  - PATCH /api/leads/{id}/status (válido, inválido, idempotency)
  - GET /api/leads (todos, filtro, paginación)
  - GET /api/leads/at-risk
  - GET /api/leads/{id}/timeline
  - POST /api/leads/{id}/notes
- [ ] Coverage report: `pytest --cov=app --cov-report=html`
- [ ] CI/CD: GitHub Actions ejecutando tests

#### Definición de Hecho (DoD)
- [x] Tests pasan localmente y en CI
- [x] Coverage >= 75%
- [x] Todos los paths principales testeados
- [x] Fixtures reutilizables
- [x] Nombres de tests descriptivos

#### Testing
```bash
# pytest tests/ -v
# pytest --cov=app
# pytest tests/test_leads_create.py -v
```

---

### 📌 STORY 8.2: Automated Testing - Frontend Tests (Vitest) + E2E (Playwright)

**ID:** E8-S2  
**Tipo:** Quality Assurance  
**Story Points:** 8  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** desarrollador,  
**quiero** tener tests frontend e2e que verifiquen la UI,  
**para que** cambios no rompan la UX.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Frontend Testing - Vitest + Playwright

  Scenario: Unit tests con Vitest
    Given que tengo tests para componentes principales
    When ejecuto "npm run test"
    Then todos los unit tests pasan
    And cobertura >= 70% para componentes

  Scenario: E2E tests con Playwright
    Given que tengo tests e2e para user journeys
    When ejecuto "npm run test:e2e"
    Then todos los e2e tests pasan
    And incluye: crear lead, cambiar status, buscar

  Scenario: Unit tests para hooks
    Given que tengo custom hooks (useLeads, useSearch, etc)
    When ejecuto tests
    Then se verifica que hooks usan queries/mutations correctamente

  Scenario: Tests para componentes UI
    Given que tengo tests para CreateLeadModal, KanbanBoard, etc
    When ejecuto tests
    Then se verifica render, validaciones, error handling

  Scenario: E2E tests: Create Lead journey
    Given que el app está corriendo en playwright
    When ejecuto e2e test para crear lead
    Then:
      1. Click "+ Nuevo Lead"
      2. Rellenar form
      3. Click "Crear Lead"
      4. Toast aparece
      5. Nuevo lead en Kanban
      6. Verificar en BD con query

  Scenario: E2E tests: Drag & Drop
    Given que tengo lead en columna "Nuevo"
    When ejecuto e2e test para drag & drop
    Then:
      1. Arrastro lead a "En contacto"
      2. Lead se mueve en UI
      3. Backend se sincroniza
      4. Recargo página y lead está en nueva columna

  Scenario: E2E tests: Search
    Given que tengo múltiples leads
    When ejecuto test de búsqueda
    Then:
      1. Escribo "juan"
      2. Debounce espera 300ms
      3. Results se filtran
      4. Solo leads con "juan" aparecen

  Scenario: E2E tests: Responsive
    Given que tengo tests responsive
    When ejecuto con viewport mobile (320px)
    Then:
      1. Layout es vertical
      2. Modals son full-screen
      3. Buttons son clickeables
```

#### Tareas Técnicas
- [ ] Vitest setup:
  - vitest.config.ts
  - Setup testing library
  - MSW (Mock Service Worker) para mock API
- [ ] Unit tests:
  - tests/components/ (CreateLeadModal, KanbanBoard, LeadCard, etc)
  - tests/hooks/ (useLeads, useSearch, useAtRisk, etc)
  - tests/utils/ (validations, formatters, etc)
- [ ] E2E tests con Playwright:
  - tests/e2e/create-lead.spec.ts
  - tests/e2e/drag-drop.spec.ts
  - tests/e2e/search.spec.ts
  - tests/e2e/responsive.spec.ts
- [ ] Playwright fixtures:
  - page con url base
  - cleanup after test
- [ ] Coverage: `npm run test -- --coverage`

#### Definición de Hecho (DoD)
- [x] Unit tests pasan
- [x] E2E tests pasan
- [x] Coverage >= 70% para componentes
- [x] Tests son determinísticos (no flaky)
- [x] CI ejecuta tests automáticamente

#### Testing
```bash
# npm run test (vitest)
# npm run test:e2e (playwright)
# npm run test -- --coverage
```

---

### 📌 STORY 8.3: Documentación Completa + Demo Runbook

**ID:** E8-S3  
**Tipo:** Documentation  
**Story Points:** -3 (no story points, es tarea de cierre)  
**Prioridad:** P1  
**Asignado a:** Developer Full-stack  

**Como** stakeholder/demo attendee,  
**quiero** tener documentación clara y runbook de demo,  
**para que** la demostración sea exitosa sin hiccups.

#### Criterios de Aceptación (Gherkin)

```gherkin
Feature: Documentación Completa

  Scenario: README.md con setup
    Given que clono el repo
    When leo el README.md
    Then entiendo cómo:
      1. Clonar el repo
      2. Instalar dependencias
      3. Ejecutar docker-compose up
      4. Acceder a la aplicación
      5. Ejecutar tests

  Scenario: Architecture.md documento
    Given que leo Architecture.md
    Then entiendo:
      1. Stack técnico elegido y por qué
      2. Decisiones de arquitectura
      3. Database schema y justificación
      4. API design patterns
      5. Frontend state management

  Scenario: API Documentation (Swagger)
    Given que accedo a http://localhost:8000/docs
    Then veo:
      1. Todos los endpoints documentados
      2. Request/response schemas
      3. Códigos de error
      4. Ejemplos de uso

  Scenario: Database ER Diagram
    Given que leo la documentación
    Then hay un diagrama ER que muestra:
      1. Tabla leads con todas las columnas
      2. Tabla lead_audit_log
      3. Foreign keys
      4. Índices
      5. Constraints

  Scenario: Demo Runbook
    Given que tengo el demo runbook
    Then contiene:
      1. Prerequisites (hardware, software)
      2. Setup steps (paso a paso)
      3. Demo script (qué demostrar en qué orden)
      4. Talking points (qué decir sobre cada feature)
      5. Backup plan (si algo falla)
      6. Troubleshooting (problemas comunes + soluciones)

  Scenario: Demo Script paso a paso
    Given que ejecuto el demo script
    Then cubre:
      1. Login (demo/demo123)
      2. Vista inicial Kanban con datos de seed
      3. Crear un nuevo lead
      4. Ver el lead aparecer en columna "Nuevo"
      5. Cambiar estado (drag & drop)
      6. Ver timeline/auditoría del lead
      7. Búsqueda (filtrar por nombre)
      8. Widget "Leads en Riesgo"
      9. Responsivo (mostrar en mobile si tiempo)
      10. Final: Resumen de features

  Scenario: Troubleshooting guide
    Given que algo sale mal en la demo
    Then el runbook tiene soluciones para:
      1. Docker no inicia
      2. Puerto 8000 en uso
      3. Puerto 3000 en uso
      4. Database no inicializa
      5. API returns 500
      6. Seeds no cargadas
      7. Network error en demo

  Scenario: Seed data para demo
    Given que ejecuto el app
    When los datos iniciales cargan
    Then tengo ~20 leads pre-cargados con:
      1. Diversos states (Nuevo, En contacto, Propuesta, Cerrado)
      2. Leads en riesgo (sin cambios hace >7 días)
      3. Nombres y empresas realistas
      4. Mix de estados para mostrar Kanban bonito
```

#### Tareas Técnicas
- [ ] README.md:
  - Project overview
  - Tech stack
  - Prerequisites
  - Setup instructions
  - Running locally
  - Running tests
  - Docker setup
- [ ] Architecture.md:
  - Technology decisions
  - Stack diagram
  - Database schema
  - API design patterns
  - Frontend architecture
  - Security considerations
  - Future improvements
- [ ] API Documentation:
  - Swagger/OpenAPI comments en endpoints
  - Request/response examples
  - Error codes
  - Accessible via /docs
- [ ] Database ER Diagram:
  - ASCII art o PNG
  - Incluir en Architecture.md
- [ ] Demo Runbook (DEMO_RUNBOOK.md):
  - Checklist pre-demo
  - Setup steps (con tiempos)
  - Demo script (timeline, talking points)
  - Backup slides si falla algo
  - Troubleshooting Q&A
- [ ] Seed data:
  - SQL insert statements o migration Alembic
  - 20 leads con mix de states
  - Include "at-risk" leads
  - Realistic company/person names

#### Definición de Hecho (DoD)
- [x] README es claro y completo
- [x] Architecture.md documenta decisiones
- [x] API está auto-documentada en Swagger
- [x] ER diagram está dibujado
- [x] Demo runbook es detallado y testeado
- [x] Seed data está cargable con un comando
- [x] Todos los links en docs funcionan

#### Tareas
- [ ] Escribir README.md
- [ ] Escribir Architecture.md
- [ ] Añadir Swagger comments a endpoints
- [ ] Crear ER diagram
- [ ] Escribir DEMO_RUNBOOK.md
- [ ] Crear seed data migration
- [ ] Testar demo script (dry run)

---

## 📋 MATRIZ DE TRAZABILIDAD
### Requisitos → Epics → Stories

| Requisito | Epic | Stories | Prioridad |
|-----------|------|---------|-----------|
| FR-1 (Kanban) | Epic 3 | 3.1, 3.2, 3.3 | P0 |
| FR-2 (Crear Lead) | Epic 2 | 2.1, 2.4 | P0 |
| FR-3 (Cambiar Estado) | Epic 2, 3 | 2.3, 3.3 | P0 |
| FR-4 (Timeline) | Epic 5 | 5.1 | P2 |
| FR-5 (Leads en Riesgo) | Epic 4 | 4.2 | P1 |
| FR-6 (Búsqueda) | Epic 4 | 4.1 | P1 |
| FR-7 (Editar Lead) | Epic 2 | 2.2 | P0 |
| NFR-1 (Performance) | Epic 7 | 7.1, 7.2 | P1 |
| NFR-2 (Disponibilidad) | Epic 7 | 7.3 | P1 |
| NFR-3 (Seguridad) | Epic 2 | 2.1 (validación) | P1 |
| NFR-4 (Escalabilidad) | Epic 1, 7 | 1.2, 7.2 | P1 |
| NFR-5 (Confiabilidad) | Epic 7, 8 | 7.3, 8.1 | P1 |
| ARCH-1 (Stack) | Epic 1 | 1.1, 1.3, 1.4 | P0 |
| ARCH-2 (BD) | Epic 1 | 1.2 | P0 |
| ARCH-3 (Patterns) | Epic 7 | 7.2, 7.3 | P1 |
| ARCH-4 (DevOps) | Epic 1 | 1.4 | P0 |
| ARCH-5 (Testing) | Epic 8 | 8.1, 8.2 | P1 |
| ARCH-6 (Docs) | Epic 8 | 8.3 | P1 |
| UX-DR-1 (Responsive) | Epic 6 | 6.1 | P1 |
| UX-DR-2 (Colors) | Epic 6 | 6.2 | P2 |
| UX-DR-3 (Cards) | Epic 3 | 3.2 | P1 |
| UX-DR-4 (Animations) | Epic 6 | 6.2 | P2 |
| UX-DR-5 (States) | Epic 3, 6 | 3.2, 6.2 | P1 |
| UX-DR-6 (Accessibility) | Epic 6 | 6.3 | P2 |
| UX-DR-7 (Validation) | Epic 2 | 2.1, 2.2 | P0 |

---

## 🎯 ROADMAP TEMPORAL

### Day 1 - Morning (9:00-13:00)
- **E1-S1:** Docker Setup (1.5h)
- **E1-S2:** Database Schema (1h)
- **E1-S3:** React Frontend Setup (1.5h)
- **E1-S4:** Docker Compose Integration (0.5h)
- Total: ~5.5h

### Day 1 - Afternoon (14:00-18:00)
- **E2-S1:** Create Lead API (1.5h)
- **E2-S2:** Edit Lead API (1h)
- **E2-S3:** Change Status API (0.5h)
- **E3-S1:** List Leads API (0.5h)
- **E3-S2:** Kanban Frontend (1.5h)
- Total: ~5h

### Day 2 - Morning (9:00-13:00)
- **E3-S3:** Drag & Drop (1.5h)
- **E2-S4:** Create Modal (1.5h)
- **E4-S1:** Search/Filter (1h)
- **E4-S2:** At-Risk Widget (0.5h)
- **E5-S1:** Timeline (1h)
- Total: ~5.5h

### Day 2 - Afternoon (14:00-18:00)
- **E6-S1:** Responsive Design (1h)
- **E6-S2:** Animations (1h)
- **E6-S3:** Accessibility (1h)
- **E7-S1:** Performance Opt (0.5h)
- **E7-S2:** Query Optimization (0.5h)
- **E7-S3:** Error Handling (1h)
- **E8-S1, 8.2, 8.3:** Testing + Docs (1.5h)
- Total: ~7h

**Grand Total:** 48 horas (ajustable según velocidad del equipo)

---

## 📝 NOTAS FINALES

### Definición de Hecho (DoD) Global
Cada story debe cumplir:
- ✓ Código pasa linting (ESLint, Black/Flake8)
- ✓ Tests pasan (>80% cobertura de la story)
- ✓ Sin console errors/warnings
- ✓ Funcionalidad verificada manualmente
- ✓ Integración con stack existente validada
- ✓ Documentación inline (docstrings, comments si necesario)
- ✓ PR review aprobado

### Criterios de Aceptación por Nivel
- **Story Level:** Gherkin format, testeable, con DoD específico
- **Epic Level:** Todas las stories completadas, criterio de éxito cumplido
- **Project Level:** 8 epics completados, documentación lista, demo exitosa

### Métricas de Éxito
- [x] 144 Story Points completados
- [x] 26 User Stories implementadas
- [x] >70% test coverage
- [x] <2s initial load time
- [x] API p95 <300ms
- [x] 0 críticos bugs en demo
- [x] Documentación 100% completada
- [x] Stack dockerizado y reproducible

---

**Documento Versión:** 2.0  
**Última Actualización:** 2026-06-07  
**Próxima Review:** Posterior a completar Epic 1
