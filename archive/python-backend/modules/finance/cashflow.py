from sqlalchemy.orm import Session
from backend.database.models import Account, AccountType, JournalEntry, GeneralLedger
from datetime import datetime
from typing import Dict

class CashflowService:
    def __init__(self, db: Session):
        self.db = db

    def generate_cashflow(self, start_date: datetime, end_date: datetime) -> Dict[str, float]:
        """
        Generates Cashflow statement for a given period.
        Separates Operational, Investing, and Financing flows.
        """
        # Get all cash accounts (e.g., Bank, Cash)
        cash_accounts = self.db.query(Account).filter(
            Account.type == AccountType.ASSET,
            Account.name.like("%Cash%") # Simplified logic for cash accounts
        ).all()

        operational_flow = 0.0
        investing_flow = 0.0
        financing_flow = 0.0

        for account in cash_accounts:
            entries = self.db.query(JournalEntry).join(GeneralLedger).filter(
                JournalEntry.account_id == account.id,
                GeneralLedger.transaction_date >= start_date,
                GeneralLedger.transaction_date <= end_date
            ).all()

            for entry in entries:
                # Determine flow type based on the *other* side of the transaction
                # This is a simplified heuristic. In a real system, you'd check the contra-account.
                # For now, we assume:
                # - Revenue/Expense -> Operational
                # - Asset (Fixed) -> Investing
                # - Liability/Equity -> Financing
                
                # Find the contra-entry in the same ledger transaction
                contra_entries = self.db.query(JournalEntry).filter(
                    JournalEntry.ledger_id == entry.ledger_id,
                    JournalEntry.id != entry.id
                ).all()

                if not contra_entries:
                    continue

                contra_account = contra_entries[0].account # Simplified: take the first contra account

                amount = entry.amount if entry.type == "DEBIT" else -entry.amount

                if contra_account.type in [AccountType.REVENUE, AccountType.EXPENSE]:
                    operational_flow += amount
                elif contra_account.type == AccountType.ASSET:
                    investing_flow += amount
                elif contra_account.type in [AccountType.LIABILITY, AccountType.EQUITY]:
                    financing_flow += amount

        net_cash_change = operational_flow + investing_flow + financing_flow

        return {
            "operational_flow": operational_flow,
            "investing_flow": investing_flow,
            "financing_flow": financing_flow,
            "net_cash_change": net_cash_change
        }
