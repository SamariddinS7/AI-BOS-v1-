from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time
import uuid
from backend.observability.metrics import MetricsService
from backend.observability.logging import StructuredLogger

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        start_time = time.time()
        
        # Log Request Start
        StructuredLogger.log_event(
            f"Request Started: {request.method} {request.url.path}",
            request_id=request_id,
            level="INFO"
        )
        
        try:
            response = await call_next(request)
            
            # Calculate Duration
            duration = time.time() - start_time
            
            # Record Metrics
            MetricsService.record_request(
                module=request.url.path.split("/")[1], # e.g., /finance -> finance
                model="api",
                status=str(response.status_code)
            )
            MetricsService.record_latency(
                module=request.url.path.split("/")[1],
                model="api",
                duration=duration
            )
            
            # Log Request End
            StructuredLogger.log_event(
                f"Request Completed: {response.status_code}",
                request_id=request_id,
                latency_ms=duration * 1000,
                level="INFO"
            )
            
            return response
            
        except Exception as e:
            # Log Error
            duration = time.time() - start_time
            StructuredLogger.log_event(
                f"Request Failed: {str(e)}",
                request_id=request_id,
                latency_ms=duration * 1000,
                level="ERROR",
                error_flag=True
            )
            MetricsService.record_error(
                module=request.url.path.split("/")[1],
                error_type=type(e).__name__
            )
            raise e
