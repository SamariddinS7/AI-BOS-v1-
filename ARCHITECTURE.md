# AI-BOS Automation & Agent Platform Architecture Blueprint

## 1. Full Backend Architecture

The backend follows a **Hexagonal Architecture (Ports and Adapters)** pattern to ensure separation of concerns and testability.

### Layers:
1.  **Presentation Layer (API)**: REST/GraphQL endpoints, Webhook receivers.
2.  **Application Layer (Use Cases)**: Workflow orchestration, Agent management, Plugin lifecycle.
3.  **Domain Layer (Core Logic)**: Workflow graph validation, Execution strategies, Policy rules.
4.  **Infrastructure Layer**: Database access, Redis queue, External API clients, Plugin sandbox (VM/Wasm).

### Microservices Breakdown:
*   **Orchestrator Service**: Manages workflow lifecycle and state.
*   **Execution Worker**: Stateless workers that execute individual nodes.
*   **Agent Gateway**: Secure ingress/egress for external agents (n8n, Zapier).
*   **Governance Service**: Centralized policy enforcement (RBAC, Budget, AI Safety).
*   **Plugin Registry**: Manages plugin metadata and assets.

---

## 2. Database Schema (PostgreSQL / SQL-like)

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version INT DEFAULT 1,
  created_by UUID NOT NULL,
  status VARCHAR(50) CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  trigger_type VARCHAR(50),
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflow_nodes (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  node_type VARCHAR(50) NOT NULL,
  config_json JSONB NOT NULL,
  retry_policy JSONB, -- { "max_attempts": 3, "backoff": "exponential" }
  timeout_ms INT DEFAULT 5000,
  position_x FLOAT,
  position_y FLOAT
);

CREATE TABLE workflow_edges (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  from_node UUID REFERENCES workflow_nodes(id),
  to_node UUID REFERENCES workflow_nodes(id),
  condition_expression TEXT -- e.g., "output.confidence > 0.8"
);

CREATE TABLE execution_history (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  status VARCHAR(50),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  trigger_payload JSONB,
  current_node_id UUID
);

CREATE TABLE node_execution_logs (
  id UUID PRIMARY KEY,
  execution_id UUID REFERENCES execution_history(id),
  node_id UUID REFERENCES workflow_nodes(id),
  status VARCHAR(50),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  duration_ms INT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Execution Engine Design

The engine uses an **Event-Driven State Machine**.

1.  **Trigger**: Event arrives (Webhook, Schedule, Manual).
2.  **Loader**: Engine loads Workflow Graph (Nodes + Edges).
3.  **Validator**: Checks for cycles (DAG) and permissions.
4.  **Queueing**: Pushes the "Start Node" task to Redis Queue.
5.  **Worker**:
    *   Pops task.
    *   Executes Node Logic (via Plugin or Native).
    *   Evaluates Edges (Conditions).
    *   Determines Next Node(s).
    *   Pushes Next Node(s) to Queue.
6.  **Persistence**: Updates `execution_history` at every step.

---

## 4. Plugin Sandbox Architecture

Plugins are executed in isolated environments to prevent unauthorized access.

*   **Technology**: WebAssembly (Wasm) or V8 Isolates (ivm).
*   **Interface**:
    ```typescript
    interface Plugin {
      execute(input: any, context: PluginContext): Promise<any>;
    }
    
    interface PluginContext {
      secrets: SecretStore;
      logger: Logger;
      // Restricted network access
      fetch(url: string, options: any): Promise<Response>; 
    }
    ```
*   **Security**:
    *   No access to `process.env`.
    *   Network requests whitelisted via Governance Policy.
    *   Memory and CPU limits enforced.

---

## 5. Agent Protocol Design

Standardized JSON-RPC over HTTPS/WebSocket.

**Message Structure:**
```json
{
  "id": "msg_123",
  "correlation_id": "corr_abc",
  "timestamp": "2026-03-02T10:00:00Z",
  "sender": {
    "agent_id": "agent_finance_bot",
    "signature": "hmac_sha256_signature_here"
  },
  "recipient": {
    "agent_id": "agent_marketing_bot"
  },
  "payload_type": "application/vnd.ai-bos.task-request+json",
  "payload": {
    "action": "reduce_budget",
    "parameters": { "amount": 100, "currency": "USD" }
  }
}
```

---

## 6. Governance Integration

The **Policy Engine** intercepts every critical action.

*   **Pre-Execution Check**: Does the user have permission to run this workflow?
*   **Runtime Check**:
    *   *Financial*: "Is budget_reduction < $500?"
    *   *Data*: "Is PII present in the payload?"
*   **AI Guardrails**:
    *   Input: Prompt injection detection.
    *   Output: Hallucination check / Confidence score validation.

---

## 7. Monitoring Integration

*   **Metrics**: Prometheus (Node latency, Queue depth, Error rates).
*   **Tracing**: OpenTelemetry (Trace ID propagates through all nodes and agents).
*   **Logs**: Structured JSON logs sent to Elasticsearch/Loki.
*   **Alerting**: PagerDuty integration for critical failures (e.g., Payment Gateway Agent down).

---

## 8. Frontend Architecture Plan

*   **Framework**: React 19 + Vite.
*   **State Management**: Zustand (for global app state) + React Query (for server state).
*   **Visualization**: React Flow (for Workflow Builder).
*   **Components**: Shadcn UI + Tailwind CSS.
*   **Real-time**: WebSocket connection for live execution tracking.

---

## 9. Deployment Considerations

*   **Containerization**: Docker for all services.
*   **Orchestration**: Kubernetes (K8s).
*   **Scaling**: Horizontal Pod Autoscaling (HPA) based on CPU and Queue Depth.
*   **Secrets**: HashiCorp Vault or AWS Secrets Manager.

---

## 10. Scalability Plan

*   **Database**: Read replicas for reporting; Sharding by `workflow_id` for write throughput.
*   **Queue**: Redis Cluster for high-throughput job distribution.
*   **Execution**: Stateless workers can scale to 1000s of instances.
*   **Caching**: CDN for frontend assets; Redis for API response caching.
