# AI-BOS Workflow Engine Core

This directory contains the **Production-Grade Execution Engine** for the AI-BOS platform.
It implements the core logic for executing node-based workflows, enforcing governance, and sandboxing plugins.

## Components

### 1. Execution Engine (`ExecutionEngine.ts`)
The heart of the system. It:
- Loads workflow definitions (DAGs).
- Validates permissions via `GovernanceEngine`.
- Traverses the graph (Nodes & Edges).
- Executes nodes sequentially or in parallel (async).
- Persists state (mocked in memory for now).

### 2. Plugin Sandbox (`PluginSandbox.ts`)
Ensures security by isolating plugin code.
-Simulates installation and verification.
- Mocks secure execution environment (VM/Wasm).

### 3. Governance Engine (`GovernanceEngine.ts`)
Enforces enterprise policies.
- Checks RBAC (Role-Based Access Control).
- Enforces financial limits (e.g., max budget).
- Validates AI safety rules.

### 4. Agent Protocol (`AgentProtocol.ts`)
Defines the standard for Agent-to-Agent communication.
- JSON-RPC style messages.
- HMAC signature verification.
- Correlation IDs for tracing.

## Usage

Run the demo to see the engine in action:

```bash
npx tsx src/lib/workflow-engine/demo.ts
```

## Architecture

This module is designed to be microservice-ready. In a full deployment:
- `ExecutionEngine` would run in a worker fleet.
- State would be stored in Redis/PostgreSQL.
- `PluginSandbox` would use `ivm` or `wasm` for true isolation.
