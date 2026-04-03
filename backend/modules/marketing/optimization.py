from typing import List, Dict, Any
from pydantic import BaseModel
from enum import Enum

class OptimizationType(str, Enum):
    BUDGET_REALLOCATION = "BUDGET_REALLOCATION"
    LANDING_PAGE_FIX = "LANDING_PAGE_FIX"
    AUDIENCE_REFINEMENT = "AUDIENCE_REFINEMENT"
    CREATIVE_REFRESH = "CREATIVE_REFRESH"
    SCALE_UP = "SCALE_UP"
    PAUSE_CAMPAIGN = "PAUSE_CAMPAIGN"

class Recommendation(BaseModel):
    campaign_id: int
    type: OptimizationType
    reason: str
    action: str
    impact_score: float # 0-10

class OptimizationEngine:
    
    @staticmethod
    def analyze_campaign(
        campaign_id: int,
        roi: float,
        ctr: float,
        conversion_rate: float,
        cac: float,
        avg_cac: float,
        roas_threshold: float = 2.0
    ) -> List[Recommendation]:
        recommendations = []
        
        # 1. ROI Check
        if roi < roas_threshold:
            recommendations.append(Recommendation(
                campaign_id=campaign_id,
                type=OptimizationType.PAUSE_CAMPAIGN,
                reason=f"ROI ({roi:.2f}) is below threshold ({roas_threshold}).",
                action="Pause campaign or reduce budget by 50%.",
                impact_score=8.0
            ))
        elif roi > (roas_threshold * 1.5):
            recommendations.append(Recommendation(
                campaign_id=campaign_id,
                type=OptimizationType.SCALE_UP,
                reason=f"High ROI ({roi:.2f}). Campaign is profitable.",
                action="Increase budget by 20% to scale.",
                impact_score=9.0
            ))

        # 2. Funnel Leak Check (High CTR, Low Conv)
        if ctr > 0.02 and conversion_rate < 0.01:
            recommendations.append(Recommendation(
                campaign_id=campaign_id,
                type=OptimizationType.LANDING_PAGE_FIX,
                reason="High CTR but low conversion rate indicates landing page friction.",
                action="Optimize landing page speed, copy, or CTA.",
                impact_score=7.5
            ))

        # 3. CAC Trend Check
        if cac > (avg_cac * 1.3):
            recommendations.append(Recommendation(
                campaign_id=campaign_id,
                type=OptimizationType.AUDIENCE_REFINEMENT,
                reason=f"CAC ({cac:.2f}) is 30% higher than average ({avg_cac:.2f}).",
                action="Refine audience targeting or exclude low-performing segments.",
                impact_score=6.0
            ))

        return recommendations

    @staticmethod
    def suggest_budget_reallocation(
        campaign_rois: Dict[int, float],
        total_budget: float
    ) -> Dict[int, float]:
        """
        Suggests new budget allocation based on ROI weights.
        """
        total_roi = sum(campaign_rois.values())
        if total_roi == 0:
            return {}
            
        new_allocation = {}
        for campaign_id, roi in campaign_rois.items():
            # Weighted distribution
            weight = roi / total_roi
            new_allocation[campaign_id] = round(total_budget * weight, 2)
            
        return new_allocation
