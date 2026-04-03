from sqlalchemy.orm import Session
from backend.database.model_versions import ModelVersion
from typing import Dict, Any, List

class ABTestingService:
    def __init__(self, db: Session):
        self.db = db

    def compare_models(self, model_a_version: str, model_b_version: str) -> Dict[str, Any]:
        """
        Compares performance metrics of two model versions.
        """
        model_a = self.db.query(ModelVersion).filter(ModelVersion.version == model_a_version).first()
        model_b = self.db.query(ModelVersion).filter(ModelVersion.version == model_b_version).first()
        
        if not model_a or not model_b:
            return {"error": "One or both models not found."}

        # Calculate Scores
        score_a = model_a.performance_score
        score_b = model_b.performance_score
        
        recommendation = ""
        if score_a > score_b:
            recommendation = f"Model A ({model_a.version}) is performing better."
        elif score_b > score_a:
            recommendation = f"Model B ({model_b.version}) is performing better."
        else:
            recommendation = "Both models perform similarly."

        return {
            "model_A": {
                "version": model_a.version,
                "score": score_a,
                "latency": model_a.latency_avg,
                "confidence": model_a.confidence_avg,
                "error_rate": model_a.error_rate
            },
            "model_B": {
                "version": model_b.version,
                "score": score_b,
                "latency": model_b.latency_avg,
                "confidence": model_b.confidence_avg,
                "error_rate": model_b.error_rate
            },
            "recommendation": recommendation
        }
