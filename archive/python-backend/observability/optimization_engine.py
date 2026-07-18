from backend.observability.model_benchmark import BenchmarkService
from backend.observability.metrics import MetricsService
from backend.observability.logging import StructuredLogger
from typing import Dict, Any

class OptimizationEngine:
    def __init__(self, benchmark_service: BenchmarkService):
        self.benchmark = benchmark_service
        self.logger = StructuredLogger()

    def analyze_performance(self) -> Dict[str, Any]:
        """
        Analyzes current performance metrics and suggests optimizations.
        """
        latencies = self.benchmark.compare_model_latency()
        confidences = self.benchmark.compare_model_confidence()
        
        suggestions = []
        
        # Latency Analysis
        for model, latency in latencies.items():
            if latency > 500: # Threshold: 500ms
                suggestions.append({
                    "type": "LATENCY_OPTIMIZATION",
                    "model": model,
                    "issue": f"High Latency ({latency:.2f}ms)",
                    "action": "Consider quantization or scaling up replicas."
                })
                self.logger.log_event(
                    f"Performance Alert: {model} latency high",
                    level="WARNING",
                    latency_ms=latency
                )

        # Confidence Analysis
        for model, conf in confidences.items():
            if conf < 0.8: # Threshold: 80%
                suggestions.append({
                    "type": "CONFIDENCE_OPTIMIZATION",
                    "model": model,
                    "issue": f"Low Confidence ({conf:.2%})",
                    "action": "Enable multi-model validation or retrain."
                })
                self.logger.log_event(
                    f"Performance Alert: {model} confidence low",
                    level="WARNING",
                    confidence_score=conf
                )

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": {
                "latency": latencies,
                "confidence": confidences
            },
            "suggestions": suggestions
        }

    def auto_optimize(self):
        """
        Applies automatic optimizations based on analysis.
        (Placeholder for future implementation: e.g., scaling replicas via K8s API)
        """
        analysis = self.analyze_performance()
        for suggestion in analysis["suggestions"]:
            if suggestion["type"] == "LATENCY_OPTIMIZATION":
                # Logic to trigger HPA or switch model
                pass
