# Multi-stage Dockerfile for FastAPI backend
# Stage 1: Builder - compile dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Stage 2: Runtime - minimal image with only runtime dependencies
FROM python:3.11-slim

WORKDIR /app/backend

# Install only runtime dependencies (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Set Python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app/backend

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=30s \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run migrations and then start Uvicorn with conditional auto-reload based on ENVIRONMENT variable
CMD ["sh", "-c", "alembic upgrade head && if [ \"$ENVIRONMENT\" = \"development\" ]; then uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; else uvicorn app.main:app --host 0.0.0.0 --port 8000; fi"]
