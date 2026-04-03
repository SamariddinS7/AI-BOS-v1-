# AI-BOS Deployment Guide

This guide covers deployment for Local Development, Docker Compose, and Kubernetes.

## 1. Local Development (Docker Compose)

The easiest way to run the full stack locally.

### Prerequisites
- Docker & Docker Compose
- NVIDIA Container Toolkit (optional, for local GPU LLM)

### Steps
1. Navigate to `infra/docker`.
2. Run:
   ```bash
   docker-compose up --build -d
   ```
3. Access:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000/docs
   - Postgres: localhost:5432
   - Redis: localhost:6379

### Environment Variables
Edit `docker-compose.yml` or create a `.env` file in `infra/docker` based on `infra/env/.env.example`.

## 2. Kubernetes Deployment

Production-ready deployment manifest.

### Prerequisites
- Kubernetes Cluster (EKS, GKE, AKS, or Minikube)
- `kubectl` configured
- Secrets management (e.g., HashiCorp Vault or K8s Secrets)

### Steps
1. Create Secrets:
   ```bash
   kubectl create secret generic ai-bos-secrets \
     --from-literal=database_url='postgresql://user:pass@postgres:5432/ai_bos' \
     --from-literal=redis_url='redis://redis:6379/0' \
     --from-literal=postgres_password='securepassword'
   ```
2. Apply Manifests:
   ```bash
   kubectl apply -f infra/k8s/postgres.yaml
   kubectl apply -f infra/k8s/redis.yaml
   kubectl apply -f infra/k8s/backend-deployment.yaml
   kubectl apply -f infra/k8s/frontend-deployment.yaml
   kubectl apply -f infra/k8s/ingress.yaml
   ```

### Scaling
- **HPA**: Horizontal Pod Autoscalers are configured to scale based on CPU usage.
- **GPU**: Ensure nodes have labels `accelerator=nvidia-gpu` for local LLM pods (if added to K8s).

## 3. Hybrid Mode Configuration

To enable Hybrid Mode (Cloud + Local AI):
1. Set `AI_MODE=HYBRID` in environment variables.
2. Provide Cloud API Keys (OpenAI/Anthropic) in secrets.
3. Ensure Local LLM service is reachable (internal K8s DNS or external URL).

## 4. Security Notes
- **Non-root containers**: All images run as non-root users.
- **Network Policies**: By default, only Frontend talks to Backend. Backend talks to DB/Redis.
- **Secrets**: Never commit `.env` files. Use K8s Secrets or a Secret Manager.
