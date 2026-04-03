from sqlalchemy.orm import Session
from backend.database.models import GeneralLedger, JournalEntry, Account, AccountType, TransactionType
from datetime import datetime
from typing import List, Optional

class LedgerService:
    def __init__(self, db: Session):
        self.db = db

    def create_journal_entry(self, description: str, entries: List[dict], reference_id: Optional[str] = None) -> GeneralLedger:
        """
        Creates a balanced journal entry.
        entries format: [{"account_id": 1, "type": "DEBIT", "amount": 100.0}, ...]
        """
        # Validate balance
        total_debit = sum(e["amount"] for e in entries if e["type"] == TransactionType.DEBIT)
        total_credit = sum(e["amount"] for e in entries if e["type"] == TransactionType.CREDIT)

        if abs(total_debit - total_credit) > 0.01: # Floating point tolerance
            raise ValueError(f"Journal Entry is not balanced: Debit {total_debit} != Credit {total_credit}")

        ledger = GeneralLedger(
            description=description,
            transaction_date=datetime.utcnow(),
            reference_id=reference_id
        )
        self.db.add(ledger)
        self.db.flush() # Get ID

        for entry in entries:
            je = JournalEntry(
                ledger_id=ledger.id,
                account_id=entry["account_id"],
                type=entry["type"],
                amount=entry["amount"],
                description=entry.get("description")
            )
            self.db.add(je)
        
        self.db.commit()
        self.db.refresh(ledger)
        return ledger

    def get_account_balance(self, account_id: int, date: datetime = None) -> float:
        """
        Calculates the balance of an account up to a specific date.
        Asset/Expense: Debit - Credit
        Liability/Equity/Revenue: Credit - Debit
        """
        query = self.db.query(JournalEntry).filter(JournalEntry.account_id == account_id)
        if date:
            query = query.join(GeneralLedger).filter(GeneralLedger.transaction_date <= date)
        
        entries = query.all()
        
        account = self.db.query(Account).filter(Account.id == account_id).first()
        if not account:
            raise ValueError("Account not found")

        debits = sum(e.amount for e in entries if e.type == TransactionType.DEBIT)
        credits = sum(e.amount for e in entries if e.type == TransactionType.CREDIT)

        if account.type in [AccountType.ASSET, AccountType.EXPENSE]:
            return debits - credits
        else:
            return credits - debits
