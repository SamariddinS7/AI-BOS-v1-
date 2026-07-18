from sqlalchemy.orm import Session
from backend.database.models import Account, AccountType, JournalEntry, GeneralLedger
from datetime import datetime
from typing import Dict

class TaxService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_tax(self, income: float, tax_rate: float = 0.21) -> float:
        """
        Calculates corporate tax based on net income.
        """
        return income * tax_rate

    def calculate_depreciation(self, asset_value: float, useful_life_years: int, method: str = "straight_line") -> float:
        """
        Calculates annual depreciation.
        """
        if method == "straight_line":
            return asset_value / useful_life_years
        else:
            raise NotImplementedError("Only straight-line depreciation is supported.")
