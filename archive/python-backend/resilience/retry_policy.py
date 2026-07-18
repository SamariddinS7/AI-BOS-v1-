import asyncio
import random
from typing import Callable, Any, Optional
from backend.observability.logging import StructuredLogger

class RetryPolicy:
    def __init__(self, max_attempts: int = 3, base_delay: float = 0.5, max_delay: float = 5.0, jitter: bool = True):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.jitter = jitter
        self.logger = StructuredLogger()

    async def execute(self, func: Callable, *args, **kwargs) -> Any:
        """
        Executes a function with exponential backoff and jitter.
        """
        attempt = 0
        while attempt < self.max_attempts:
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                attempt += 1
                if attempt >= self.max_attempts:
                    self.logger.log_event(f"Retry failed after {attempt} attempts: {str(e)}", level="ERROR")
                    raise e
                
                # Calculate delay with exponential backoff
                delay = min(self.max_delay, self.base_delay * (2 ** attempt))
                
                # Add jitter
                if self.jitter:
                    delay += random.uniform(0, 0.5)
                
                self.logger.log_event(f"Attempt {attempt} failed. Retrying in {delay:.2f}s...", level="WARNING")
                await asyncio.sleep(delay)
