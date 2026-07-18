from sqlalchemy.orm import Session
from backend.database.models import EmployeeKPI, Employee
from datetime import datetime
from typing import List, Dict

class KPIService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_kpi_score(self, employee_id: int, period: str) -> float:
        """
        Calculates weighted average KPI score for an employee in a period.
        """
        kpis = self.db.query(EmployeeKPI).filter(
            EmployeeKPI.employee_id == employee_id,
            EmployeeKPI.period == period
        ).all()

        if not kpis:
            return 0.0

        total_weight = sum(kpi.weight for kpi in kpis)
        if total_weight == 0:
            return 0.0

        weighted_sum = sum(kpi.score * kpi.weight for kpi in kpis)
        return weighted_sum / total_weight

    def calculate_productivity(self, employee_id: int, tasks_completed: int, hours_worked: float) -> float:
        """
        Calculates productivity score based on tasks per hour.
        """
        if hours_worked == 0:
            return 0.0
        return tasks_completed / hours_worked

    def normalize_score(self, raw_score: float, min_val: float, max_val: float) -> float:
        """
        Normalizes a raw score to 0-100 scale.
        """
        if max_val == min_val:
            return 0.0
        return ((raw_score - min_val) / (max_val - min_val)) * 100
