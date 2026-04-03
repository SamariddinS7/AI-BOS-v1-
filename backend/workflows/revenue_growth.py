from backend.intelligence.business_context import BusinessContext
from typing import List, Dict, Any

class RevenueGrowthWorkflow:
    def __init__(self, context: BusinessContext):
        self.context = context

    def execute(self) -> Dict[str, Any]:
        """
        Analyzes growth opportunities and returns recommendations.
        """
        recommendations = []
        
        # 1. Analyze Pipeline
        pipeline_ratio = self.context.sales.pipeline_value / self.context.financial.revenue if self.context.financial.revenue > 0 else 0
        if pipeline_ratio < 0.2:
            recommendations.append({
                "area": "Sales Pipeline",
                "severity": "High",
                "action": "Increase lead generation. Pipeline is <20% of Revenue.",
                "potential_impact": self.context.financial.revenue * 0.1 # Target 10% growth
            })
        elif pipeline_ratio > 0.5:
            recommendations.append({
                "area": "Sales Capacity",
                "severity": "Medium",
                "action": "Ensure delivery capacity for strong pipeline.",
                "potential_impact": self.context.sales.pipeline_value * 0.5 # Assume 50% close rate
            })

        # 2. Analyze Conversion
        if self.context.sales.conversion_rate < 0.1:
            recommendations.append({
                "area": "Sales Conversion",
                "severity": "Medium",
                "action": "Improve sales training or lead qualification. Conversion <10%.",
                "potential_impact": self.context.sales.pipeline_value * 0.05 # 5% improvement
            })

        # 3. Analyze Churn
        if self.context.sales.churn_risk_count > 10:
            recommendations.append({
                "area": "Customer Retention",
                "severity": "High",
                "action": f"Address {self.context.sales.churn_risk_count} at-risk customers.",
                "potential_impact": self.context.sales.churn_risk_count * 1000.0 # Placeholder LTV
            })

        return {
            "workflow": "Revenue Growth",
            "status": "Completed",
            "recommendations": recommendations,
            "total_potential_impact": sum(r["potential_impact"] for r in recommendations)
        }
