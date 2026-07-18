import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum

class ComponentStatus(str, Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"
    UNKNOWN = "UNKNOWN"

class HealthRegistry:
    _instance = None
    _status: Dict[str, Dict[str, Any]] = {}
    _lock = asyncio.Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(HealthRegistry, cls).__new__(cls)
            cls._status = {
                "cloud_api": {"status": ComponentStatus.HEALTHY, "last_check": datetime.utcnow()},
                "local_model": {"status": ComponentStatus.HEALTHY, "last_check": datetime.utcnow()},
                "database": {"status": ComponentStatus.HEALTHY, "last_check": datetime.utcnow()},
                "memory": {"status": ComponentStatus.HEALTHY, "usage_percent": 0.0},
                "cpu": {"status": ComponentStatus.HEALTHY, "usage_percent": 0.0}
            }
        return cls._instance

    async def update_status(self, component: str, status: ComponentStatus, details: Optional[Dict[str, Any]] = None):
        async with self._lock:
            self._status[component] = {
                "status": status,
                "last_check": datetime.utcnow(),
                "details": details or {}
            }

    async def get_component_status(self, component: str) -> Dict[str, Any]:
        async with self._lock:
            return self._status.get(component, {"status": ComponentStatus.UNKNOWN})

    async def get_system_status(self) -> Dict[str, Any]:
        async with self._lock:
            # Deep copy to avoid race conditions during read
            return {k: v.copy() for k, v in self._status.items()}

    async def is_healthy(self, component: str) -> bool:
        status = await self.get_component_status(component)
        return status["status"] == ComponentStatus.HEALTHY
