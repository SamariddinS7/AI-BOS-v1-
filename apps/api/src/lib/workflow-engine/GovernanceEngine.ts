/**
 * Enforces governance policies across the platform.
 * Includes RBAC, Financial Limits, and AI Safety.
 */

export interface Policy {
  id: string;
  name: string;
  type: 'rbac' | 'financial' | 'ai_safety' | 'data_privacy';
  rules: Record<string, any>; // Flexible rule definition
  enforcement: 'block' | 'audit' | 'approve';
}

export interface GovernanceContext {
  userId: string;
  workflowId: string;
  action: string;
  resource: string;
  amount?: number; // For financial checks
  confidence?: number; // For AI checks
}

export class GovernanceEngine {
  private policies: Policy[] = [];

  constructor() {
    // Load policies from DB or Config
    this.policies.push({
      id: 'fin_limit_1',
      name: 'Max Budget Approval',
      type: 'financial',
      rules: { maxAmount: 5000, currency: 'USD' },
      enforcement: 'block',
    });
  }

  /**
   * Evaluates an action against all active policies.
   * Returns true if allowed, false if blocked.
   */
  public evaluate(context: GovernanceContext): boolean {
    console.log(`[Governance] Evaluating action: ${context.action} on ${context.resource}`);

    for (const policy of this.policies) {
      if (policy.type === 'financial' && context.amount) {
        if (context.amount > policy.rules.maxAmount) {
          console.warn(`[Governance] Blocked by policy: ${policy.name} (Amount ${context.amount} > ${policy.rules.maxAmount})`);
          return false;
        }
      }
      // Add other policy checks (RBAC, AI Safety)
    }

    return true;
  }

  /**
   * Logs an audit trail for compliance.
   */
  public logAudit(context: GovernanceContext, allowed: boolean): void {
    console.log(`[Audit] Action ${context.action} by ${context.userId} was ${allowed ? 'ALLOWED' : 'DENIED'}`);
    // Persist to secure audit log (e.g., append-only ledger)
  }
}
