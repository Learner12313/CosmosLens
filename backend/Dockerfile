# ─────────────────────────────────────────────────────────────
#  CosmosLens Backend — Multi-stage Dockerfile
#  Python 3.11-slim, non-root user, production-ready
# ─────────────────────────────────────────────────────────────

# ─── Stage 1: Builder ───────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build deps for psycopg2, cryptography, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        libffi-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better layer caching)
COPY requirements.txt requirements.txt

# Upgrade pip and install deps to a target dir
RUN pip install --upgrade pip setuptools wheel \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt

# ─── Stage 2: Runtime ───────────────────────────────────────
FROM python:3.11-slim AS runtime

LABEL org.opencontainers.image.title="CosmosLens Backend"
LABEL org.opencontainers.image.description="Earth & Space Intelligence Platform — FastAPI backend"
LABEL org.opencontainers.image.source="https://github.com/sai-ganesh-4539/CosmosLens"
LABEL org.opencontainers.image.licenses="MIT"

# Runtime deps for psycopg2, curl for healthcheck, tini for signal handling
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
        tini \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Create non-root user
RUN groupadd -r cosmoslens && useradd -r -g cosmoslens -d /app -s /sbin/nologin cosmoslens

WORKDIR /app

# Copy application code
COPY --chown=cosmoslens:cosmoslens . /app

# Create directory for logs
RUN mkdir -p /app/logs && chown -R cosmoslens:cosmoslens /app/logs

# Switch to non-root user
USER cosmoslens

# Expose FastAPI port
EXPOSE 8000

# Health check — hit the /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Use tini as init for proper signal handling
ENTRYPOINT ["/usr/bin/tini", "--"]

# Run uvicorn with 4 workers
CMD ["uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4", \
     "--proxy-headers", \
     "--forwarded-allow-ips", "*"]