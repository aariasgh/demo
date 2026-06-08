.PHONY: up down logs logs-backend logs-postgres logs-frontend reset shell-backend shell-postgres db-reset help

help:
	@echo "Mini CRM Docker Compose Helper"
	@echo ""
	@echo "Available commands:"
	@echo "  make up              Start all services (docker-compose up -d)"
	@echo "  make down            Stop all services"
	@echo "  make logs            Show all logs (follow mode)"
	@echo "  make logs-backend    Show backend logs only"
	@echo "  make logs-postgres   Show postgres logs only"
	@echo "  make logs-frontend   Show frontend logs only"
	@echo "  make reset           Stop services, remove volumes, and restart (⚠️ wipes data)"
	@echo "  make shell-backend   Open bash shell in backend container"
	@echo "  make shell-postgres  Open psql shell in postgres container"
	@echo "  make db-reset        Reset database to initial state"
	@echo "  make health          Check health of all services"

up:
	docker-compose up -d
	@echo "✅ Services starting... Wait 20 seconds for startup"

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-postgres:
	docker-compose logs -f postgres

logs-frontend:
	docker-compose logs -f frontend

reset:
	@echo "⚠️  Removing all volumes and restarting..."
	docker-compose down -v
	docker-compose up -d
	@echo "✅ Services restarted with fresh database"

shell-backend:
	docker-compose exec backend bash

shell-postgres:
	docker-compose exec postgres psql -U postgres -d minicrmdb

db-reset:
	docker-compose exec postgres psql -U postgres -d minicrmdb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	@echo "✅ Database reset to initial state"

health:
	@echo "Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "Testing backend health endpoint..."
	@curl -s http://localhost:8000/api/health | jq . || echo "Backend not responding"
