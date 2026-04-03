from sqlalchemy.orm import Session
from backend.database.model_versions import ModelVersion
from backend.lifecycle.model_registry import ModelRegistryService
from backend.lifecycle.compatibility import CompatibilityValidator
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger("ai_bos.lifecycle")

class VersionManager:
    def __init__(self, db: Session):
        self.db = db
        self.registry = ModelRegistryService(db)
        self.validator = CompatibilityValidator(db)

    def activate_model_version(self, model_name: str, version: str) -> bool:
        """
        Safely activates a new model version.
        """
        # 1. Fetch target version
        target_version = self.db.query(ModelVersion).filter(
            ModelVersion.model_name == model_name,
            ModelVersion.version == version
        ).first()
        
        if not target_version:
            logger.error(f"Version {version} for {model_name} not found.")
            return False

        # 2. Validate Compatibility
        if not self.validator.validate_model(target_version):
            logger.error(f"Version {version} failed compatibility check.")
            return False

        # 3. Warm Load (Hot Swap Prep)
        if not self.validator.warm_load_model(target_version):
            logger.error(f"Version {version} failed warm load.")
            return False

        # 4. Deactivate Current Active Version
        current_active = self.registry.get_active_version(model_name)
        if current_active:
            current_active.is_active = False
            logger.info(f"Deactivating {model_name} version {current_active.version}")

        # 5. Activate New Version
        target_version.is_active = True
        self.db.commit()
        logger.info(f"Activated {model_name} version {version}")
        
        return True

    def deactivate_model_version(self, model_name: str, version: str) -> bool:
        """
        Deactivates a model version.
        """
        target_version = self.db.query(ModelVersion).filter(
            ModelVersion.model_name == model_name,
            ModelVersion.version == version
        ).first()
        
        if not target_version:
            return False
            
        target_version.is_active = False
        self.db.commit()
        return True
