from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict

from backend.database.models import (
    Account, AccountType, JournalEntry, GeneralLedger,
    Employee, Payroll, EmployeeKPI, EmployeeStatus,
    Deal, DealStage, Customer,
    Product, SaleItem
)
from backend.modules.finance.pnl import PnLService
from backend.modules.finance.cashflow import CashflowService
from backend.modules.crm.revenue import RevenueService
from backend.intelligence.business_context import (
    BusinessContext, FinancialSummary, HRSummary, SalesSummary, InventorySummary, RiskIndicators
)

class DataAggregator:
    def __init__(self, db: Session):
        self.db = db

    def aggregate_finance(self, start_date: datetime, end_date: datetime) -> FinancialSummary:
        """
        Aggregates financial data using existing Finance Module services.
        """
        pnl_service = PnLService(self.db)
        cashflow_service = CashflowService(self.db)

        pnl = pnl_service.generate_pnl(start_date, end_date)
        cashflow = cashflow_service.generate_cashflow(start_date, end_date)

        revenue = pnl.get("revenue", 0.0)
        net_profit = pnl.get("net_profit", 0.0)
        
        return FinancialSummary(
            revenue=revenue,
            cogs=pnl.get("cogs", 0.0),
            gross_profit=pnl.get("gross_profit", 0.0),
            operating_expenses=pnl.get("operating_expenses", 0.0),
            net_profit=net_profit,
            net_profit_margin=(net_profit / revenue) if revenue > 0 else 0.0,
            operational_cashflow=cashflow.get("operational_flow", 0.0),
            investing_cashflow=cashflow.get("investing_flow", 0.0),
            financing_cashflow=cashflow.get("financing_flow", 0.0),
            net_cash_change=cashflow.get("net_cash_change", 0.0)
        )

    def aggregate_hr(self, start_date: datetime, end_date: datetime) -> HRSummary:
        """
        Aggregates HR data directly from models.
        """
        employees = self.db.query(Employee).filter(Employee.status == EmployeeStatus.ACTIVE).all()
        total_employees = len(employees)

        payrolls = self.db.query(Payroll).filter(
            Payroll.period_start >= start_date,
            Payroll.period_end <= end_date
        ).all()
        total_payroll_cost = sum(p.net_amount + p.tax_amount for p in payrolls)

        # Average KPI Score
        kpis = self.db.query(EmployeeKPI).filter(EmployeeKPI.period == "CURRENT").all() # Simplified period logic
        avg_kpi_score = sum(k.score for k in kpis) / len(kpis) if kpis else 0.0

        # Turnover Rate (Simplified: Terminated / Total)
        terminated = self.db.query(Employee).filter(
            Employee.status == EmployeeStatus.TERMINATED,
            Employee.hired_date >= start_date # Using hired_date as proxy for activity window for simplicity
        ).count()
        turnover_rate = (terminated / total_employees) if total_employees > 0 else 0.0

        # Revenue per Employee (Requires Finance aggregation first, but calculated later in cross-analysis)
        # Here we just return 0.0 as placeholder, or calculate if we fetch revenue again.
        # Better to calculate in cross-analysis.
        
        return HRSummary(
            total_employees=total_employees,
            total_payroll_cost=total_payroll_cost,
            avg_kpi_score=avg_kpi_score,
            turnover_rate=turnover_rate,
            revenue_per_employee=0.0 # To be filled by cross-analysis
        )

    def aggregate_crm(self, start_date: datetime, end_date: datetime) -> SalesSummary:
        """
        Aggregates CRM data.
        """
        revenue_service = RevenueService(self.db)
        total_revenue = revenue_service.calculate_revenue(start_date, end_date)
        conversion_rate = revenue_service.calculate_conversion_rate(start_date, end_date)

        # Pipeline Value
        pipeline_deals = self.db.query(Deal).filter(
            Deal.stage.in_([DealStage.QUALIFIED, DealStage.PROPOSAL, DealStage.NEGOTIATION])
        ).all()
        pipeline_value = sum(d.amount * d.probability for d in pipeline_deals)

        # Churn Risk
        churn_risk_count = self.db.query(Customer).filter(Customer.churn_risk_score > 0.7).count()

        return SalesSummary(
            total_revenue=total_revenue,
            conversion_rate=conversion_rate,
            pipeline_value=pipeline_value,
            top_performing_product=None, # Requires Analytics aggregation
            churn_risk_count=churn_risk_count
        )

    def aggregate_inventory(self) -> InventorySummary:
        """
        Aggregates Inventory data.
        """
        products = self.db.query(Product).all()
        total_stock_value = sum(p.cost_price * p.stock_quantity for p in products)
        low_stock_items = sum(1 for p in products if p.stock_quantity < 10) # Threshold
        
        # Dead stock logic (simplified: no sales in 90 days)
        dead_stock_value = 0.0
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        for p in products:
            sales = self.db.query(SaleItem).filter(
                SaleItem.product_id == p.id,
                SaleItem.sale_date >= cutoff_date
            ).count()
            if sales == 0:
                dead_stock_value += p.cost_price * p.stock_quantity

        return InventorySummary(
            total_stock_value=total_stock_value,
            low_stock_items=low_stock_items,
            dead_stock_value=dead_stock_value,
            turnover_rate=0.0 # Requires COGS / Avg Inventory
        )

    def build_business_context(self, start_date: datetime, end_date: datetime) -> BusinessContext:
        """
        Master function to build the full context object.
        """
        financial = self.aggregate_finance(start_date, end_date)
        hr = self.aggregate_hr(start_date, end_date)
        sales = self.aggregate_crm(start_date, end_date)
        inventory = self.aggregate_inventory()

        # Cross-module calculations
        if hr.total_employees > 0:
            hr.revenue_per_employee = financial.revenue / hr.total_employees
        
        # Inventory Turnover
        if inventory.total_stock_value > 0:
            inventory.turnover_rate = financial.cogs / inventory.total_stock_value

        # Risk Indicators
        cash_burn_rate = abs(financial.operational_cashflow) if financial.operational_cashflow < 0 else 0.0
        # Assuming we have a 'Cash' account balance available, simplified here:
        current_cash = 100000.0 # Placeholder: In real app, query Account balance for 'Cash'
        runway_months = (current_cash / cash_burn_rate) if cash_burn_rate > 0 else 999.0

        risk = RiskIndicators(
            cash_burn_rate=cash_burn_rate,
            runway_months=runway_months,
            high_churn_risk=sales.churn_risk_count > 5, # Threshold
            compliance_issues=0 # Placeholder
        )

        return BusinessContext(
            period_start=start_date,
            period_end=end_date,
            financial=financial,
            hr=hr,
            sales=sales,
            inventory=inventory,
            risk=risk
        )
