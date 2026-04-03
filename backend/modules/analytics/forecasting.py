from sqlalchemy.orm import Session
from backend.database.models import Product, SaleItem
from datetime import datetime, timedelta
from typing import List, Dict

class DemandForecastService:
    def __init__(self, db: Session):
        self.db = db

    def demand_forecast(self, product_id: int, months: int) -> Dict[str, float]:
        """
        Forecasts demand for a product using simple time-series logic.
        """
        # Get historical sales data (last 12 months)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=365)

        sales = self.db.query(SaleItem).filter(
            SaleItem.product_id == product_id,
            SaleItem.sale_date >= start_date,
            SaleItem.sale_date <= end_date
        ).all()

        # Group by month
        monthly_sales = {}
        for sale in sales:
            month_key = sale.sale_date.strftime("%Y-%m")
            monthly_sales[month_key] = monthly_sales.get(month_key, 0) + sale.quantity

        # Calculate average monthly sales
        if not monthly_sales:
            return {"forecast": 0.0, "confidence": 0.0}

        avg_sales = sum(monthly_sales.values()) / len(monthly_sales)

        # Simple forecast: average * months
        forecast_quantity = avg_sales * months

        # Confidence level (simplified: based on data points)
        confidence = min(len(monthly_sales) / 12.0, 1.0) # More data = higher confidence

        return {
            "forecast_quantity": forecast_quantity,
            "confidence_level": confidence,
            "method": "Simple Moving Average"
        }
