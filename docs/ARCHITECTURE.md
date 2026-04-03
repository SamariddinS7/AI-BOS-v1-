# AI-BOS Unified Architecture Blueprint

## 1. Project Structure

The AI-BOS platform is organized into a modular, layered architecture designed for scalability, maintainability, and enterprise-grade resilience.

```text
/
├── frontend/                 # Presentation Layer (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── modules/          # Business module UIs (Finance, HR, CRM)
│   │   ├── services/         # API clients and data fetching
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Global state management
│   │   └── utils/            # Helper functions
│   ├── public/               # Static assets
│   └── ...
│
├── backend/                  # Application & Intelligence Layer (FastAPI)
│   ├── admin/                # Administrative controls & RBAC
│   ├── database/             # SQLAlchemy models & migrations
│   ├── intelligence/         # AI Orchestrator & Aggregators
│   ├── lifecycle/            # Model Versioning & A/B Testing
│   ├── middleware/           # Security, Metrics, & Logging
│   ├── modules/              # Core Business Logic (ERP)
│   │   ├── finance/
│   │   ├── hr/
│   │   ├── crm/
│   │   ├── analytics/
│   │   └── marketing/
│   ├── observability/        # Prometheus Metrics & Structured Logs
│   ├── resilience/           # Circuit Breakers & Self-Healing
│   ├── workflows/            # Business Process Automation
│   └── main.py               # Application Entry Point
│
├── infra/                    # Infrastructure & Deployment
│   ├── docker/               # Dockerfiles & Compose
│   ├── k8s/                  # Kubernetes Manifests
│   ├── nginx/                # Reverse Proxy Config
│   └── env/                  # Environment Templates
│
└── docs/                     # Architecture & Usage Documentation
```

## 2. Layered Architecture Design

The system is composed of distinct layers with strict boundaries and responsibilities.

### 2.1 Presentation Layer (Frontend)
- **Responsibility**: User interaction, data visualization, and state management.
- **Tech**: React, Vite, Tailwind CSS, Recharts.
- **Key Components**: Dashboard, Module Views, Admin Panel.

### 2.2 API Layer (Backend Interface)
- **Responsibility**: Request handling, validation, and routing.
- **Tech**: FastAPI, Pydantic.
- **Key Components**: Routers, Dependency Injection, Request Validation.

### 2.3 Security Layer
- **Responsibility**: Authentication, Authorization, and Data Protection.
- **Tech**: OAuth2, JWT, RBAC Middleware.
- **Key Components**: `SecurityMiddleware`, `RBACService`, `AuditLogger`.

### 2.4 Orchestration Layer
- **Responsibility**: Coordinating AI tasks and business workflows.
- **Tech**: Python Asyncio, Task Queues.
- **Key Components**: `AIOrchestrator`, `WorkflowEngine`.

### 2.5 Business Logic Layer (ERP Core)
- **Responsibility**: Domain-specific logic and data processing.
- **Tech**: Python Services.
- **Key Components**: `FinanceService`, `HRService`, `CRMService`.

### 2.6 Intelligence Layer
- **Responsibility**: AI inference, context aggregation, and decision making.
- **Tech**: PyTorch/TensorFlow (Local), OpenAI/Anthropic (Cloud).
- **Key Components**: `DataAggregator`, `ExecutiveInsightsEngine`, `MarketingAgents`.

### 2.7 Lifecycle Layer
- **Responsibility**: Managing AI model versions and deployments.
- **Tech**: SQLAlchemy, File System.
- **Key Components**: `ModelRegistry`, `VersionManager`, `ABTestingService`.

### 2.8 Resilience Layer
- **Responsibility**: Ensuring system stability and recovery.
- **Tech**: Circuit Breakers, Retry Policies.
- **Key Components**: `CircuitBreaker`, `FailoverManager`, `SelfHealingService`.

### 2.9 Infrastructure Layer
- **Responsibility**: Hosting, networking, and resource management.
- **Tech**: Docker, Kubernetes, Nginx, PostgreSQL, Redis.

### 2.10 Monitoring Layer
- **Responsibility**: System visibility and performance tracking.
- **Tech**: Prometheus, Grafana, Structured Logging.
- **Key Components**: `MetricsService`, `HealthRegistry`.

## 3. Service Interaction Flow

A typical user request flows through the system as follows:

1.  **User Request**: Client sends HTTP request (e.g., "Generate P&L Report").
2.  **API Gateway (Nginx)**: Routes request to Backend Service.
3.  **Security Middleware**: Validates JWT token and checks RBAC permissions.
4.  **Guardrails**: Input sanitization and policy checks (e.g., "No PII in prompts").
5.  **Orchestrator**: Determines if AI is needed.
    *   *If AI*: Aggregates context -> Selects Model -> Calls Inference.
    *   *If Logic*: Calls Business Service directly.
