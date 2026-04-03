from sqlalchemy.orm import Session
from backend.database.models import Employee, Payroll, EmployeeStatus
from datetime import datetime, timedelta
from typing import List

class PayrollService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_salary(self, employee_id: int, period_start: datetime, period_end: datetime) -> float:
        """
        Calculates base salary for a period.
        Handles pro-rating if hired mid-period.
        """
        employee = self.db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise ValueError("Employee not found")

        if employee.status != EmployeeStatus.ACTIVE:
            return 0.0

        # Calculate days worked in period
        days_in_period = (period_end - period_start).days + 1
        
        # Adjust for hire date
        effective_start = max(period_start, employee.hired_date)
        days_worked = max(0, (period_end - effective_start).days + 1)

        daily_rate = employee.base_salary / 30 # Assuming 30-day month for simplicity
        salary = daily_rate * days_worked

        return salary

    def calculate_bonus(self, employee_id: int, performance_score: float) -> float:
        """
        Calculates bonus based on KPI score (0-100).
        """
        employee = self.db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise ValueError("Employee not found")

        # Simple bonus logic: 10% of base salary if score > 80
        if performance_score >= 80:
            return employee.base_salary * 0.10
        elif performance_score >= 60:
            return employee.base_salary * 0.05
        else:
            return 0.0

    def process_payroll(self, period_start: datetime, period_end: datetime) -> List[Payroll]:
        """
        Generates payroll records for all active employees.
        """
        employees = self.db.query(Employee).filter(Employee.status == EmployeeStatus.ACTIVE).all()
        payrolls = []

        for emp in employees:
            base_amount = self.calculate_salary(emp.id, period_start, period_end)
            # Fetch KPI score (mocked here, would call KPIService)
            kpi_score = 85.0 
            bonus_amount = self.calculate_bonus(emp.id, kpi_score)
            tax_amount = (base_amount + bonus_amount) * 0.20 # 20% tax
            net_amount = base_amount + bonus_amount - tax_amount

            payroll = Payroll(
                employee_id=emp.id,
                period_start=period_start,
                period_end=period_end,
                base_amount=base_amount,
                bonus_amount=bonus_amount,
                tax_amount=tax_amount,
                net_amount=net_amount,
                is_paid=False
            )
            self.db.add(payroll)
            payrolls.append(payroll)
        
        self.db.commit()
        return payrolls
