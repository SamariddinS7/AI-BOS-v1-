import asyncio
import time
from enum import Enum
from typing import Callable, Any, Optional
from backend.resilience.health_registry import HealthRegistry, ComponentStatus
from backend.observability.logging import StructuredLogger

class CircuitState(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

class CircuitBreaker:
    def __init__(self, name: str, failure_threshold: int = 5, recovery_timeout: int = 30):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.registry = HealthRegistry()
        self.logger = StructuredLogger()

    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        Executes a function wrapped in circuit breaker logic.
        """
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                self.logger.log_event(f"Circuit {self.name} entering HALF_OPEN state", level="WARNING")
            else:
                raise Exception(f"Circuit {self.name} is OPEN. Call blocked.")

        try:
            result = await func(*args, **kwargs)
            
            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
                self.logger.log_event(f"Circuit {self.name} recovered. State: CLOSED", level="INFO")
                await self.registry.update_status(self.name, ComponentStatus.HEALTHY)
            
            return result

        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            self.logger.log_event(f"Circuit {self.name} failure ({self.failure_count}/{self.failure_threshold}): {str(e)}", level="ERROR")
            
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
                self.logger.log_event(f"Circuit {self.name} tripped! State: OPEN", level="ERROR")
                await self.registry.update_status(self.name, ComponentStatus.FAILED, {"error": str(e)})
            
            raise e

    def reset(self):
        """
        Manually resets the circuit breaker.
        """
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.logger.log_event(f"Circuit {self.name} manually reset.", level="INFO")
