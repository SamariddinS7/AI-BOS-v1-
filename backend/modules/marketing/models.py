from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Enum, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from backend.database.models import Base

class CampaignStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    DRAFT = "DRAFT"

class ChannelType(str, enum.Enum):
    SOCIAL = "social"
    GOOGLE = "google"
    TV = "tv"
    RADIO = "radio"
    OUTDOOR = "outdoor"
    INFLUENCER = "influencer"
    SEO = "seo"
    EMAIL = "email"

class MarketingCampaign(Base):
    __tablename__ = "marketing_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    channel_type = Column(Enum(ChannelType), default=ChannelType.SOCIAL)
    status = Column(Enum(CampaignStatus), default=CampaignStatus.DRAFT)
    
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    
    budget = Column(Float, default=0.0)
    actual_spend = Column(Float, default=0.0)
    
    # Aggregated Metrics
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    revenue_generated = Column(Float, default=0.0)
    
    # Relationships
    metrics = relationship("MarketingMetric", back_populates="campaign")
    tv_details = relationship("TVAdCampaign", back_populates="campaign", uselist=False)
    kpi_snapshots = relationship("DailyMarketingKPI", back_populates="campaign")

class TVAdCampaign(Base):
    __tablename__ = "marketing_tv_campaigns"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("marketing_campaigns.id"))
    
    airing_cost = Column(Float, default=0.0)
    estimated_viewership = Column(Integer, default=0)
    brand_lift_score = Column(Float, default=0.0) # 0-10 scale
    conversion_lag_days = Column(Integer, default=0) # Estimated days for TV to impact web traffic
    
    campaign = relationship("MarketingCampaign", back_populates="tv_details")

class MarketingMetric(Base):
    __tablename__ = "marketing_metrics"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("marketing_campaigns.id"))
    date = Column(DateTime, default=datetime.utcnow)
    
    spend = Column(Float, default=0.0)
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    
    campaign = relationship("MarketingCampaign", back_populates="metrics")

class DailyMarketingKPI(Base):
    __tablename__ = "marketing_kpi_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("marketing_campaigns.id"))
    date = Column(Date, default=datetime.utcnow().date)
    
    cac = Column(Float, default=0.0)
    roas = Column(Float, default=0.0)
    roi = Column(Float, default=0.0)
    cpm = Column(Float, default=0.0)
    cpc = Column(Float, default=0.0)
    ctr = Column(Float, default=0.0)
    ltv = Column(Float, default=0.0) # Estimated LTV of customers acquired this day
    attribution_score = Column(Float, default=0.0) # 0-1 score from attribution model

    campaign = relationship("MarketingCampaign", back_populates="kpi_snapshots")

class MarketingReport(Base):
    __tablename__ = "marketing_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String) 
    content = Column(JSON) 
    created_at = Column(DateTime, default=datetime.utcnow)
