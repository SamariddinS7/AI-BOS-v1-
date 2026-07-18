from backend.intelligence.business_context import BusinessContext
from typing import List, Dict

class CostOptimizationWorkflow:
    def __init__(self, context: BusinessContext):
        self.context = context

    def execute(self) -> Dict[str, Any]:
        """
        Analyzes expenses and returns cost-cutting recommendations.
        """
        recommendations = []
        
        # 1. Analyze Operating Expenses
        op_exp_ratio = self.context.financial.operating_expenses / self.context.financial.revenue if self.context.financial.revenue > 0 else 1
        if op_exp_ratio > 0.8:
            recommendations.append({
                "area": "Operating Expenses",
                "severity": "High",
                "action": "Reduce non-essential overhead. OpEx is >80% of Revenue.",
                "potential_savings": self.context.financial.operating_expenses * 0.1 # Target 10% reduction
            })

        # 2. Analyze COGS
        cogs_ratio = self.context.financial.cogs / self.context.financial.revenue if self.context.financial.revenue > 0 else 1
        if cogs_ratio > 0.6:
            recommendations.append({
                "area": "COGS",
                "severity": "Medium",
                "action": "Renegotiate supplier contracts. COGS is >60% of Revenue.",
                "potential_savings": self.context.financial.cogs * 0.05 # Target 5% reduction
            })

        # 3. Analyze Payroll
        payroll_ratio = self.context.hr.total_payroll_cost / self.context.financial.operating_expenses if self.context.financial.operating_expenses > 0 else 0
        if payroll_ratio > 0.7:
            recommendations.append({
                "area": "Payroll",
                "severity": "Medium",
                "action": "Review staffing levels. Payroll is >70% of OpEx.",
                "potential_savings": 0.0 # Sensitive area, usually requires deeper analysis
            })

        return {
            "workflow": "Cost Optimization",
            "status": "Completed",
            "recommendations": recommendations,
            "total_potential_savings": sum(r["potential_savings"] for r in recommendations)
        }
