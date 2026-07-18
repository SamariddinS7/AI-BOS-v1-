from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

# --- Financial Summary ---
class FinancialSummary(BaseModel):
    revenue: float
    cogs: float
    gross_profit: float
    operating_expenses: float
    net_profit: float
    net_profit_margin: float
    operational_cashflow: float
    investing_cashflow: float
    financing_cashflow: float
    net_cash_change: float

# --- HR Summary ---
class HRSummary(BaseModel):
    total_employees: int
    total_payroll_cost: float
    avg_kpi_score: float
    turnover_rate: float
    revenue_per_employee: float

# --- Sales Summary ---
class SalesSummary(BaseModel):
    total_revenue: float
    conversion_rate: float
    pipeline_value: float
    top_performing_product: Optional[str]
    churn_risk_count: int

# --- Inventory Summary ---
class InventorySummary(BaseModel):
    total_stock_value: float
    low_stock_items: int
    dead_stock_value: float
    turnover_rate: float

# --- Risk Indicators ---
class RiskIndicators(BaseModel):
    cash_burn_rate: float
    runway_months: float
    high_churn_risk: bool
    compliance_issues: int

# --- Main Business Context ---
class BusinessContext(BaseModel):
    period_start: datetime
    period_end: datetime
    financial: FinancialSummary
    hr: HRSummary
    sales: SalesSummary
    inventory: InventorySummary
    risk: RiskIndicators
    generated_at: datetime = datetime.utcnow()
