from backend.intelligence.business_context import BusinessContext
from typing import List, Dict, Any

class RiskAssessmentWorkflow:
    def __init__(self, context: BusinessContext):
        self.context = context

    def execute(self) -> Dict[str, Any]:
        """
        Analyzes business risks and returns recommendations.
        """
        recommendations = []
        
        # 1. Analyze Cash Runway
        runway = self.context.risk.runway_months
        if runway < 3:
            recommendations.append({
                "area": "Cashflow",
                "severity": "CRITICAL",
                "action": f"Immediate fundraising or drastic cost cutting. Runway < 3 months ({runway:.1f}).",
                "potential_impact": 0.0 # Survival
            })
        elif runway < 6:
            recommendations.append({
                "area": "Cashflow",
                "severity": "High",
                "action": f"Plan fundraising or cost optimization. Runway < 6 months ({runway:.1f}).",
                "potential_impact": 0.0
            })

        # 2. Analyze Profitability
        if self.context.financial.net_profit_margin < 0:
            recommendations.append({
                "area": "Profitability",
                "severity": "High",
                "action": f"Address negative margin ({self.context.financial.net_profit_margin:.1%}).",
                "potential_impact": abs(self.context.financial.net_profit)
            })

        # 3. Analyze Churn
        if self.context.sales.churn_risk_count > 5:
            recommendations.append({
                "area": "Customer Base",
                "severity": "Medium",
                "action": f"Mitigate churn risk for {self.context.sales.churn_risk_count} customers.",
                "potential_impact": self.context.sales.churn_risk_count * 500.0 # Placeholder LTV
            })

        # 4. Analyze Inventory Risk
        if self.context.inventory.dead_stock_value > 10000:
            recommendations.append({
                "area": "Inventory",
                "severity": "Low",
                "action": f"Liquidate dead stock (${self.context.inventory.dead_stock_value:,.2f}).",
                "potential_impact": self.context.inventory.dead_stock_value * 0.5 # Recover 50%
            })

        return {
            "workflow": "Risk Assessment",
            "status": "Completed",
            "recommendations": recommendations,
            "total_potential_impact": sum(r["potential_impact"] for r in recommendations)
        }
