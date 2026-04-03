import asyncio
from typing import Callable, Any, Optional
from backend.resilience.circuit_breaker import CircuitBreaker
from backend.resilience.retry_policy import RetryPolicy
from backend.resilience.degraded_mode import DegradedMode
from backend.resilience.health_registry import HealthRegistry, ComponentStatus
from backend.observability.logging import StructuredLogger

class FailoverManager:
    def __init__(self, primary_model: str, backup_model: str):
        self.primary_model = primary_model
        self.backup_model = backup_model
        
        self.primary_circuit = CircuitBreaker(f"model_{primary_model}")
        self.backup_circuit = CircuitBreaker(f"model_{backup_model}")
        
        self.retry_policy = RetryPolicy()
        self.logger = StructuredLogger()
        self.registry = HealthRegistry()

    async def execute_with_failover(self, task: Callable, *args, **kwargs) -> Any:
        """
        Executes a task with primary model, then falls back to backup if primary fails.
        """
        # 1. Check Degraded Mode
        if DegradedMode.is_active():
            self.logger.log_event("Degraded Mode Active: Skipping heavy task or using simplified logic.", level="WARNING")
            # Logic to simplify task or return cached result if possible
            # For now, we proceed but log it.

        # 2. Try Primary Model
        try:
            self.logger.log_event(f"Attempting execution with Primary: {self.primary_model}", level="INFO")
            return await self.primary_circuit.call(
                self.retry_policy.execute(task, model=self.primary_model, *args, **kwargs)
            )
        except Exception as e:
            self.logger.log_event(f"Primary {self.primary_model} failed: {str(e)}. Attempting Failover...", level="ERROR")
            await self.registry.update_status(f"model_{self.primary_model}", ComponentStatus.FAILED, {"error": str(e)})

        # 3. Try Backup Model (Failover)
        try:
            self.logger.log_event(f"Executing Failover with Backup: {self.backup_model}", level="WARNING")
            return await self.backup_circuit.call(
                self.retry_policy.execute(task, model=self.backup_model, *args, **kwargs)
            )
        except Exception as e:
            self.logger.log_event(f"Backup {self.backup_model} failed: {str(e)}. Critical Failure.", level="CRITICAL")
            await self.registry.update_status(f"model_{self.backup_model}", ComponentStatus.FAILED, {"error": str(e)})
            
            # 4. Trigger Degraded Mode if both fail
            await DegradedMode.activate("Both Primary and Backup models failed.")
            raise e

    async def recover_primary(self):
        """
        Attempts to reset primary circuit if health checks pass.
        """
        if self.primary_circuit.state == "OPEN":
            self.logger.log_event(f"Attempting to recover Primary: {self.primary_model}", level="INFO")
            self.primary_circuit.reset()
