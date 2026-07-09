"""
Payments domain — SQLAlchemy models.
"""
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Invoice(Base):
    """
    An invoice sent to a Contact for payment collection.
    """
    __tablename__ = "invoices"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    contact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False)
    
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True) # draft, sent, paid, overdue, void
    
    items: Mapped[list] = mapped_column(JSONB, default=list) # Array of {description, quantity, unit_price, amount}
    
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    tax: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    
    due_date: Mapped[Optional[date]] = mapped_column(Date)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(1024))
    
    # Relationships
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="invoice", lazy="selectin")
    
    def __repr__(self) -> str:
        return f"<Invoice id={self.id} status={self.status} total={self.total}>"


class Payment(Base):
    """
    A record of a successful payment against an invoice.
    """
    __tablename__ = "payments"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    invoice_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False, index=True)
    
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    method: Mapped[str] = mapped_column(String(50)) # card, ach, cash, manual
    
    stripe_payment_id: Mapped[Optional[str]] = mapped_column(String(255))
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="payments")


class PaymentLink(Base):
    """
    A short URL to a hosted checkout (e.g., Stripe Payment Link).
    Used for Text2Pay flows.
    """
    __tablename__ = "payment_links"

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    invoice_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("invoices.id"), index=True)
    
    amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2))
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active") # active, expired, paid
