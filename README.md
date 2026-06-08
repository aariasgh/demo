# Mini CRM de Seguimiento de Clientes

Backend FastAPI con PostgreSQL y Docker Compose para gestión de leads.

## 📋 Descripción

Mini CRM funcional para demostración de BMAD (metodología de consultoría). Incluye:
- Backend API en FastAPI (Python 3.11+)
- Base de datos PostgreSQL 15
- Containerización con Docker Compose
- Hot-reload en desarrollo
- Swagger OpenAPI automático

## 🚀 Inicio Rápido

### Requisitos Previos

- Docker 24+
- Docker Compose 2.0+
- (Opcional) Make para comandos simplificados

### Instalación y Ejecución (Quick Start)

**3 pasos para empezar:**

```bash
# 1️⃣ Clonar y navegar
git clone <repo-url>
cd demo

# 2️⃣ Iniciar todos los servicios
docker-compose up -d

# 3️⃣ Esperar a que esté listo (~15-20 segundos)
docker-compose ps
# Verificar que todos tengan estado "healthy"
```

**Verificación rápida:**

```bash
# Backend health (debe responder 200)
curl http://localhost:8000/api/health

# Frontend (debe servir HTML)
curl http://localhost:3000 | head -5

# Swagger docs
open http://localhost:8000/docs
```

### Docker Compose Stack

Todos los servicios se ejecutan en contenedores interconectados:

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Frontend  │         │   Backend   │         │  PostgreSQL  │
│  (Nginx)    │◄───────►│  (FastAPI)  │◄───────►│   (TCP 5432) │
│ Port 3000   │         │ Port 8000   │         │              │
└─────────────┘         └─────────────┘         └──────────────┘
       ↓                        ↓                       ↓
  React 18.3.1          Python 3.11+              Alpine 15
  Vite + HMR            uvicorn                   Volume: postgres_data
```

**Health Checks:**
- ✅ PostgreSQL: `pg_isready` every 10s (startup: 10s)
- ✅ Backend: `GET /api/health` every 10s (startup: 30s)
- ✅ Frontend: `GET /` every 30s (startup: 5s)

All services are **healthy** typically within **20-30 seconds** of `docker-compose up -d`.

### Acceso a Servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Swagger UI** | http://localhost:8000/docs | Documentación OpenAPI interactiva |
| **ReDoc** | http://localhost:8000/redoc | Documentación alternativa |
| **Health Check** | http://localhost:8000/api/health | Estado del backend |
| **Backend API** | http://localhost:8000 | API REST endpoints |
| **PostgreSQL** | localhost:5432 | Base de datos |

## 📖 Comandos Útiles

```bash
# Usar Makefile para comandos simplificados
make help                # Ver todos los comandos disponibles
make up                  # Iniciar servicios
make down                # Detener servicios
make logs                # Ver logs de todos los servicios
make logs-backend        # Ver logs del backend solo
make shell-backend       # Abrir bash en contenedor backend
make shell-postgres      # Abrir psql en contenedor postgres
make reset               # Reiniciar todo y borrar datos (⚠️)
make health              # Verificar estado de servicios

# O usar docker-compose directamente
docker-compose up -d              # Iniciar servicios
docker-compose down               # Detener servicios
docker-compose logs -f backend    # Ver logs
docker-compose exec postgres psql -U postgres -d minicrmdb  # Acceder BD
```

## 🧪 Testing

```bash
# Ejecutar tests del health endpoint
docker-compose exec backend pytest tests/test_health.py -v

# Ejecutar todos los tests con cobertura
docker-compose exec backend pytest --cov=app tests/
```

## 🏗️ Estructura del Proyecto

```
demo/
├── backend/                      # Código Python FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Aplicación FastAPI
│   │   ├── config.py            # Configuración (Pydantic)
│   │   ├── database/
│   │   │   ├── core.py          # SQLAlchemy engine + sesión
│   │   │   └── session.py       # Dependencias DB
│   │   ├── routers/
│   │   │   ├── health.py        # Health check endpoint
│   │   │   └── ...              # Otros endpoints (E2+)
│   │   ├── models/              # ORM models (E1-S2+)
│   │   ├── schemas/             # Pydantic schemas (E2+)
│   │   └── utils/               # Utilidades
│   ├── tests/
│   │   ├── test_health.py       # Tests del health endpoint
│   │   └── ...                  # Otros tests (E2+)
│   ├── Dockerfile               # Multi-stage build
│   ├── requirements.txt         # Dependencias Python
│   └── .env.example             # Plantilla de variables de entorno
├── frontend/                     # Frontend React (E1-S3+)
├── docker-compose.yml           # Orquestación de servicios
├── Makefile                     # Comandos de utilidad
├── README.md                    # Este archivo
└── .gitignore                   # Archivos ignorados por git
```

## 🔧 Configuración

### Variables de Entorno

Crear `backend/.env` basado en `backend/.env.example`:

```bash
# Database
DB_HOST=postgres           # Nombre del servicio Docker
DB_PORT=5432             # Puerto PostgreSQL
DB_USER=postgres         # Usuario BD
DB_PASSWORD=postgres     # Contraseña BD
DB_NAME=minicrmdb        # Nombre de BD

