from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from typing import Dict

# --- Prometheus Metrics Definitions ---

# Request Counters
AI_REQUEST_TOTAL = Counter(
    "ai_request_total", 
    "Total number of AI requests", 
    ["module", "model", "status"]
)

# Latency Histograms
AI_LATENCY_SECONDS = Histogram(
    "ai_latency_seconds", 
    "Time spent processing AI requests", 
    ["module", "model"],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0]
)

BUSINESS_MODULE_EXECUTION_TIME = Histogram(
    "business_module_execution_time",
    "Time spent executing business logic",
    ["module"],
    buckets=[0.05, 0.1, 0.5, 1.0, 2.0]
)

# Confidence Gauge (Average)
MODEL_CONFIDENCE_AVG = Gauge(
    "model_confidence_avg",
    "Average confidence score of AI models",
    ["model"]
)

# Error Counters
AI_ERRORS_TOTAL = Counter(
    "ai_errors_total",
    "Total number of AI processing errors",
    ["module", "error_type"]
)

# System Health
SYSTEM_MEMORY_USAGE = Gauge("system_memory_usage_bytes", "Current memory usage in bytes")
SYSTEM_CPU_USAGE = Gauge("system_cpu_usage_percent", "Current CPU usage percentage")

class MetricsService:
    @staticmethod
    def record_request(module: str, model: str, status: str = "success"):
        AI_REQUEST_TOTAL.labels(module=module, model=model, status=status).inc()

    @staticmethod
    def record_latency(module: str, model: str, duration: float):
        AI_LATENCY_SECONDS.labels(module=module, model=model).observe(duration)

    @staticmethod
    def record_business_logic(module: str, duration: float):
        BUSINESS_MODULE_EXECUTION_TIME.labels(module=module).observe(duration)

    @staticmethod
    def update_confidence(model: str, score: float):
        MODEL_CONFIDENCE_AVG.labels(model=model).set(score)

    @staticmethod
    def record_error(module: str, error_type: str):
        AI_ERRORS_TOTAL.labels(module=module, error_type=error_type).inc()

    @staticmethod
    def get_metrics():
        return generate_latest(), CONTENT_TYPE_LATEST
