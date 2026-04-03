from sqlalchemy.orm import Session
from backend.database.models import Account, AccountType, JournalEntry, GeneralLedger
from datetime import datetime
from typing import Dict, List

class PnLService:
    def __init__(self, db: Session):
        self.db = db

    def generate_pnl(self, start_date: datetime, end_date: datetime) -> Dict[str, float]:
        """
        Generates P&L statement for a given period.
        """
        # Get all relevant accounts
        accounts = self.db.query(Account).filter(
            Account.type.in_([AccountType.REVENUE, AccountType.EXPENSE])
        ).all()

        revenue = 0.0
        cogs = 0.0
        operating_expenses = 0.0

        for account in accounts:
            # Calculate balance for this period
            entries = self.db.query(JournalEntry).join(GeneralLedger).filter(
                JournalEntry.account_id == account.id,
                GeneralLedger.transaction_date >= start_date,
                GeneralLedger.transaction_date <= end_date
            ).all()

            debits = sum(e.amount for e in entries if e.type == "DEBIT")
            credits = sum(e.amount for e in entries if e.type == "CREDIT")

            balance = 0.0
            if account.type == AccountType.REVENUE:
                balance = credits - debits
                revenue += balance
            elif account.type == AccountType.EXPENSE:
                balance = debits - credits
                if "COGS" in account.name.upper():
                    cogs += balance
                else:
                    operating_expenses += balance

        gross_profit = revenue - cogs
        net_profit = gross_profit - operating_expenses

        return {
            "revenue": revenue,
            "cogs": cogs,
            "gross_profit": gross_profit,
            "operating_expenses": operating_expenses,
            "net_profit": net_profit
        }
