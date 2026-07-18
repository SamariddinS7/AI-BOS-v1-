from sqlalchemy.orm import Session
from backend.database.admin_models import PendingAction, ApprovalStatus
from typing import List, Optional

class ApprovalWorkflowService:
    def __init__(self, db: Session):
        self.db = db

    def create_pending_action(self, module: str, action_type: str, payload: dict, reason: str) -> PendingAction:
        """
        Creates a new action requiring approval.
        """
        action = PendingAction(
            module=module,
            action_type=action_type,
            payload=payload,
            reason=reason,
            status=ApprovalStatus.PENDING
        )
        self.db.add(action)
        self.db.commit()
        self.db.refresh(action)
        return action

    def get_pending_actions(self, module: Optional[str] = None) -> List[PendingAction]:
        """
        Fetches pending actions for review.
        """
        query = self.db.query(PendingAction).filter(PendingAction.status == ApprovalStatus.PENDING)
        if module:
            query = query.filter(PendingAction.module == module)
        return query.all()

    def approve_action(self, action_id: int, user_id: str) -> bool:
        """
        Approves a pending action.
        """
        action = self.db.query(PendingAction).filter(PendingAction.id == action_id).first()
        if not action or action.status != ApprovalStatus.PENDING:
            return False
        
        action.status = ApprovalStatus.APPROVED
        action.reviewed_by = user_id
        action.reviewed_at = datetime.utcnow()
        self.db.commit()
        return True

    def reject_action(self, action_id: int, user_id: str) -> bool:
        """
        Rejects a pending action.
        """
        action = self.db.query(PendingAction).filter(PendingAction.id == action_id).first()
        if not action or action.status != ApprovalStatus.PENDING:
            return False
        
        action.status = ApprovalStatus.REJECTED
        action.reviewed_by = user_id
        action.reviewed_at = datetime.utcnow()
        self.db.commit()
        return True
