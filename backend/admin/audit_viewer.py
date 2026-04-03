from sqlalchemy.orm import Session
from backend.database.admin_models import AuditLog
from datetime import datetime
from typing import List, Optional

class AuditViewerService:
    def __init__(self, db: Session):
        self.db = db

    def get_audit_logs(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        user_id: Optional[str] = None,
        module: Optional[str] = None
    ) -> List[AuditLog]:
        """
        Fetches audit logs with filtering.
        """
        query = self.db.query(AuditLog)

        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if module:
            query = query.filter(AuditLog.module == module)

        return query.order_by(AuditLog.timestamp.desc()).all()

    def log_action(self, user_id: str, action: str, module: str, details: dict, ai_mode: str):
        """
        Records a system action for audit.
        """
        log = AuditLog(
            user_id=user_id,
            action=action,
            module=module,
            details=details,
            ai_mode=ai_mode
        )
        self.db.add(log)
        self.db.commit()
