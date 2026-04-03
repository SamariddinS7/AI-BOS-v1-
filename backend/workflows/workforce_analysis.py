from backend.intelligence.business_context import BusinessContext
from typing import List, Dict, Any

class WorkforceAnalysisWorkflow:
    def __init__(self, context: BusinessContext):
        self.context = context

    def execute(self) -> Dict[str, Any]:
        """
        Analyzes workforce efficiency and returns recommendations.
        """
        recommendations = []
        
        # 1. Analyze Revenue per Employee
        rev_per_emp = self.context.hr.revenue_per_employee
        if rev_per_emp < 50000:
            recommendations.append({
                "area": "Productivity",
                "severity": "High",
                "action": "Investigate low revenue per employee (<$50k).",
                "potential_impact": self.context.hr.total_employees * 10000.0 # Target $10k improvement
            })
        elif rev_per_emp > 250000:
            recommendations.append({
                "area": "Hiring",
                "severity": "Medium",
                "action": "Consider hiring to support growth. Revenue/Emp >$250k.",
                "potential_impact": 0.0 # Strategic
            })

        # 2. Analyze Turnover
        if self.context.hr.turnover_rate > 0.15:
            recommendations.append({
                "area": "Retention",
                "severity": "High",
                "action": f"Address high turnover ({self.context.hr.turnover_rate:.1%}).",
                "potential_impact": self.context.hr.total_employees * 5000.0 # Cost of replacement
            })

        # 3. Analyze KPI
        if self.context.hr.avg_kpi_score < 70:
            recommendations.append({
                "area": "Performance Management",
                "severity": "Medium",
                "action": "Review performance management. Avg KPI < 70.",
                "potential_impact": self.context.hr.total_payroll_cost * 0.05 # 5% efficiency gain
            })

        return {
            "workflow": "Workforce Analysis",
            "status": "Completed",
            "recommendations": recommendations,
            "total_potential_impact": sum(r["potential_impact"] for r in recommendations)
        }