# FastAPI
ENVIRONMENT=development  # development o production
DEBUG=True              # Habilitar modo debug
```

### Puertos

- **8000:** Backend FastAPI
- **3000:** Frontend (E1-S3+)
- **5432:** PostgreSQL

Si los puertos están en uso, modificar en `docker-compose.yml`.

## ❓ Solución de Problemas

### Problema: "Port 8000 already in use"

```bash
# Encontrar proceso usando puerto 8000
lsof -i :8000
# O en Windows:
netstat -ano | findstr :8000

# Matar proceso o usar puerto diferente en docker-compose.yml
```

### Problema: "docker-compose: command not found"

Usar `docker compose` (versión nueva):
```bash
docker compose up -d  # en lugar de docker-compose up -d
```

### Problema: Backend container no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar que .env existe con valores correctos
cat backend/.env

# Rebuild si hay cambios en dependencias
docker-compose up -d --build backend
```

### Problema: Frontend container unhealthy / nginx errors

```bash
# Ver logs de frontend
docker-compose logs frontend

# Common issues:
# - Port 3000 already in use → cambiar puerto en docker-compose.yml
# - Node version mismatch → rebuild con: docker-compose up -d --build frontend
# - Memory issues → aumentar Docker memory limit

# Rebuild frontend desde cero
docker-compose down
docker-compose up -d --build frontend
```

### Problema: PostgreSQL connection refused

```bash
# Verificar que PostgreSQL está healthy
docker-compose ps
# Status debe ser "Up ... (healthy)"

# Ver logs de postgres
docker-compose logs postgres

# Resetear volumen (⚠️ BORRA TODOS LOS DATOS)
docker-compose down -v
docker-compose up -d
```

### Problema: CORS errors entre Frontend y Backend

```bash
# Verificar encabezados CORS
curl -v -H "Origin: http://localhost:3000" http://localhost:8000/api/health

# Backend debe responder con:
# access-control-allow-origin: http://localhost:3000

# Si falla: reiniciar backend
docker-compose restart backend
```

### Limpieza y Reset

```bash
# Detener todos los servicios sin borrar datos
docker-compose down

# Detener y borrar volúmenes (⚠️ BORRA BASE DE DATOS)
docker-compose down -v

# Reconstruir todas las imágenes
docker-compose up -d --build

# Limpiar todo (imágenes, volúmenes, redes)
docker system prune -a --volumes
```

# Reiniciar desde cero
make reset
```

### Problema: Conexión a PostgreSQL denegada

```bash
# Verificar que postgres está saludable
docker-compose ps

# Esperar más tiempo (start_period=30s) para que postgres se inicie

# O reiniciar postgres
docker-compose restart postgres
```

### Problema: Hot-reload no funciona

El código en `./backend/` debe ser reflejado automáticamente en el contenedor. Si no funciona:

```bash
# Verificar que volumes están mapeados
docker-compose config | grep -A2 "volumes:"

# Reiniciar backend
docker-compose restart backend
```

## 📝 Desarrollo

### Añadir nuevos endpoints

1. Crear módulo en `backend/app/routers/`
2. Implementar funciones async con FastAPI decorators
3. Importar en `backend/app/routers/__init__.py`
4. Registrar en `backend/app/main.py` con `app.include_router()`
5. Escribir tests en `backend/tests/test_*.py`

### Estructura de un endpoint

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db

router = APIRouter(prefix="/api/leads", tags=["leads"])

@router.get("/")
async def list_leads(db: AsyncSession = Depends(get_db)):
    """Listar todos los leads"""
    # Implementación aquí
    return {"leads": []}
```

### Migraciones de BD (Alembic - E1-S2)

```bash
# (Será completado en E1-S2)
# Generar nueva migración
docker-compose exec backend alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
docker-compose exec backend alembic upgrade head

# Revertir última migración
docker-compose exec backend alembic downgrade -1
```

## 🚢 Deployment

Este stack es para **desarrollo local**. Para producción:

1. Usar variables de entorno en secretos (no .env)
2. Habilitar HTTPS/TLS
3. Configurar autenticación
4. Usar orchestración (Kubernetes, ECS, etc.)
5. Implementar logging centralizado
6. Configurar monitoreo y alertas

## 📞 Soporte

Preguntas o problemas:
1. Revisar logs: `make logs`
2. Consultar archivo actual (README.md)
3. Contactar al equipo de desarrollo

## 📄 Licencia

Proyecto BMAD 2026

---

**Última actualización:** 2026-06-07  
**Estado:** Ready for Development  
**Siguiente paso:** E1-S2 (Database Schema)
