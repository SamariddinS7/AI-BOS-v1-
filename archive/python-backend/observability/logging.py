import logging
import json
import time
from typing import Any, Dict, Optional
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.name,
            "request_id": getattr(record, "request_id", None),
            "user_id": getattr(record, "user_id", None),
            "ai_mode": getattr(record, "ai_mode", None),
            "model_used": getattr(record, "model_used", None),
            "latency_ms": getattr(record, "latency_ms", None),
            "confidence_score": getattr(record, "confidence_score", None),
            "error_flag": getattr(record, "error_flag", False)
        }
        return json.dumps(log_obj)

# Configure Root Logger
logger = logging.getLogger("ai_bos")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class StructuredLogger:
    @staticmethod
    def log_event(
        message: str,
        level: str = "INFO",
        request_id: Optional[str] = None,
        user_id: Optional[str] = None,
        ai_mode: Optional[str] = None,
        model_used: Optional[str] = None,
        latency_ms: Optional[float] = None,
        confidence_score: Optional[float] = None,
        error_flag: bool = False,
        extra: Optional[Dict[str, Any]] = None
    ):
        extra_data = {
            "request_id": request_id,
            "user_id": user_id,
            "ai_mode": ai_mode,
            "model_used": model_used,
            "latency_ms": latency_ms,
            "confidence_score": confidence_score,
            "error_flag": error_flag
        }
        if extra:
            extra_data.update(extra)

        if level == "INFO":
            logger.info(message, extra=extra_data)
        elif level == "WARNING":
            logger.warning(message, extra=extra_data)
        elif level == "ERROR":
            logger.error(message, extra=extra_data)
        elif level == "DEBUG":
            logger.debug(message, extra=extra_data)
