from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# --- Market Analyst ---
class MarketAnalystInput(BaseModel):
    customer_data: Dict[str, Any]
    industry_metrics: Dict[str, Any]
    sales_performance: Dict[str, Any]
    geographic_distribution: Dict[str, Any]

class MarketAnalystOutput(BaseModel):
    market_overview: str
    customer_segments: List[str]
    opportunity_zones: List[str]
    competitive_risks: List[str]
    strategic_recommendation: str

# --- Campaign Strategist ---
class CampaignStrategistInput(BaseModel):
    budget: float
    target_audience: str
    conversion_rates: Dict[str, float]
    product_margins: float

class CampaignStrategistOutput(BaseModel):
    channel_strategy: List[str]
    budget_allocation: Dict[str, float]
    kpi_plan: Dict[str, float]
    funnel_map: str
    roi_projection: float

# --- Performance Optimizer ---
class PerformanceOptimizerInput(BaseModel):
    ad_spend: float
    ctr: float
    cpc: float
    cpa: float
    conversion_rate: float
    revenue_per_campaign: Dict[str, float]

class PerformanceOptimizerOutput(BaseModel):
    performance_summary: str
    weak_campaigns: List[str]
    optimization_plan: List[str]
    expected_revenue_lift_percent: float

# --- Content & Messaging ---
class ContentMessagingInput(BaseModel):
    target_persona: str
    product_usp: str
    pain_points: List[str]
    competitor_offers: List[str]

class ContentMessagingOutput(BaseModel):
    positioning: str
    core_message: str
    offer_framework: str
    conversion_hooks: List[str]

# --- Growth Forecast ---
class GrowthForecastInput(BaseModel):
    current_revenue: float
    marketing_spend: float
    cac: float
    ltv: float
    conversion_rate: float

class GrowthForecastOutput(BaseModel):
    scenario_table: Dict[str, Dict[str, float]] # Conservative, Moderate, Aggressive
    revenue_forecast: float
    profit_impact: float
    risk_assessment: List[str]
    recommended_growth_path: str

# --- Smart Router ---
class RouterInput(BaseModel):
    real_time_kpis: Dict[str, Any]
    campaign_performance: List[Dict[str, Any]]
    customer_metrics: Dict[str, Any]

class RouterOutput(BaseModel):
    trigger_reason: str
    assigned_agent: str
    priority: str
    expected_kpi_lift: str

# --- Orchestrator ---
class OrchestratorInput(BaseModel):
    marketing_health: Dict[str, Any]
    current_campaigns: List[Dict[str, Any]]
    budget: float
    goals: List[str]

class DetectedIssue(BaseModel):
    type: str
    campaign_id: str
    severity: str
    impact_estimate: str

class RecommendedAction(BaseModel):
    action_type: str
    from_campaign: Optional[str] = None
    to_campaign: Optional[str] = None
    budget_shift_percent: Optional[float] = None
    expected_roi_increase: str

class GrowthProjection(BaseModel):
    conservative: str
    moderate: str
    aggressive: str

class MarketingDecisionSchema(BaseModel):
    marketing_health_score: float
    detected_issues: List[DetectedIssue]
    recommended_actions: List[RecommendedAction]
    growth_projection: GrowthProjection
    risk_level: str
    confidence: str
    plan_30_60_90: Dict[str, List[str]]

class OrchestratorOutput(MarketingDecisionSchema):
    pass
