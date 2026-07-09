import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from decimal import Decimal

from app.payments.models import Invoice, Payment, PaymentLink
from app.payments.schemas import InvoiceCreate, InvoiceUpdate, PaymentCreate, PaymentLinkCreate

class PaymentService:
    @staticmethod
    async def create_invoice(db: AsyncSession, tenant_id: uuid.UUID, data: InvoiceCreate) -> Invoice:
        # Calculate totals
        subtotal = sum(item.amount for item in data.items)
        tax = subtotal * Decimal('0.10') # 10% tax mock
        total = subtotal + tax

        invoice = Invoice(
            tenant_id=tenant_id,
            contact_id=data.contact_id,
            items=[item.dict() for item in data.items],
            due_date=data.due_date,
            currency=data.currency,
            subtotal=subtotal,
            tax=tax,
            total=total
        )
        db.add(invoice)
        await db.commit()
        await db.refresh(invoice)
        return invoice

    @staticmethod
    async def get_invoices(db: AsyncSession, tenant_id: uuid.UUID) -> List[Invoice]:
        result = await db.execute(select(Invoice).where(Invoice.tenant_id == tenant_id))
        return result.scalars().all()

    @staticmethod
    async def get_invoice(db: AsyncSession, tenant_id: uuid.UUID, invoice_id: uuid.UUID) -> Optional[Invoice]:
        result = await db.execute(
            select(Invoice).where(Invoice.tenant_id == tenant_id, Invoice.id == invoice_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def process_payment(db: AsyncSession, tenant_id: uuid.UUID, data: PaymentCreate) -> Payment:
        invoice = await PaymentService.get_invoice(db, tenant_id, data.invoice_id)
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        payment = Payment(
            tenant_id=tenant_id,
            invoice_id=data.invoice_id,
            amount=data.amount,
            method=data.method,
            stripe_payment_id=data.stripe_payment_id
        )
        db.add(payment)
        
        # Update invoice status
        invoice.status = "paid"
        
        await db.commit()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def create_payment_link(db: AsyncSession, tenant_id: uuid.UUID, data: PaymentLinkCreate) -> PaymentLink:
        link_url = f"https://pay.omnibot.com/{uuid.uuid4()}"
        
        link = PaymentLink(
            tenant_id=tenant_id,
            invoice_id=data.invoice_id,
            amount=data.amount,
            url=link_url
        )
        db.add(link)
        await db.commit()
        await db.refresh(link)
        return link
