from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum
from datetime import datetime
import enum
from backend.database.models import Base

class ModelType(str, enum.Enum):
    LOCAL = "LOCAL"
    CLOUD = "CLOUD"

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True) # e.g., "finance-analyzer"
    version = Column(String) # e.g., "v1.2.0"
    model_type = Column(Enum(ModelType))
    file_path = Column(String, nullable=True) # Path to weights or API endpoint
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Performance Stats
    performance_score = Column(Float, default=0.0)
    confidence_avg = Column(Float, default=0.0)
    latency_avg = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    usage_count = Column(Integer, default=0)
    
    # Metadata
    description = Column(String, nullable=True)
    author = Column(String, nullable=True)
