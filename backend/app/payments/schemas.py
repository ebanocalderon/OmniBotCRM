from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

class InvoiceItem(BaseModel):
    description: str
    quantity: int
    unit_price: Decimal
    amount: Decimal

class InvoiceCreate(BaseModel):
    contact_id: UUID
    items: List[InvoiceItem]
    due_date: Optional[date] = None
    currency: str = "USD"

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    items: Optional[List[InvoiceItem]] = None
    due_date: Optional[date] = None

class InvoiceResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    contact_id: UUID
    status: str
    items: List[InvoiceItem]
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    currency: str
    due_date: Optional[date]
    pdf_url: Optional[str]

    class Config:
        orm_mode = True
        from_attributes = True

class PaymentCreate(BaseModel):
    invoice_id: UUID
    amount: Decimal
    method: str
    stripe_payment_id: Optional[str] = None

class PaymentResponse(BaseModel):
    id: UUID
    invoice_id: UUID
    amount: Decimal
    method: str
    paid_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True

class PaymentLinkCreate(BaseModel):
    invoice_id: Optional[UUID] = None
    amount: Optional[Decimal] = None

class PaymentLinkResponse(BaseModel):
    id: UUID
    url: str
    status: str
    
    class Config:
        orm_mode = True
        from_attributes = True
