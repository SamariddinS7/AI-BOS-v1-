from sqlalchemy.orm import Session
from backend.database.model_versions import ModelVersion
from backend.lifecycle.version_manager import VersionManager
from backend.lifecycle.rollback import RollbackService
import logging

logger = logging.getLogger("ai_bos.lifecycle")

class ModelHealthMonitor:
    def __init__(self, db: Session):
        self.db = db
        self.version_manager = VersionManager(db)
        self.rollback_service = RollbackService(db)

    def check_health(self, model_name: str) -> bool:
        """
        Checks if the active model version is healthy.
        If unhealthy, triggers auto-rollback.
        """
        active_version = self.version_manager.registry.get_active_version(model_name)
        if not active_version:
            return True # No active model to check

        # Health Criteria
        is_unhealthy = False
        
        # 1. Error Rate > 10%
        if active_version.error_rate > 0.1:
            logger.warning(f"Model {model_name} error rate high ({active_version.error_rate:.2%})")
            is_unhealthy = True
        
        # 2. Latency Spike > 1000ms
        if active_version.latency_avg > 1000:
            logger.warning(f"Model {model_name} latency high ({active_version.latency_avg:.2f}ms)")
            is_unhealthy = True
        
        # 3. Confidence Drop < 0.6
        if active_version.confidence_avg < 0.6:
            logger.warning(f"Model {model_name} confidence low ({active_version.confidence_avg:.2f})")
            is_unhealthy = True

        if is_unhealthy:
            logger.error(f"Model {model_name} is unhealthy. Triggering rollback.")
            self.rollback_service.rollback_to_previous_version(model_name)
            return False

        return True
