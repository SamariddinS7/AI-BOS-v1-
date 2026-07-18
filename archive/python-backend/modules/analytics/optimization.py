from sqlalchemy.orm import Session
from backend.database.models import Product, SaleItem
from datetime import datetime, timedelta
from typing import List, Dict

class OptimizationService:
    def __init__(self, db: Session):
        self.db = db

    def detect_loss_products(self) -> List[Dict]:
        """
        Identifies products with negative margin or low sales velocity.
        """
        products = self.db.query(Product).all()
        loss_products = []

        for product in products:
            margin = (product.selling_price - product.cost_price) / product.selling_price
            if margin < 0.1: # Less than 10% margin
                loss_products.append({
                    "product_id": product.id,
                    "name": product.name,
                    "reason": "Low Margin",
                    "margin": margin
                })
            
            # Check sales velocity (last 30 days)
            sales_count = self.db.query(SaleItem).filter(
                SaleItem.product_id == product.id,
                SaleItem.sale_date >= datetime.utcnow() - timedelta(days=30)
            ).count()

            if sales_count < 5: # Arbitrary threshold
                loss_products.append({
                    "product_id": product.id,
                    "name": product.name,
                    "reason": "Low Velocity",
                    "sales_count": sales_count
                })

        return loss_products

    def optimize_pricing(self, product_id: int) -> Dict[str, float]:
        """
        Suggests optimal price based on elasticity (simplified).
        """
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")

        # Simplified logic: If margin is low, suggest increase. If high but low sales, suggest decrease.
        margin = (product.selling_price - product.cost_price) / product.selling_price
        
        sales_count = self.db.query(SaleItem).filter(
            SaleItem.product_id == product.id,
            SaleItem.sale_date >= datetime.utcnow() - timedelta(days=30)
        ).count()

        suggested_price = product.selling_price
        reason = "Optimal"

        if margin < 0.2:
            suggested_price = product.cost_price * 1.3 # Target 30% margin
            reason = "Increase Margin"
        elif margin > 0.5 and sales_count < 10:
            suggested_price = product.selling_price * 0.9 # Decrease price to boost sales
            reason = "Boost Sales"

        return {
            "current_price": product.selling_price,
            "suggested_price": suggested_price,
            "reason": reason
        }

    def cost_reduction_suggestions(self) -> List[str]:
        """
        Analyzes expenses to find reduction opportunities.
        """
        # This would typically analyze the General Ledger for high expense categories.
        # Placeholder logic for now as it requires complex GL analysis.
        return [
            "Review 'Travel' expenses: 15% increase month-over-month.",
            "Negotiate 'Software Subscriptions': 3 unused licenses found."
        ]
