// User, Auth, and RBAC shared types

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER' | 'AI_AGENT';

export interface User {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role_id: string;
  role_name?: string;
  department?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export interface Role {
  id: string;
  name: UserRole;
  description?: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_hash: string;
  status: 'active' | 'revoked';
  expires_at?: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name?: string;
  tenant_id: string;
  action: string;
  module: string;
  ip_address?: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface Tenant {
  id: string;
  name: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  created_at: string;
}
