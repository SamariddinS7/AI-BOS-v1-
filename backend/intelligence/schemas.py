from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class ActionIntent(BaseModel):
    action_type: str
    module: str
    target_id: Optional[str] = None
    conditions: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None
    risk_level: str = Field(..., description="low, medium, high")
    expected_impact: str
    requires_confirmation: bool

class ExecutionResult(BaseModel):
    success: bool
    action_id: str
    message: str
    data: Optional[Dict[str, Any]] = None
    old_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None

class PostExecutionReport(BaseModel):
    action_performed: str
    objects_affected: str
    kpi_change: str
    financial_impact: str
    risk_impact: str
    stability_check: str
    confidence_level: str
