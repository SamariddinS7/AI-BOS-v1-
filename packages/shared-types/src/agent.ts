// AI Agent shared types

export type AgentStatus = 'active' | 'inactive' | 'error' | 'running';

export interface Agent {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  type: string;
  status: AgentStatus;
  config?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentHealthCheck {
  agent_id: string;
  status: AgentStatus;
  last_run?: string;
  error?: string;
  latency_ms?: number;
}

export interface AICommandResult {
  success: boolean;
  message: string;
  data?: unknown;
  confidence?: number;
  model?: string;
  latency_ms?: number;
}
