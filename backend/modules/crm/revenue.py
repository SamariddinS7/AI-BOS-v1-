from sqlalchemy.orm import Session
from backend.database.models import Deal, DealStage, Customer
from datetime import datetime, timedelta
from typing import List, Dict

class RevenueService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_revenue(self, period_start: datetime, period_end: datetime) -> float:
        """
        Calculates revenue from closed deals in a period.
        """
        deals = self.db.query(Deal).filter(
            Deal.stage == DealStage.CLOSED_WON,
            Deal.closed_date >= period_start,
            Deal.closed_date <= period_end
        ).all()

        return sum(deal.amount for deal in deals)

    def calculate_conversion_rate(self, period_start: datetime, period_end: datetime) -> float:
        """
        Calculates conversion rate from LEAD to CLOSED_WON.
        """
        leads = self.db.query(Deal).filter(
            Deal.stage == DealStage.LEAD,
            Deal.created_at >= period_start,
            Deal.created_at <= period_end
        ).count()

        closed_won = self.db.query(Deal).filter(
            Deal.stage == DealStage.CLOSED_WON,
            Deal.closed_date >= period_start,
            Deal.closed_date <= period_end
        ).count()

        if leads == 0:
            return 0.0

        return (closed_won / leads) * 100

    def calculate_customer_lifetime_value(self, customer_id: int) -> float:
        """
        Calculates total revenue from a customer.
        """
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise ValueError("Customer not found")

        deals = self.db.query(Deal).filter(
            Deal.customer_id == customer_id,
            Deal.stage == DealStage.CLOSED_WON
        ).all()

        return sum(deal.amount for deal in deals)