6.  **Business Module**: Executes core logic (e.g., query DB, calculate totals).
7.  **Intelligence Layer**: Enhances result with insights (e.g., "Revenue is down 5%").
8.  **Lifecycle Check**: Ensures active model is healthy.
9.  **Resilience Wrapper**: Retries on failure, falls back if needed.
10. **Response**: Formatted JSON sent back to client.
11. **Logging & Metrics**: Request duration, status, and AI confidence recorded.

## 4. Data Flow Model

### 4.1 Financial Data Movement
- **Ingest**: Transaction data enters via API or CSV import.
- **Storage**: Stored in PostgreSQL with ACID compliance.
- **Processing**: `PnLService` aggregates data on-demand.
- **AI Access**: Aggregated summaries (anonymized) passed to AI context; raw transaction data is **never** exposed to public LLMs.

### 4.2 AI Prompt Structure
- **System Prompt**: Defines role and constraints (e.g., "You are a CFO AI").
- **Context**: RAG (Retrieval-Augmented Generation) injects relevant business metrics.
- **User Query**: Specific question or task.
- **Output Format**: Enforced JSON schema for machine readability.

### 4.3 Sanitization & Audit
- **Input**: PII detection runs before prompt construction.
- **Output**: Response validation ensures no sensitive data leakage.
- **Audit**: Every AI interaction (Prompt + Response + Model Version) is logged to `audit_logs` table.

### 4.4 Confidence Scoring
- Models return a confidence score (0.0 - 1.0).
- **Thresholds**:
    *   `> 0.9`: Auto-approve.
    *   `0.7 - 0.9`: Flag for review.
    *   `< 0.7`: Trigger fallback or rejection.

## 5. Model Flow Diagram (Textual)

1.  **Retrieval**: Orchestrator queries `ModelRegistry` for `active` version of requested model type.
2.  **Validation**: `CompatibilityValidator` checks if model is loaded and healthy.
3.  **Inference**: Request sent to Model (Local or Cloud).
4.  **Scoring**: Result includes `confidence_score`.
5.  **Failover**:
    *   If Latency > 2s OR Error: `CircuitBreaker` trips.
    *   `FailoverManager` routes to Backup Model (e.g., Cloud -> Local).
6.  **Rollback**: If `HealthMonitor` detects sustained error rate > 10%, `RollbackService` reverts to previous version automatically.

## 6. Enterprise Security Model

- **Zero-Trust**: Internal services authenticate via mTLS (in K8s) or secure tokens.
- **RBAC Boundaries**:
    *   `Admin`: Full access.
    *   `Manager`: Read/Write module-specific data.
    *   `Viewer`: Read-only.
    *   `AI_Agent`: Restricted scope (cannot delete data).
- **Encryption**:
    *   **At Rest**: AES-256 for DB volumes.
    *   **In Transit**: TLS 1.3 for all API traffic.
- **Cloud Boundary**: Only non-sensitive, aggregated, or anonymized data leaves the on-prem boundary for Cloud AI inference.

## 7. Scalability Strategy

- **Horizontal Scaling**: Stateless Backend and Frontend containers scale via K8s HPA (Horizontal Pod Autoscaler) based on CPU/Memory.
- **Database**: PostgreSQL read replicas for reporting queries; connection pooling via PgBouncer.
- **AI Inference**:
    *   **Local**: Dedicated GPU node pools in K8s.
    *   **Cloud**: Auto-scaling via provider quotas.
- **Multi-Region**: Architecture supports active-passive failover to secondary region via DNS switching and DB replication.

## 8. Performance & Optimization Strategy

- **Metrics Integration**: Prometheus scrapes `/metrics` endpoint every 15s.
- **Benchmarking**: `ModelBenchmark` service runs nightly tests on all registered models.
- **Auto-Optimization**:
    *   If `latency` increases: Suggest quantization or model downgrade.
    *   If `confidence` drops: Suggest fine-tuning or prompt engineering.
- **Degraded Mode**: Automatically disables non-essential AI features (e.g., "Growth Forecasting") during high load to preserve core ERP function.

## 9. Future Expansion Points

- **Plugin Architecture**: Dynamic loading of Python modules for custom business logic.
- **Federated Learning**: Training local models on private data without sharing raw data, then aggregating weights.
- **Multi-Tenant Support**: Schema-based isolation in PostgreSQL for SaaS deployment.
- **Government Adaptation**: "Air-gapped" mode with purely local LLMs and strict no-outbound-traffic policy.
