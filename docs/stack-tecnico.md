# Stack Técnico & Decisiones de Arquitectura

## 🔧 Stack de Desarrollo

### Frontend

**Gerenciador de Dependencias: pnpm**
- ✅ Use `pnpm` en lugar de `npm`
- Razón: Más rápido, mejor manejo de dependencias, ahorra espacio en disco
- Lock file: `pnpm-lock.yaml` (NO `package-lock.json`)

**Framework: [TBD con UX Designer]**
- Candidatos: React, Vue, Svelte
- Requisito: Componentes funcionales, estado reactivo, fácil de testear

**Build Tool & Dev Server:**
- Vite (recomendado) o similar

**Estilo & Temas:**
- TBD: Tailwind, Material UI, CSS modules, etc.

**Estado:**
- TBD: Redux, Zustand, Pinia, etc. (simple para MVP)

---

### Backend

**Lenguaje: Python (única opción)**
- ✅ Python 3.11+ 
- NO alternativas: solo Python
- Razón: Velocidad de desarrollo, ecosistema BMAD optimizado para Python

**Framework: FastAPI**
- Async-first (importante para I/O)
- OpenAPI documentation automática
- Validación con Pydantic
- Dependency injection nativo

**ORM & Migrations:**
- SQLAlchemy (ORM)
- Alembic (migrations)
- Ambos with PostgreSQL support

**API Pattern:**
- RESTful con endpoints claros
- Status codes estándar HTTP
- Respuestas JSON estructuradas

**Configuración:**
- Pydantic Settings para environment variables
- `.env` para desarrollo
- Secretos seguros (no hardcoded)

**Testing:**
- pytest como framework
- pytest-asyncio para async tests
- Mock/fixtures para aislamiento

---

### Base de Datos

**Motor: PostgreSQL (única opción)**
- ✅ PostgreSQL 14+ (latest stable)
- NO alternativas: solo PostgreSQL
- Hosted local en Docker durante desarrollo
- Producción: [TBD]

**Esquema:**

```sql
-- Tabla leads
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    empresa VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Nuevo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (estado IN ('Nuevo', 'En contacto', 'Propuesta enviada', 'Cerrado'))
);

-- Índices
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
```

**Backup & Recovery:**
- Definir estrategia de backup para producción

---

### Containerización & Deployment

**Docker Desktop (Desarrollo Local)**
- ✅ Usar Docker Desktop (local development)
- Cada servicio en su contenedor

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: minicrmdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/minicrmdb
      PYTHONUNBUFFERED: 1
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    command: pnpm run dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

**Producción:**
- [TBD] Kubernetes, ECS, Railway, etc.
- Imagen base: python:3.11-slim (para backend)
- Imagen base: node:18-alpine (para frontend)

---

## 📦 Dependencias Clave

### Backend (Python)

```txt
fastapi==0.104.0
uvicorn==0.24.0
sqlalchemy==2.0.0
alembic==1.13.0
psycopg2-binary==2.9.0  # PostgreSQL driver
pydantic==2.0.0
pydantic-settings==2.0.0
python-dotenv==1.0.0
pytest==7.0.0
pytest-asyncio==0.21.0
```

### Frontend (Node with pnpm)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## 🔐 Configuración & Secretos

### .env (Desarrollo - NO commit)

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/minicrmdb
POSTGRES_PASSWORD=password

# Backend
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

### Reglas de Seguridad

- ❌ NO hardcodear secretos en código
- ✅ Usar variables de entorno
- ✅ `.env` en `.gitignore`
- ✅ Producción: usar secrets manager (AWS Secrets, etc.)

---

## 📝 Estándares de Código

### Python

**Style Guide:** PEP 8  
**Formatter:** Black  
**Linter:** Pylint + Flake8  
**Type Checking:** mypy  

