from typing import Any, Dict, List
import json
import random
from backend.modules.marketing.schemas import (
    MarketAnalystInput, MarketAnalystOutput,
    CampaignStrategistInput, CampaignStrategistOutput,
    PerformanceOptimizerInput, PerformanceOptimizerOutput,
    ContentMessagingInput, ContentMessagingOutput,
    GrowthForecastInput, GrowthForecastOutput,
    OrchestratorInput, OrchestratorOutput,
    RouterInput, RouterOutput
)
from backend.modules.marketing.prompts import (
    MARKET_ANALYST_PROMPT,
    CAMPAIGN_STRATEGIST_PROMPT,
    PERFORMANCE_OPTIMIZER_PROMPT,
    CONTENT_MESSAGING_PROMPT,
    GROWTH_FORECAST_PROMPT,
    ORCHESTRATOR_PROMPT,
    ROUTER_PROMPT
)
from backend.intelligence.ai_service import AIService

# --- Health Score Formula ---
def calculate_health_score(kpis: Dict[str, float]) -> float:
    """
    Health Score = (ROAS weight 25%) + (LTV/CAC weight 20%) + (Conversion stability 15%) + (Retention 15%) + (Growth trend 15%) + (Risk factor 10%)
    """
    # Normalize values to 0-100 scale (simplified logic for demonstration)
    roas_score = min(max(kpis.get('roas', 0) / 5.0 * 100, 0), 100) * 0.25
    
    ltv_cac_ratio = kpis.get('ltv', 0) / max(kpis.get('cac', 1), 1)
    ltv_cac_score = min(max(ltv_cac_ratio / 3.0 * 100, 0), 100) * 0.20
    
    conv_score = min(max(kpis.get('conversion_rate', 0) * 1000, 0), 100) * 0.15
    retention_score = min(max(kpis.get('retention_rate', 0) * 100, 0), 100) * 0.15
    growth_score = min(max(kpis.get('growth_trend', 50), 0), 100) * 0.15
    
    # Risk factor: lower risk is better (100 - risk)
    risk_score = min(max(100 - kpis.get('risk_factor', 50), 0), 100) * 0.10
    
    total_score = roas_score + ltv_cac_score + conv_score + retention_score + growth_score + risk_score
    return round(total_score, 2)

# --- LLM Service Wrapper ---

class AIModelService:
    @staticmethod
    def generate_response(prompt: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calls the real Gemini AI Service to generate a structured JSON response.
        """
        try:
            # Format the prompt with input data
            formatted_prompt = prompt.format(input_data=json.dumps(input_data, indent=2))
            
            # Call the AI Service (using the structured response method)
            response_text = AIService.generate_structured_response(formatted_prompt)
            
            # Parse the JSON response
            # The AI might return markdown code blocks (```json ... ```), so we strip them
            cleaned_response = response_text.strip()
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response[:-3]
                
            return json.loads(cleaned_response)
            
        except json.JSONDecodeError:
            # Fallback or retry logic could go here
            return {"error": "Failed to parse AI response as JSON", "raw_response": response_text}
        except Exception as e:
            return {"error": f"AI Service Error: {str(e)}"}

# --- Sub-Agents ---

class MarketAnalystAgent:
    def analyze(self, input_data: MarketAnalystInput) -> MarketAnalystOutput:
        prompt = MARKET_ANALYST_PROMPT
        response = AIModelService.generate_response(prompt, input_data.dict())
        return MarketAnalystOutput(**response)

class CampaignStrategistAgent:
    def strategize(self, input_data: CampaignStrategistInput) -> CampaignStrategistOutput:
        prompt = CAMPAIGN_STRATEGIST_PROMPT
        response = AIModelService.generate_response(prompt, input_data.dict())
        return CampaignStrategistOutput(**response)

class PerformanceOptimizerAgent:
    def optimize(self, input_data: PerformanceOptimizerInput) -> PerformanceOptimizerOutput:
        prompt = PERFORMANCE_OPTIMIZER_PROMPT
        response = AIModelService.generate_response(prompt, input_data.dict())
        return PerformanceOptimizerOutput(**response)

class ContentMessagingAgent:
    def create_content(self, input_data: ContentMessagingInput) -> ContentMessagingOutput:
        prompt = CONTENT_MESSAGING_PROMPT
        response = AIModelService.generate_response(prompt, input_data.dict())
        return ContentMessagingOutput(**response)

class GrowthForecastAgent:
    def forecast(self, input_data: GrowthForecastInput) -> GrowthForecastOutput:
        prompt = GROWTH_FORECAST_PROMPT
        response = AIModelService.generate_response(prompt, input_data.dict())
        return GrowthForecastOutput(**response)

# --- Router ---

class MarketingRouter:
    def route(self, input_data: RouterInput) -> RouterOutput:
        # Smart Trigger Engine Logic (Hardcoded fallback if AI fails)
        kpis = input_data.real_time_kpis
        if kpis.get('roas', 0) < 2.5:
            fallback_agent = "Performance Optimizer"
        elif kpis.get('conversion_rate_drop', 0) > 15:
            fallback_agent = "Funnel Analysis"
        elif kpis.get('cac_increase', 0) > 20:
            fallback_agent = "Cost Audit"
        elif kpis.get('retention', 100) < 40:
            fallback_agent = "Loyalty Strategy"
        elif kpis.get('revenue_stagnation_days', 0) > 30:
            fallback_agent = "Growth Simulation"
        else:
            fallback_agent = "Campaign Strategist"

        prompt = ROUTER_PROMPT
        response = AIModelService.generate_response(prompt, input_data.dict())
        
        if "error" in response:
            return RouterOutput(
                trigger_reason="Rule-based trigger due to AI failure",
                assigned_agent=fallback_agent,
                priority="High",
                expected_kpi_lift="Unknown"
            )
            
        return RouterOutput(**response)

# --- Orchestrator ---

class MarketingOrchestrator:
    def __init__(self):
        self.market_analyst = MarketAnalystAgent()
        self.campaign_strategist = CampaignStrategistAgent()
        self.performance_optimizer = PerformanceOptimizerAgent()
        self.content_messaging = ContentMessagingAgent()
        self.growth_forecast = GrowthForecastAgent()
        self.router = MarketingRouter()

    def run_orchestration(self, input_data: OrchestratorInput) -> OrchestratorOutput:
        # Calculate Health Score
        health_score = calculate_health_score(input_data.marketing_health)
        
        # Inject health score into input data for the AI
        input_data_dict = input_data.dict()
        input_data_dict['calculated_health_score'] = health_score
        
        prompt = ORCHESTRATOR_PROMPT
        response = AIModelService.generate_response(prompt, input_data_dict)
        
        if "error" in response:
            raise Exception(f"Orchestrator failed: {response['error']}")
            
        # Ensure the health score is included in the output
        response['marketing_health_score'] = health_score
        
        return OrchestratorOutput(**response)
