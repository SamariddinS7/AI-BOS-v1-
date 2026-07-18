from sqlalchemy.orm import Session
from backend.database.model_versions import ModelVersion, ModelType
from typing import List, Optional
from datetime import datetime

class ModelRegistryService:
    def __init__(self, db: Session):
        self.db = db

    def register_model_version(
        self, 
        name: str, 
        version: str, 
        type: ModelType, 
        path: str,
        description: Optional[str] = None,
        author: Optional[str] = None
    ) -> ModelVersion:
        """
        Registers a new model version in the database.
        """
        # Check if version already exists
        existing = self.db.query(ModelVersion).filter(
            ModelVersion.model_name == name,
            ModelVersion.version == version
        ).first()
        
        if existing:
            raise ValueError(f"Model {name} version {version} already exists.")

        model = ModelVersion(
            model_name=name,
            version=version,
            model_type=type,
            file_path=path,
            description=description,
            author=author,
            is_active=False
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return model

    def list_versions(self, model_name: str) -> List[ModelVersion]:
        """
        Lists all versions for a specific model.
        """
        return self.db.query(ModelVersion).filter(
            ModelVersion.model_name == model_name
        ).order_by(ModelVersion.created_at.desc()).all()

    def get_active_version(self, model_name: str) -> Optional[ModelVersion]:
        """
        Returns the currently active version of a model.
        """
        return self.db.query(ModelVersion).filter(
            ModelVersion.model_name == model_name,
            ModelVersion.is_active == True
        ).first()

    def update_performance_stats(self, version_id: int, latency: float, confidence: float, error: bool):
        """
        Updates performance metrics for a model version.
        """
        model = self.db.query(ModelVersion).filter(ModelVersion.id == version_id).first()
        if not model:
            return

        # Simple moving average update
        count = model.usage_count
        model.usage_count += 1
        
        # Update Latency
        model.latency_avg = ((model.latency_avg * count) + latency) / (count + 1)
        
        # Update Confidence
        model.confidence_avg = ((model.confidence_avg * count) + confidence) / (count + 1)
        
        # Update Error Rate
        current_errors = model.error_rate * count
        new_errors = current_errors + (1 if error else 0)
        model.error_rate = new_errors / (count + 1)
        
        # Recalculate Score (0-100)
        # Score = (Confidence * 80) + (1 - ErrorRate) * 20 - (Latency/1000 * 10)
        score = (model.confidence_avg * 80) + ((1 - model.error_rate) * 20) - (model.latency_avg / 100)
        model.performance_score = max(0, min(100, score))
        
        self.db.commit()
