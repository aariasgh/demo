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

### Instalación y Ejecución

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd demo

# 2. Crear archivo .env (copiar de ejemplo)
cp backend/.env.example backend/.env

# 3. Iniciar servicios
docker-compose up -d

# 4. Esperar 15-20 segundos para que los servicios se initialicen

# 5. Verificar que todo funciona
curl http://localhost:8000/api/health
# Output: {"status": "ok", "timestamp": "2026-06-07T...Z"}
```

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
