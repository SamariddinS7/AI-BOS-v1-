from typing import List, Tuple, Dict, Optional
from pydantic import BaseModel
import math

class ForecastResult(BaseModel):
    predicted_revenue: float
    confidence_score: float
    growth_trend: str # "Positive", "Negative", "Stable"

class ForecastingEngine:
    
    @staticmethod
    def linear_regression(data: List[Tuple[float, float]]) -> Tuple[float, float, float]:
        """
        Simple linear regression: y = mx + b
        Returns (slope, intercept, r_squared)
        """
        n = len(data)
        if n < 2:
            return 0.0, 0.0, 0.0
        
        sum_x = sum(x for x, y in data)
        sum_y = sum(y for x, y in data)
        sum_xy = sum(x * y for x, y in data)
        sum_xx = sum(x * x for x, y in data)
        
        denominator = n * sum_xx - sum_x * sum_x
        if denominator == 0:
            return 0.0, 0.0, 0.0
            
        slope = (n * sum_xy - sum_x * sum_y) / denominator
        intercept = (sum_y - slope * sum_x) / n
        
        # Calculate R-squared
        mean_y = sum_y / n
        ss_tot = sum((y - mean_y) ** 2 for x, y in data)
        ss_res = sum((y - (slope * x + intercept)) ** 2 for x, y in data)
        
        if ss_tot == 0:
            r_squared = 0.0
        else:
            r_squared = 1 - (ss_res / ss_tot)
            
        return slope, intercept, r_squared

    @staticmethod
    def forecast_revenue(historical_data: List[Tuple[float, float]], planned_spend: float) -> ForecastResult:
        """
        Forecasts revenue based on historical (spend, revenue) data.
        """
        slope, intercept, r_squared = ForecastingEngine.linear_regression(historical_data)
        
        predicted_revenue = slope * planned_spend + intercept
        
        trend = "Stable"
        if slope > 1.1:
            trend = "Positive (High ROI)"
        elif slope < 0.9:
            trend = "Negative (Diminishing Returns)"
            
        return ForecastResult(
            predicted_revenue=max(0.0, predicted_revenue),
            confidence_score=r_squared,
            growth_trend=trend
        )

    @staticmethod
    def forecast_budget(historical_data: List[Tuple[float, float]], target_revenue: float) -> float:
        """
        Forecasts required budget to hit a target revenue.
        x = (y - b) / m
        """
        slope, intercept, _ = ForecastingEngine.linear_regression(historical_data)
        
        if slope == 0:
            return 0.0
            
        required_spend = (target_revenue - intercept) / slope
        return max(0.0, required_spend)

    @staticmethod
    def project_demand(historical_sales: List[float], periods: int = 3) -> List[float]:
        """
        Simple Moving Average (SMA) projection.
        """
        if not historical_sales:
            return []
            
        window_size = min(len(historical_sales), 3)
        projection = []
        current_data = list(historical_sales)
        
        for _ in range(periods):
            avg = sum(current_data[-window_size:]) / window_size
            projection.append(avg)
            current_data.append(avg)
            
        return projection
