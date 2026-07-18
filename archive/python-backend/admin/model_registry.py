from sqlalchemy.orm import Session
from backend.database.admin_models import ModelRegistry, ModelType, AIMode
from typing import List, Optional

class ModelRegistryService:
    def __init__(self, db: Session):
        self.db = db

    def register_model(self, name: str, model_type: ModelType, version: str, priority: int = 0) -> ModelRegistry:
        """
        Registers a new AI model in the system.
        """
        model = ModelRegistry(
            model_name=name,
            model_type=model_type,
            version=version,
            priority_order=priority,
            enabled=True
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model

    def disable_model(self, model_id: int) -> bool:
        """
        Disables a model from being used by the Orchestrator.
        """
        model = self.db.query(ModelRegistry).filter(ModelRegistry.id == model_id).first()
        if not model:
            return False
        model.enabled = False
        self.db.commit()
        return True

    def update_priority(self, model_id: int, new_priority: int) -> bool:
        """
        Updates the execution priority of a model.
        """
        model = self.db.query(ModelRegistry).filter(ModelRegistry.id == model_id).first()
        if not model:
            return False
        model.priority_order = new_priority
        self.db.commit()
        return True

    def get_active_models(self, mode: AIMode) -> List[ModelRegistry]:
        """
        Returns a list of enabled models suitable for the current AI mode.
        """
        query = self.db.query(ModelRegistry).filter(ModelRegistry.enabled == True)
        
        if mode == AIMode.PURE_LOCAL:
            query = query.filter(ModelRegistry.model_type == ModelType.LOCAL)
        elif mode == AIMode.PURE_CLOUD:
            query = query.filter(ModelRegistry.model_type == ModelType.CLOUD)
        # HYBRID and MULTI_MODEL_VALIDATION use both types, prioritized by order
        
        return query.order_by(ModelRegistry.priority_order.desc()).all()
