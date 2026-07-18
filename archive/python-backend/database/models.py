from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()

# --- Enums ---
class AccountType(str, enum.Enum):
    ASSET = "ASSET"
    LIABILITY = "LIABILITY"
    EQUITY = "EQUITY"
    REVENUE = "REVENUE"
    EXPENSE = "EXPENSE"

class TransactionType(str, enum.Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"

class EmployeeStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    TERMINATED = "TERMINATED"
    ON_LEAVE = "ON_LEAVE"

class DealStage(str, enum.Enum):
    LEAD = "LEAD"
    QUALIFIED = "QUALIFIED"
    PROPOSAL = "PROPOSAL"
    NEGOTIATION = "NEGOTIATION"
    CLOSED_WON = "CLOSED_WON"
    CLOSED_LOST = "CLOSED_LOST"

# --- Finance Models ---

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    type = Column(Enum(AccountType), index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    journal_entries = relationship("JournalEntry", back_populates="account")

class GeneralLedger(Base):
    __tablename__ = "general_ledger"

    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(DateTime, index=True)
    description = Column(String)
    reference_id = Column(String, nullable=True) # e.g., Invoice ID
    created_at = Column(DateTime, default=datetime.utcnow)

    entries = relationship("JournalEntry", back_populates="ledger")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    ledger_id = Column(Integer, ForeignKey("general_ledger.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))
    type = Column(Enum(TransactionType))
    amount = Column(Float) # Always positive
    description = Column(String, nullable=True)

    ledger = relationship("GeneralLedger", back_populates="entries")
    account = relationship("Account", back_populates="journal_entries")

# --- HR Models ---

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    position = Column(String)
    department = Column(String)
    base_salary = Column(Float)
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.ACTIVE)
    hired_date = Column(DateTime)
    
    payrolls = relationship("Payroll", back_populates="employee")
    kpis = relationship("EmployeeKPI", back_populates="employee")

class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    base_amount = Column(Float)
    bonus_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    net_amount = Column(Float)
    is_paid = Column(Boolean, default=False)
    payment_date = Column(DateTime, nullable=True)

    employee = relationship("Employee", back_populates="payrolls")

class EmployeeKPI(Base):
    __tablename__ = "employee_kpis"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    period = Column(String) # e.g., "2023-Q1"
    metric_name = Column(String)
    target_value = Column(Float)
    actual_value = Column(Float)
    weight = Column(Float, default=1.0) # Importance weight
    score = Column(Float) # Calculated score (0-100)

    employee = relationship("Employee", back_populates="kpis")

# --- CRM Models ---

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True)
    phone = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    lifetime_value = Column(Float, default=0.0)
    churn_risk_score = Column(Float, default=0.0) # 0-1
    created_at = Column(DateTime, default=datetime.utcnow)

    deals = relationship("Deal", back_populates="customer")

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    title = Column(String)
    amount = Column(Float)
    stage = Column(Enum(DealStage), default=DealStage.LEAD)
    probability = Column(Float) # 0-1
    expected_close_date = Column(DateTime)
    closed_date = Column(DateTime, nullable=True)
    
    customer = relationship("Customer", back_populates="deals")

# --- Analytics Models ---

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    sku = Column(String, unique=True)
    cost_price = Column(Float)
    selling_price = Column(Float)
    stock_quantity = Column(Integer)
    category = Column(String)
    
    sales = relationship("SaleItem", back_populates="product")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    unit_price = Column(Float)
    total_price = Column(Float)
    sale_date = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="sales")
