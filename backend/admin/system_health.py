import psutil
import time
from typing import Dict, Any

class SystemHealthMonitor:
    def __init__(self):
        self.start_time = time.time()

    def get_system_metrics(self) -> Dict[str, Any]:
        """
        Collects real-time system metrics.
        """
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return {
            "uptime_seconds": time.time() - self.start_time,
            "cpu_usage_percent": cpu_usage,
            "memory_usage_percent": memory.percent,
            "memory_available_mb": memory.available / (1024 * 1024),
            "disk_usage_percent": disk.percent,
            "disk_free_gb": disk.free / (1024 * 1024 * 1024)
        }

    def get_model_performance(self) -> Dict[str, Any]:
        """
        Placeholder for AI model performance metrics.
        In a real system, this would query Prometheus or a dedicated metrics DB.
        """
        return {
            "avg_inference_latency_ms": 120.5, # Mocked for now
            "error_rate_percent": 0.05,
            "requests_per_minute": 45
        }
