from sqlalchemy.orm import Session
from backend.database.admin_models import PolicyConfig
from typing import List, Dict, Any

class PolicyConfigService:
    def __init__(self, db: Session):
        self.db = db

    def create_policy(self, module: str, rule: str, value: Any, requires_approval: bool = False) -> PolicyConfig:
        """
        Creates a new governance policy.
        """
        policy = PolicyConfig(
            module=module,
            rule_name=rule,
            rule_value={"value": value},
            requires_approval=requires_approval
        )
        self.db.add(policy)
        self.db.commit()
        self.db.refresh(policy)
        return policy

    def get_policies(self, module: str = None) -> List[PolicyConfig]:
        """
        Fetches active policies for a module or all modules.
        """
        query = self.db.query(PolicyConfig).filter(PolicyConfig.is_active == True)
        if module:
            query = query.filter(PolicyConfig.module == module)
        return query.all()

    def check_policy(self, module: str, rule: str, value: Any) -> bool:
        """
        Validates an action against a policy.
        Returns True if compliant, False if violation.
        """
        policy = self.db.query(PolicyConfig).filter(
            PolicyConfig.module == module,
            PolicyConfig.rule_name == rule,
            PolicyConfig.is_active == True
        ).first()

        if not policy:
            return True # No policy = allowed

        limit = policy.rule_value.get("value")
        
        # Simple numeric check (e.g., max transaction amount)
        if isinstance(limit, (int, float)) and isinstance(value, (int, float)):
            return value <= limit
        
        # Boolean check (e.g., allow cloud)
        if isinstance(limit, bool) and isinstance(value, bool):
            return value == limit

        return True # Default pass if type mismatch (should log warning)
