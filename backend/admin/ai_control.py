from sqlalchemy.orm import Session
from backend.database.admin_models import SystemConfig, AIMode
from typing import Optional

class AIControlService:
    def __init__(self, db: Session):
        self.db = db

    def get_current_mode(self) -> AIMode:
        """
        Fetches the current AI operating mode. Defaults to PURE_LOCAL if not set.
        """
        config = self.db.query(SystemConfig).filter(SystemConfig.key == "AI_MODE").first()
        if not config:
            return AIMode.PURE_LOCAL
        return AIMode(config.value)

    def set_mode(self, mode: AIMode, user_id: str) -> SystemConfig:
        """
        Updates the AI operating mode. Requires SUPER_ADMIN check (handled in API layer).
        """
        config = self.db.query(SystemConfig).filter(SystemConfig.key == "AI_MODE").first()
        if not config:
            config = SystemConfig(key="AI_MODE", value=mode.value, updated_by=user_id)
            self.db.add(config)
        else:
            config.value = mode.value
            config.updated_by = user_id
        
        self.db.commit()
        self.db.refresh(config)
        return config

    def get_confidence_threshold(self, module: str = "GLOBAL") -> float:
        """
        Fetches confidence threshold for a module or global default.
        """
        config = self.db.query(SystemConfig).filter(SystemConfig.key == f"CONFIDENCE_{module}").first()
        if not config:
            # Fallback to global if module specific not found
            if module != "GLOBAL":
                return self.get_confidence_threshold("GLOBAL")
            return 0.85 # Default global threshold
        return float(config.value)

    def set_confidence_threshold(self, module: str, threshold: float, user_id: str):
        """
        Sets confidence threshold.
        """
        if not (0.0 <= threshold <= 1.0):
            raise ValueError("Threshold must be between 0.0 and 1.0")

        key = f"CONFIDENCE_{module}"
        config = self.db.query(SystemConfig).filter(SystemConfig.key == key).first()
        
        if not config:
            config = SystemConfig(key=key, value=str(threshold), updated_by=user_id)
            self.db.add(config)
        else:
            config.value = str(threshold)
            config.updated_by = user_id
            
        self.db.commit()
