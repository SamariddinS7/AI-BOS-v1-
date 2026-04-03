from backend.intelligence.business_context import BusinessContext
from typing import List, Dict

class CrossModuleAnalyzer:
    def __init__(self, context: BusinessContext):
        self.context = context

    def detect_profitability_issues(self) -> List[str]:
        """
        Analyzes margins and expenses.
        """
        issues = []
        if self.context.financial.net_profit_margin < 0.1:
            issues.append(f"Low Net Profit Margin ({self.context.financial.net_profit_margin:.2%}). Target > 10%.")
        
        if self.context.financial.operating_expenses > self.context.financial.gross_profit * 0.8:
            issues.append("Operating Expenses exceed 80% of Gross Profit.")
        
        return issues

    def correlate_hr_cost_vs_revenue(self) -> List[str]:
        """
        Analyzes workforce efficiency.
        """
        issues = []
        revenue_per_emp = self.context.hr.revenue_per_employee
        avg_payroll = self.context.hr.total_payroll_cost / self.context.hr.total_employees if self.context.hr.total_employees > 0 else 0

        if revenue_per_emp < avg_payroll * 2: # Rule of thumb: Revenue should be > 2x Cost
            issues.append(f"Low Revenue per Employee (${revenue_per_emp:,.2f}). Payroll cost is high relative to output.")

        if self.context.hr.turnover_rate > 0.15:
            issues.append(f"High Turnover Rate ({self.context.hr.turnover_rate:.2%}). May impact future revenue.")

        return issues

    def identify_growth_opportunities(self) -> List[str]:
        """
        Analyzes sales pipeline vs capacity.
        """
        opportunities = []
        if self.context.sales.pipeline_value > self.context.financial.revenue * 0.5:
            opportunities.append("Strong Pipeline: Potential to grow revenue by >50%. Ensure delivery capacity.")
        
        if self.context.sales.conversion_rate > 0.2:
            opportunities.append("High Conversion Rate (>20%). Increase marketing spend to feed top of funnel.")

        return opportunities

    def detect_cashflow_risk(self) -> List[str]:
        """
        Analyzes burn rate and runway.
        """
        risks = []
        if self.context.risk.runway_months < 6:
            risks.append(f"CRITICAL: Cash Runway < 6 Months ({self.context.risk.runway_months:.1f} months). Immediate fundraising or cost cutting needed.")
        
        if self.context.financial.operational_cashflow < 0:
            risks.append("Negative Operational Cashflow. Business is burning cash on operations.")

        return risks

    def detect_operational_inefficiency(self) -> List[str]:
        """
        Analyzes inventory and asset usage.
        """
        inefficiencies = []
        if self.context.inventory.dead_stock_value > self.context.inventory.total_stock_value * 0.2:
            inefficiencies.append(f"High Dead Stock ({self.context.inventory.dead_stock_value:,.2f}). >20% of inventory is stagnant.")

        return inefficiencies
