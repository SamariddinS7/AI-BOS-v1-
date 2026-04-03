# AI-BOS Deployment Guide

This document outlines the deployment strategies for the AI-BOS platform, covering various environments and configurations.

## 1. Deployment Modes

AI-BOS supports three primary deployment modes to cater to different enterprise needs:

### 1.1 On-Premise Mode (Air-Gapped)
- **Use Case**: Government, Defense, Highly Regulated Industries.
- **Architecture**:
    - **Frontend**: Served locally via Nginx.
    - **Backend**: Runs on internal servers.
    - **Database**: PostgreSQL on dedicated hardware or VM.
    - **AI Models**: **Local Only** (Llama 3, Mistral, etc.) running on on-prem GPUs.
    - **External Access**: **None**. No internet connection required.
- **Configuration**: Set `AI_MODE=PURE_LOCAL` in `.env`.

### 1.2 Hybrid Mode (Recommended)
- **Use Case**: Standard Enterprise, SaaS.
- **Architecture**:
    - **Frontend/Backend**: Cloud-hosted (AWS/GCP/Azure) or On-Prem.
    - **Database**: Managed RDS/Cloud SQL or Self-Hosted.
    - **AI Models**:
        - **Sensitive Tasks**: Local Models (PII processing, internal strategy).
        - **General Tasks**: Cloud Models (OpenAI/Anthropic for creative writing, summarization).
    - **Failover**: Cloud -> Local fallback enabled.
- **Configuration**: Set `AI_MODE=HYBRID` in `.env`.

### 1.3 Cloud-Assisted Mode (SaaS)
- **Use Case**: Startups, Small Business.
- **Architecture**:
    - **All Components**: Cloud-native (Serverless or Containers).
    - **AI Models**: Primarily Cloud APIs for cost efficiency and scalability.
    - **Local Models**: Optional for specific features or offline capability.
- **Configuration**: Set `AI_MODE=PURE_CLOUD` in `.env`.

## 2. Infrastructure Requirements

### 2.1 Minimum Hardware (On-Prem / Local Dev)
- **CPU**: 4+ Cores (8+ recommended for local inference).
- **RAM**: 16GB+ (32GB+ for local LLMs).
- **GPU**: NVIDIA GPU with 8GB+ VRAM (Optional but recommended for local LLMs).
- **Storage**: 50GB+ SSD.

### 2.2 Software Dependencies
- **Docker**: Engine 20.10+.
- **Docker Compose**: v2.0+.
- **Kubernetes**: v1.24+ (for production clusters).
- **NVIDIA Container Toolkit**: For GPU support in Docker.

## 3. Deployment Steps

### 3.1 Docker Compose (Local Development / Small Scale)
1.  **Clone Repository**:
    ```bash
    git clone https://github.com/your-org/ai-bos.git
    cd ai-bos
    ```
2.  **Configure Environment**:
    ```bash
    cp infra/env/.env.example infra/docker/.env
    # Edit .env with your secrets and configuration
    ```
3.  **Build & Run**:
    ```bash
    cd infra/docker
    docker-compose up --build -d
    ```
4.  **Verify**:
    - Frontend: `http://localhost:80`
    - Backend API: `http://localhost:8000/docs`

### 3.2 Kubernetes (Production)
1.  **Prerequisites**:
    - Running K8s cluster.
    - `kubectl` configured.
    - Secrets management solution (Vault/K8s Secrets).
2.  **Create Secrets**:
    ```bash
    kubectl create secret generic ai-bos-secrets --from-env-file=infra/env/.env.production
    ```
3.  **Apply Manifests**:
    ```bash
    kubectl apply -f infra/k8s/postgres.yaml
    kubectl apply -f infra/k8s/redis.yaml
    kubectl apply -f infra/k8s/backend-deployment.yaml
    kubectl apply -f infra/k8s/frontend-deployment.yaml
    kubectl apply -f infra/k8s/ingress.yaml
    ```
4.  **Verify**:
    ```bash
    kubectl get pods
    kubectl get ingress
    ```

## 4. GPU Inference Separation

For optimal performance and cost management, AI inference workloads should be separated from general application logic.

- **Dedicated Node Pools**: In Kubernetes, use taints and tolerations to schedule AI pods on GPU-enabled nodes.
    ```yaml
    # In backend-deployment.yaml (or separate ai-worker deployment)
    tolerations:
    - key: "accelerator"
      operator: "Equal"
      value: "nvidia-gpu"
      effect: "NoSchedule"
    ```
- **Microservices**: Consider splitting the `intelligence` module into a separate microservice if AI load becomes significant, allowing independent scaling.

## 5. Monitoring & Maintenance

- **Logs**: Centralized logging (ELK/Fluentd) is crucial for debugging distributed AI transactions.
- **Metrics**: Monitor `ai_latency_seconds` and `gpu_utilization` in Grafana.
- **Backups**: Automated daily backups of PostgreSQL and Redis are configured in the infrastructure scripts (to be implemented/verified).
- **Updates**: Use Rolling Updates in Kubernetes to ensure zero downtime during version upgrades.
