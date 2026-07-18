from typing import Dict, Any
from pydantic import BaseModel

class MarketingKPI(BaseModel):
    cac: float
    roas: float
    roi: float
    cpm: float
    cpc: float
    ctr: float
    ltv: float = 0.0
    attribution_score: float = 0.0

class KPICalculator:
    @staticmethod
    def calculate_roi(revenue: float, cost: float) -> float:
        if cost == 0:
            return 0.0
        return (revenue - cost) / cost

    @staticmethod
    def calculate_roas(revenue: float, ad_spend: float) -> float:
        if ad_spend == 0:
            return 0.0
        return revenue / ad_spend

    @staticmethod
    def calculate_cac(ad_spend: float, acquired_customers: int) -> float:
        if acquired_customers == 0:
            return 0.0
        return ad_spend / acquired_customers

    @staticmethod
    def calculate_ctr(clicks: int, impressions: int) -> float:
        if impressions == 0:
            return 0.0
        return clicks / impressions

    @staticmethod
    def calculate_cpc(spend: float, clicks: int) -> float:
        if clicks == 0:
            return 0.0
        return spend / clicks

    @staticmethod
    def calculate_cpm(spend: float, impressions: int) -> float:
        if impressions == 0:
            return 0.0
        return (spend / impressions) * 1000

    @staticmethod
    def compute_all_kpis(
        spend: float, 
        revenue: float, 
        impressions: int, 
        clicks: int, 
        conversions: int,
        ltv_estimate: float = 0.0
    ) -> MarketingKPI:
        return MarketingKPI(
            roi=KPICalculator.calculate_roi(revenue, spend),
            roas=KPICalculator.calculate_roas(revenue, spend),
            cac=KPICalculator.calculate_cac(spend, conversions),
            ctr=KPICalculator.calculate_ctr(clicks, impressions),
            cpc=KPICalculator.calculate_cpc(spend, clicks),
            cpm=KPICalculator.calculate_cpm(spend, impressions),
            ltv=ltv_estimate
        )
