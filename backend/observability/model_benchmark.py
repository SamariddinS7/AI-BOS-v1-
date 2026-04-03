from sqlalchemy.orm import Session
from backend.database.models import Base
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from typing import List, Dict

class ModelBenchmark(Base):
    __tablename__ = "model_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    model_name = Column(String, index=True)
    latency_ms = Column(Float)
    confidence_score = Column(Float)
    success = Column(Integer) # 1 for success, 0 for failure

class BenchmarkService:
    def __init__(self, db: Session):
        self.db = db

    def record_benchmark(self, model_name: str, latency_ms: float, confidence: float, success: bool):
        """
        Records a single benchmark data point.
        """
        entry = ModelBenchmark(
            model_name=model_name,
            latency_ms=latency_ms,
            confidence_score=confidence,
            success=1 if success else 0
        )
        self.db.add(entry)
        self.db.commit()

    def compare_model_latency(self) -> Dict[str, float]:
        """
        Returns average latency per model.
        """
        results = self.db.query(
            ModelBenchmark.model_name,
            ModelBenchmark.latency_ms
        ).all()
        
        avg_latency = {}
        counts = {}
        
        for r in results:
            avg_latency[r.model_name] = avg_latency.get(r.model_name, 0) + r.latency_ms
            counts[r.model_name] = counts.get(r.model_name, 0) + 1
            
        for model in avg_latency:
            avg_latency[model] /= counts[model]
            
        return avg_latency

    def compare_model_confidence(self) -> Dict[str, float]:
        """
        Returns average confidence per model.
        """
        results = self.db.query(
            ModelBenchmark.model_name,
            ModelBenchmark.confidence_score
        ).all()
        
        avg_conf = {}
        counts = {}
        
        for r in results:
            avg_conf[r.model_name] = avg_conf.get(r.model_name, 0) + r.confidence_score
            counts[r.model_name] = counts.get(r.model_name, 0) + 1
            
        for model in avg_conf:
            avg_conf[model] /= counts[model]
            
        return avg_conf

    def generate_model_score(self) -> Dict[str, float]:
        """
        Generates a composite score (0-100) based on latency and confidence.
        Higher is better.
        """
        latencies = self.compare_model_latency()
        confidences = self.compare_model_confidence()
        scores = {}
        
        for model in latencies:
            # Score = (Confidence * 100) - (Latency / 10)
            # Example: 0.95 conf, 200ms latency -> 95 - 20 = 75
            score = (confidences.get(model, 0) * 100) - (latencies[model] / 10.0)
            scores[model] = max(0, score)
            
        return scores
