# ==============================================================================
# Production Dockerfile for Post-Disaster Information Fog AI Backend
# Optimized for Render, Cloud Run, AWS ECS, Fly.io, and Local Docker
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HF_HOME=/app/.cache/huggingface \
    SENTENCE_TRANSFORMERS_HOME=/app/.cache/torch/sentence_transformers \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    TOKENIZERS_PARALLELISM=false

# Set working directory
WORKDIR /app

# Install minimal build dependencies and curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies (leveraging Docker layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download SentenceTransformers model into Docker image cache during build
# This eliminates network latency and cold-start download timeouts on deployment
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application source code
COPY app/ ./app/
COPY prepare_dataset.py .

# Ensure dataset directory exists without breaking build when dataset is empty/gitignored
RUN mkdir -p dataset

# Create a non-root system user for security best practices
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port (Render dynamically provides $PORT at runtime)
EXPOSE 8000

# Health check to ensure service vitality
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/ || exit 1

# Start Uvicorn ASGI server with dynamic PORT binding
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
