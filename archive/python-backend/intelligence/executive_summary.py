from backend.intelligence.business_context import BusinessContext
from backend.intelligence.cross_analysis import CrossModuleAnalyzer
from typing import List, Dict, Any

class ExecutiveInsightsEngine:
    def __init__(self, context: BusinessContext):
        self.context = context
        self.analyzer = CrossModuleAnalyzer(context)

    def generate_risk_score(self) -> float:
        """
        Calculates a risk score (0-100, where 100 is high risk).
        """
        score = 0.0
        
        # Financial Risk
        if self.context.risk.runway_months < 6: score += 40
        elif self.context.risk.runway_months < 12: score += 20
        
        if self.context.financial.net_profit_margin < 0: score += 20
        
        # Operational Risk
        if self.context.hr.turnover_rate > 0.2: score += 20
        if self.context.inventory.dead_stock_value > self.context.inventory.total_stock_value * 0.2: score += 10
        
        # Sales Risk
        if self.context.sales.churn_risk_count > 10: score += 10

        return min(score, 100.0)

    def generate_growth_score(self) -> float:
        """
        Calculates a growth potential score (0-100).
        """
        score = 0.0
        
        # Pipeline Strength
        pipeline_ratio = self.context.sales.pipeline_value / self.context.financial.revenue if self.context.financial.revenue > 0 else 0
        if pipeline_ratio > 0.5: score += 30
        
        # Conversion Efficiency
        if self.context.sales.conversion_rate > 0.2: score += 20
        
        # Profitability for Reinvestment
        if self.context.financial.net_profit_margin > 0.15: score += 20
        
        # Market Health (Placeholder logic)
        score += 10 

        return min(score, 100.0)

    def generate_efficiency_score(self) -> float:
        """
        Calculates operational efficiency score (0-100).
        """
        score = 50.0 # Base score
        
        # Revenue per Employee
        rev_per_emp = self.context.hr.revenue_per_employee
        if rev_per_emp > 200000: score += 20
        elif rev_per_emp < 50000: score -= 20
        
        # Expense Ratio
        expense_ratio = self.context.financial.operating_expenses / self.context.financial.revenue if self.context.financial.revenue > 0 else 1
        if expense_ratio < 0.6: score += 20
        elif expense_ratio > 0.9: score -= 20
        
        # Inventory Turnover
        if self.context.inventory.turnover_rate > 4: score += 10

        return max(0.0, min(score, 100.0))

    def generate_executive_summary(self) -> Dict[str, Any]:
        """
        Generates the full executive report structure.
        """
        risk_score = self.generate_risk_score()
        growth_score = self.generate_growth_score()
        efficiency_score = self.generate_efficiency_score()

        # Collect insights from analyzer
        profitability_issues = self.analyzer.detect_profitability_issues()
        hr_issues = self.analyzer.correlate_hr_cost_vs_revenue()
        growth_opps = self.analyzer.identify_growth_opportunities()
        cashflow_risks = self.analyzer.detect_cashflow_risk()
        inefficiencies = self.analyzer.detect_operational_inefficiency()

        all_insights = profitability_issues + hr_issues + growth_opps + cashflow_risks + inefficiencies

        return {
            "business_context": self.context.dict(),
            "scores": {
                "risk": risk_score,
                "growth": growth_score,
                "efficiency": efficiency_score
            },
            "key_insights": all_insights,
            "generated_at": datetime.utcnow().isoformat()
        }
