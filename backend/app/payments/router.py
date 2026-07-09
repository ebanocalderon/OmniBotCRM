import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.tenants.dependencies import get_current_tenant_id
from app.payments.schemas import (
    InvoiceCreate, InvoiceResponse, 
    PaymentCreate, PaymentResponse,
    PaymentLinkCreate, PaymentLinkResponse
)
from app.payments.service import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(
    data: InvoiceCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new invoice for a contact"""
    return await PaymentService.create_invoice(db, tenant_id, data)

@router.get("/invoices", response_model=List[InvoiceResponse])
async def list_invoices(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    """List all invoices for the current tenant"""
    return await PaymentService.get_invoices(db, tenant_id)

@router.post("/invoices/{invoice_id}/send")
async def send_invoice(
    invoice_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    """Send an invoice via email (mock)"""
    invoice = await PaymentService.get_invoice(db, tenant_id, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = "sent"
    await db.commit()
    return {"message": "Invoice sent successfully", "invoice_id": invoice_id}

@router.post("/process", response_model=PaymentResponse)
async def process_payment(
    data: PaymentCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    """Process a payment against an invoice"""
    return await PaymentService.process_payment(db, tenant_id, data)

@router.post("/links", response_model=PaymentLinkResponse)
async def create_payment_link(
    data: PaymentLinkCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate a Text2Pay link"""
    return await PaymentService.create_payment_link(db, tenant_id, data)