**Estructura de carpetas:**

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entry point
│   ├── api/
│   │   ├── __init__.py
│   │   └── leads.py         # Lead endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   └── lead.py          # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── lead.py          # Pydantic schemas
│   └── db/
│       ├── __init__.py
│       ├── connection.py    # DB config
│       └── base.py          # Base models
├── migrations/              # Alembic
├── tests/
├── main.py
└── requirements.txt
```

**Ejemplo de endpoint:**

```python
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadResponse
from app.db.connection import get_db

router = APIRouter(prefix="/api/leads", tags=["leads"])

@router.post("/", response_model=LeadResponse)
def crear_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    """Crear un nuevo lead"""
    nuevo_lead = Lead(nombre=lead.nombre, empresa=lead.empresa)
    db.add(nuevo_lead)
    db.commit()
    db.refresh(nuevo_lead)
    return nuevo_lead

@router.get("/")
def listar_leads(db: Session = Depends(get_db)):
    """Listar todos los leads"""
    return db.query(Lead).all()
```

### JavaScript/TypeScript (Frontend)

**Style Guide:** Airbnb + Prettier  
**Formatter:** Prettier  
**Linter:** ESLint  

**Estructura:**

```
frontend/
├── src/
│   ├── components/
│   │   ├── LeadForm.jsx
│   │   └── Kanban.jsx
│   ├── pages/
│   │   └── Dashboard.jsx
│   ├── services/
│   │   └── api.js          # Axios client
│   ├── styles/
│   │   └── tailwind.css
│   ├── App.jsx
│   └── main.jsx
├── public/
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🧪 Testing

### Backend Tests (pytest)

```python
# tests/test_leads.py
import pytest
from app.main import app
from app.db.connection import get_db

@pytest.fixture
def client():
    return TestClient(app)

def test_crear_lead(client):
    response = client.post("/api/leads/", json={
        "nombre": "Juan Silva",
        "empresa": "Acme Corp"
    })
    assert response.status_code == 200
    assert response.json()["nombre"] == "Juan Silva"

def test_listar_leads(client):
    response = client.get("/api/leads/")
    assert response.status_code == 200
```

### Frontend Tests (Vitest/Jest)

- TBD: componentes, integración, E2E

---

## 🚀 Comandos Esenciales

### Desarrollo Local

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # o .\ en Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
pnpm install
pnpm run dev

# Docker Compose (todo)
docker-compose up -d
```

### Testing

```bash
# Backend
pytest
pytest -v --cov

# Frontend
pnpm run test
```

### Build & Deploy

```bash
# Backend
docker build -t minicrm-backend ./backend

# Frontend
pnpm run build

# Docker Compose Production
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Decisiones Justificadas

| Decisión | Por Qué | Alternativas Descartadas |
|----------|---------|--------------------------|
| **pnpm** | Rápido, caché global, lock file determinístico | npm (lento), yarn (legacy) |
| **Python único backend** | Velocidad BMAD optimizada, ecosistema consistente | Node.js, Go, Rust |
| **FastAPI** | Async-first, validación automática, docs | Django (pesado), Flask (simple) |
| **PostgreSQL** | Relacional robusto, Window functions, JSONB | SQLite (MVP), MySQL, NoSQL |
| **Docker Desktop** | Desarrollo local aislado, reproducible | VMs, localhost direct |
| **SQLAlchemy + Alembic** | ORM + migrations, estándar industria | raw SQL, other ORMs |

---

## 🎯 Checklist Pre-Demo

- [ ] Backend corriendo en `localhost:8000`
- [ ] Frontend corriendo en `localhost:3000`
- [ ] PostgreSQL accesible en `localhost:5432`
- [ ] Crear lead funciona sin errores
- [ ] Kanban actualiza en tiempo real
- [ ] Cambiar estado persiste en DB
- [ ] Demo fluida sin latencias

---

## 📞 Puntos de Contacto

**Para decisiones técnicas adicionales, consultar:**
- Mimir (Builder) — implementación y arquitectura
- Freya (UX Designer) — frontend y interfaces
- Saga (Analyst) — requisitos y especificación
