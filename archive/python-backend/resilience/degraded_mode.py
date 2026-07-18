import asyncio
from backend.observability.logging import StructuredLogger
from backend.resilience.health_registry import HealthRegistry, ComponentStatus

class DegradedMode:
    _instance = None
    _is_active = False
    _logger = StructuredLogger()
    _registry = HealthRegistry()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DegradedMode, cls).__new__(cls)
        return cls._instance

    @classmethod
    async def activate(cls, reason: str):
        if not cls._is_active:
            cls._is_active = True
            cls._logger.log_event(f"System entering DEGRADED MODE: {reason}", level="WARNING")
            await cls._registry.update_status("system", ComponentStatus.DEGRADED, {"reason": reason})

    @classmethod
    async def deactivate(cls):
        if cls._is_active:
            cls._is_active = False
            cls._logger.log_event("System exiting DEGRADED MODE", level="INFO")
            await cls._registry.update_status("system", ComponentStatus.HEALTHY)

    @classmethod
    def is_active(cls) -> bool:
        return cls._is_active

    @classmethod
    def should_skip_heavy_task(cls) -> bool:
        """
        Returns True if heavy tasks should be skipped due to degraded mode.
        """
        return cls._is_active
