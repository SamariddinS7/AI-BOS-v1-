from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.database.session import get_db
from backend.modules.marketing.schemas import (
    MarketAnalystInput, MarketAnalystOutput,
    CampaignStrategistInput, CampaignStrategistOutput,
    PerformanceOptimizerInput, PerformanceOptimizerOutput,
    ContentMessagingInput, ContentMessagingOutput,
    GrowthForecastInput, GrowthForecastOutput,
    OrchestratorInput, OrchestratorOutput,
    RouterInput, RouterOutput,
    MarketingDecisionSchema
)
from backend.modules.marketing.services.agents import (
    MarketAnalystAgent,
    CampaignStrategistAgent,
    PerformanceOptimizerAgent,
    ContentMessagingAgent,
    GrowthForecastAgent,
    MarketingOrchestrator,
    MarketingRouter
)
from backend.modules.marketing.services.analytics import MarketingAnalyticsService

router = APIRouter(prefix="/marketing", tags=["Marketing Intelligence"])

# --- Analytics Endpoints ---

@router.get("/summary", tags=["Marketing Analytics"])
def get_marketing_summary(db: Session = Depends(get_db)):
    service = MarketingAnalyticsService(db)
    return service.get_marketing_summary()

@router.get("/campaign/{campaign_id}", tags=["Marketing Analytics"])
def get_campaign_performance(campaign_id: int, db: Session = Depends(get_db)):
    service = MarketingAnalyticsService(db)
    result = service.get_campaign_performance(campaign_id)
    if not result:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return result

@router.get("/attribution", tags=["Marketing Analytics"])
def get_attribution_model(model: str = "linear", db: Session = Depends(get_db)):
    service = MarketingAnalyticsService(db)
    return service.run_attribution_model(model)

@router.get("/forecast", tags=["Marketing Analytics"])
def get_marketing_forecast(days: int = 30, db: Session = Depends(get_db)):
    service = MarketingAnalyticsService(db)
    return service.generate_forecast(days)

@router.get("/optimize", tags=["Marketing Analytics"])
def get_optimization_recommendations(db: Session = Depends(get_db)):
    service = MarketingAnalyticsService(db)
    return service.get_optimization_recommendations()

# --- Sub-Agent Endpoints ---

@router.post("/analyst", response_model=MarketAnalystOutput)
def run_market_analyst(input_data: MarketAnalystInput):
    agent = MarketAnalystAgent()
    return agent.analyze(input_data)

@router.post("/strategist", response_model=CampaignStrategistOutput)
def run_campaign_strategist(input_data: CampaignStrategistInput):
    agent = CampaignStrategistAgent()
    return agent.strategize(input_data)

@router.post("/optimizer", response_model=PerformanceOptimizerOutput)
def run_performance_optimizer(input_data: PerformanceOptimizerInput):
    agent = PerformanceOptimizerAgent()
    return agent.optimize(input_data)

@router.post("/content", response_model=ContentMessagingOutput)
def run_content_messaging(input_data: ContentMessagingInput):
    agent = ContentMessagingAgent()
    return agent.create_content(input_data)

@router.post("/forecast", response_model=GrowthForecastOutput)
def run_growth_forecast(input_data: GrowthForecastInput):
    agent = GrowthForecastAgent()
    return agent.forecast(input_data)

@router.post("/router", response_model=RouterOutput)
def run_marketing_router(input_data: RouterInput):
    agent = MarketingRouter()
    return agent.route(input_data)

# --- Orchestrator Endpoint ---

@router.post("/orchestrator", response_model=OrchestratorOutput)
def run_marketing_orchestrator(input_data: OrchestratorInput):
    orchestrator = MarketingOrchestrator()
    return orchestrator.run_orchestration(input_data)

# --- Real-Time Marketing AI API Integration Model ---
@router.post("/analyze", response_model=MarketingDecisionSchema, tags=["Marketing AI API"])
def analyze_marketing_data(payload: dict):
    """
    Example Backend Call:
    POST /ai/marketing/analyze
    {
       "period": "last_7_days",
       "kpis": {...},
       "campaigns": [...],
       "customers": [...]
    }
    """
    # 1. Prepare input for Orchestrator
    orchestrator_input = OrchestratorInput(
        marketing_health=payload.get("kpis", {}),
        current_campaigns=payload.get("campaigns", []),
        budget=payload.get("kpis", {}).get("total_budget", 100000), # Default or extracted
        goals=["Maximize ROAS", "Reduce CAC", "Improve Retention"]
    )
    
    # 2. Run Orchestrator (which calculates health score and generates the structured JSON)
    orchestrator = MarketingOrchestrator()
    try:
        decision = orchestrator.run_orchestration(orchestrator_input)
        return decision
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Dashboard Metrics (Placeholder) ---

@router.get("/metrics/dashboard")
def get_marketing_dashboard_metrics(db: Session = Depends(get_db)):
    # In a real implementation, this would query the MarketingMetric table
    # and calculate CAC, LTV, ROAS, etc.
    return {
        "cac": 45.5,
        "ltv": 320.0,
        "roas": 3.8,
        "ctr": 0.025,
        "conversion_rate": 0.04,
        "funnel_drop_off": {"view_to_click": 0.5, "click_to_lead": 0.2, "lead_to_sale": 0.1},
        "retention_rate": 0.75,
        "churn_rate": 0.05,
        "marketing_efficiency_ratio": 4.2
    }
