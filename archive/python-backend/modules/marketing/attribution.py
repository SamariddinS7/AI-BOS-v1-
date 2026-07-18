from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class Touchpoint(BaseModel):
    channel: str
    campaign_id: int
    timestamp: datetime
    cost: float = 0.0

class CustomerJourney(BaseModel):
    customer_id: str
    touchpoints: List[Touchpoint]
    conversion_value: float
    conversion_time: datetime

class AttributionResult(BaseModel):
    revenue_distribution: Dict[str, float]
    attribution_percentage: Dict[str, float]

class AttributionEngine:
    
    @staticmethod
    def first_touch(journeys: List[CustomerJourney]) -> AttributionResult:
        revenue_dist = {}
        total_revenue = 0.0
        
        for journey in journeys:
            if not journey.touchpoints:
                continue
            
            # Sort by time just in case
            sorted_points = sorted(journey.touchpoints, key=lambda x: x.timestamp)
            first_point = sorted_points[0]
            
            revenue_dist[first_point.channel] = revenue_dist.get(first_point.channel, 0.0) + journey.conversion_value
            total_revenue += journey.conversion_value
            
        return AttributionEngine._format_result(revenue_dist, total_revenue)

    @staticmethod
    def last_touch(journeys: List[CustomerJourney]) -> AttributionResult:
        revenue_dist = {}
        total_revenue = 0.0
        
        for journey in journeys:
            if not journey.touchpoints:
                continue
            
            sorted_points = sorted(journey.touchpoints, key=lambda x: x.timestamp)
            last_point = sorted_points[-1]
            
            revenue_dist[last_point.channel] = revenue_dist.get(last_point.channel, 0.0) + journey.conversion_value
            total_revenue += journey.conversion_value
            
        return AttributionEngine._format_result(revenue_dist, total_revenue)

    @staticmethod
    def linear(journeys: List[CustomerJourney]) -> AttributionResult:
        revenue_dist = {}
        total_revenue = 0.0
        
        for journey in journeys:
            if not journey.touchpoints:
                continue
                
            count = len(journey.touchpoints)
            value_per_point = journey.conversion_value / count
            
            for point in journey.touchpoints:
                revenue_dist[point.channel] = revenue_dist.get(point.channel, 0.0) + value_per_point
            
            total_revenue += journey.conversion_value
            
        return AttributionEngine._format_result(revenue_dist, total_revenue)

    @staticmethod
    def weighted(journeys: List[CustomerJourney]) -> AttributionResult:
        """
        U-Shaped Attribution: 40% First, 40% Last, 20% Middle distributed.
        If < 3 touchpoints, split evenly.
        """
        revenue_dist = {}
        total_revenue = 0.0
        
        for journey in journeys:
            if not journey.touchpoints:
                continue
            
            sorted_points = sorted(journey.touchpoints, key=lambda x: x.timestamp)
            count = len(sorted_points)
            
            if count <= 2:
                # Fallback to linear for short paths
                value_per_point = journey.conversion_value / count
                for point in sorted_points:
                    revenue_dist[point.channel] = revenue_dist.get(point.channel, 0.0) + value_per_point
            else:
                first_value = journey.conversion_value * 0.4
                last_value = journey.conversion_value * 0.4
                middle_value = (journey.conversion_value * 0.2) / (count - 2)
                
                revenue_dist[sorted_points[0].channel] = revenue_dist.get(sorted_points[0].channel, 0.0) + first_value
                revenue_dist[sorted_points[-1].channel] = revenue_dist.get(sorted_points[-1].channel, 0.0) + last_value
                
                for point in sorted_points[1:-1]:
                    revenue_dist[point.channel] = revenue_dist.get(point.channel, 0.0) + middle_value
            
            total_revenue += journey.conversion_value
            
        return AttributionEngine._format_result(revenue_dist, total_revenue)

    @staticmethod
    def _format_result(revenue_dist: Dict[str, float], total_revenue: float) -> AttributionResult:
        attribution_pct = {}
        if total_revenue > 0:
            for channel, revenue in revenue_dist.items():
                attribution_pct[channel] = round((revenue / total_revenue) * 100, 2)
        
        return AttributionResult(
            revenue_distribution=revenue_dist,
            attribution_percentage=attribution_pct
        )
