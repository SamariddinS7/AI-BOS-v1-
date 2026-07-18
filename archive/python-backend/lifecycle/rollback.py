from sqlalchemy.orm import Session
from backend.database.model_versions import ModelVersion
from backend.lifecycle.version_manager import VersionManager
import logging

logger = logging.getLogger("ai_bos.lifecycle")

class RollbackService:
    def __init__(self, db: Session):
        self.db = db
        self.version_manager = VersionManager(db)

    def rollback_to_previous_version(self, model_name: str) -> bool:
        """
        Rolls back to the most recent previous version.
        """
        # 1. Find Current Active Version
        current_active = self.db.query(ModelVersion).filter(
            ModelVersion.model_name == model_name,
            ModelVersion.is_active == True
        ).first()
        
        if not current_active:
            logger.error(f"No active version found for {model_name} to rollback from.")
            return False

        # 2. Find Previous Version (by created_at desc, excluding current)
        previous_version = self.db.query(ModelVersion).filter(
            ModelVersion.model_name == model_name,
            ModelVersion.id != current_active.id
        ).order_by(ModelVersion.created_at.desc()).first()
        
        if not previous_version:
            logger.error(f"No previous version found for {model_name}.")
            return False

        # 3. Perform Rollback (Activate Previous)
        logger.info(f"Rolling back {model_name} from {current_active.version} to {previous_version.version}")
        
        # Deactivate Current
        current_active.is_active = False
        
        # Activate Previous
        previous_version.is_active = True
        
        self.db.commit()
        return True
