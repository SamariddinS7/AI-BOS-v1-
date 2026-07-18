from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from backend.modules.marketing.models import (
    MarketingCampaign, MarketingMetric, TVAdCampaign, DailyMarketingKPI, ChannelType
)
from backend.modules.marketing.kpi import KPICalculator, MarketingKPI
from backend.modules.marketing.attribution import AttributionEngine, CustomerJourney, Touchpoint
from backend.modules.marketing.forecasting import ForecastingEngine, ForecastResult
from backend.modules.marketing.optimization import OptimizationEngine, Recommendation, OptimizationType

class MarketingAnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_campaign_performance(self, campaign_id: int) -> Dict[str, Any]:
        campaign = self.db.query(MarketingCampaign).filter(MarketingCampaign.id == campaign_id).first()
        if not campaign:
            return None
            
        # Calculate KPIs
        kpi = KPICalculator.compute_all_kpis(
            spend=campaign.actual_spend,
            revenue=campaign.revenue_generated,
            impressions=campaign.impressions,
            clicks=campaign.clicks,
            conversions=campaign.conversions
        )
        
        return {
            "campaign": campaign.name,
            "channel": campaign.channel_type,
            "status": campaign.status,
            "metrics": {
                "spend": campaign.actual_spend,
                "revenue": campaign.revenue_generated,
                "impressions": campaign.impressions,
                "clicks": campaign.clicks,
                "conversions": campaign.conversions
            },
            "kpi": kpi.dict()
        }

    def get_marketing_summary(self) -> Dict[str, Any]:
        """
        Aggregated dashboard data.
        """
        total_spend = self.db.query(func.sum(MarketingCampaign.actual_spend)).scalar() or 0.0
        total_revenue = self.db.query(func.sum(MarketingCampaign.revenue_generated)).scalar() or 0.0
        
        overall_roi = KPICalculator.calculate_roi(total_revenue, total_spend)
        overall_roas = KPICalculator.calculate_roas(total_revenue, total_spend)
        
        # Channel Breakdown
        channels = self.db.query(
            MarketingCampaign.channel_type,
            func.sum(MarketingCampaign.actual_spend).label("spend"),
            func.sum(MarketingCampaign.revenue_generated).label("revenue")
        ).group_by(MarketingCampaign.channel_type).all()
        
        channel_breakdown = []
        for ch in channels:
            channel_breakdown.append({
                "channel": ch.channel_type,
                "spend": ch.spend,
                "revenue": ch.revenue,
                "roi": KPICalculator.calculate_roi(ch.revenue, ch.spend)
            })
            
        return {
            "total_spend": total_spend,
            "total_revenue": total_revenue,
            "overall_roi": overall_roi,
            "overall_roas": overall_roas,
            "channel_breakdown": channel_breakdown
        }

    def run_attribution_model(self, model_type: str = "linear") -> Dict[str, Any]:
        """
        Runs attribution model on simulated customer journeys.
        In a real app, this would query a Clickstream/CRM table.
        """
        # Simulate Journeys based on Campaigns
        journeys = self._simulate_customer_journeys()
        
        if model_type == "first_touch":
            result = AttributionEngine.first_touch(journeys)
        elif model_type == "last_touch":
            result = AttributionEngine.last_touch(journeys)
        elif model_type == "weighted":
            result = AttributionEngine.weighted(journeys)
        else:
            result = AttributionEngine.linear(journeys)
            
        return result.dict()

    def generate_forecast(self, days: int = 30) -> Dict[str, Any]:
        """
        Forecasts revenue based on historical campaign data.
        """
        # Get historical daily spend/revenue
        history = self.db.query(
            MarketingMetric.spend,
            MarketingMetric.revenue
        ).order_by(MarketingMetric.date).all()
        
        data_points = [(m.spend, m.revenue) for m in history if m.spend > 0]
        
        if not data_points:
            return {"error": "Insufficient historical data"}
            
        # Forecast based on average daily spend
        avg_daily_spend = sum(x for x, y in data_points) / len(data_points)
        future_spend = avg_daily_spend * days
        
        forecast = ForecastingEngine.forecast_revenue(data_points, future_spend)
        
        return {
            "forecast_days": days,
            "projected_spend": future_spend,
            "projected_revenue": forecast.predicted_revenue,
            "confidence": forecast.confidence_score,
            "trend": forecast.growth_trend
        }

    def get_optimization_recommendations(self) -> List[Recommendation]:
        """
        Analyzes all active campaigns and generates recommendations.
        """
        campaigns = self.db.query(MarketingCampaign).filter(MarketingCampaign.status == "ACTIVE").all()
        recommendations = []
        
        # Calculate average CAC for baseline
        total_spend = sum(c.actual_spend for c in campaigns)
        total_conversions = sum(c.conversions for c in campaigns)
        avg_cac = total_spend / total_conversions if total_conversions > 0 else 0.0
        
        for campaign in campaigns:
            kpi = KPICalculator.compute_all_kpis(
                spend=campaign.actual_spend,
                revenue=campaign.revenue_generated,
                impressions=campaign.impressions,
                clicks=campaign.clicks,
                conversions=campaign.conversions
            )
            
            recs = OptimizationEngine.analyze_campaign(
                campaign_id=campaign.id,
                roi=kpi.roi,
                ctr=kpi.ctr,
                conversion_rate=(campaign.conversions / campaign.clicks) if campaign.clicks > 0 else 0.0,
                cac=kpi.cac,
                avg_cac=avg_cac
            )
            recommendations.extend(recs)
            
        return recommendations

    def _simulate_customer_journeys(self) -> List[CustomerJourney]:
        """
        Helper to simulate journeys for attribution demo.
        """
        campaigns = self.db.query(MarketingCampaign).limit(5).all()
        journeys = []
        
        # Create 10 dummy journeys
        for i in range(10):
            touchpoints = []
            # Randomly assign 2-3 touchpoints from available campaigns
            for j, camp in enumerate(campaigns[:3]):
                touchpoints.append(Touchpoint(
                    channel=camp.channel_type,
                    campaign_id=camp.id,
                    timestamp=datetime.utcnow() - timedelta(days=j),
                    cost=1.0
                ))
            
            journeys.append(CustomerJourney(
                customer_id=f"cust_{i}",
                touchpoints=touchpoints,
                conversion_value=100.0, # Fixed value for demo
                conversion_time=datetime.utcnow()
            ))
            
        return journeys
