from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from backend.database.models import Base

# --- Enums ---
class AIMode(str, enum.Enum):
    PURE_LOCAL = "PURE_LOCAL"
    PURE_CLOUD = "PURE_CLOUD"
    HYBRID = "HYBRID"
    MULTI_MODEL_VALIDATION = "MULTI_MODEL_VALIDATION"

class ModelType(str, enum.Enum):
    LOCAL = "LOCAL"
    CLOUD = "CLOUD"

class ApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

# --- Admin Models ---

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String) # Stores current mode, etc.
    updated_at = Column(DateTime, default=datetime.utcnow)
    updated_by = Column(String)

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, unique=True, index=True)
    model_type = Column(Enum(ModelType))
    priority_order = Column(Integer, default=0)
    enabled = Column(Boolean, default=True)
    version = Column(String)
    max_confidence_threshold = Column(Float, default=0.95)
    api_endpoint = Column(String, nullable=True) # For cloud models
    
    created_at = Column(DateTime, default=datetime.utcnow)

class PolicyConfig(Base):
    __tablename__ = "policy_config"

    id = Column(Integer, primary_key=True, index=True)
    module = Column(String, index=True) # e.g., "FINANCE", "HR"
    rule_name = Column(String)
    rule_value = Column(JSON) # e.g., {"max_transaction": 10000}
    is_active = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=False)
    
    updated_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, index=True)
    action = Column(String)
    module = Column(String, index=True)
    details = Column(JSON)
    ai_mode = Column(String) # Snapshot of mode at time of action

class PendingAction(Base):
    __tablename__ = "pending_actions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    module = Column(String)
    action_type = Column(String)
    payload = Column(JSON)
    reason = Column(String) # e.g., "Low Confidence", "Policy Violation"
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
