from sqlalchemy.orm import Session
from backend.database.models import Deal, DealStage
from datetime import datetime, timedelta
from typing import List, Dict

class ForecastService:
    def __init__(self, db: Session):
        self.db = db

    def forecast_revenue(self, months: int) -> Dict[str, float]:
        """
        Forecasts revenue for the next N months using simple moving average.
        """
        # Get historical data (last 12 months)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=365)

        deals = self.db.query(Deal).filter(
            Deal.stage == DealStage.CLOSED_WON,
            Deal.closed_date >= start_date,
            Deal.closed_date <= end_date
        ).all()

        # Group by month
        monthly_revenue = {}
        for deal in deals:
            month_key = deal.closed_date.strftime("%Y-%m")
            monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + deal.amount

        # Calculate average monthly revenue
        if not monthly_revenue:
            return {"forecast": 0.0, "confidence": 0.0}

        avg_revenue = sum(monthly_revenue.values()) / len(monthly_revenue)

        # Simple forecast: average * months
        forecast_amount = avg_revenue * months

        # Confidence level (simplified: based on data points)
        confidence = min(len(monthly_revenue) / 12.0, 1.0) # More data = higher confidence

        return {
            "forecast_amount": forecast_amount,
            "confidence_level": confidence,
            "method": "Simple Moving Average"
        }
