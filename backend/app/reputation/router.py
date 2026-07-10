import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.tenants.dependencies import get_current_tenant_id
from app.reputation.models import Review, ReviewRequest
from pydantic import BaseModel

router = APIRouter(prefix="/reputation", tags=["reputation"])

class ReviewResponse(BaseModel):
    id: uuid.UUID
    platform: str
    rating: float
    content: str | None
    author_name: str
    reply_content: str | None
    
    class Config:
        from_attributes = True

@router.get("/reviews", response_model=List[ReviewResponse])
async def list_reviews(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Review).where(Review.tenant_id == tenant_id).order_by(Review.posted_at.desc()))
    return result.scalars().all()

class ReplyRequest(BaseModel):
    content: str

@router.post("/reviews/{review_id}/reply")
async def reply_to_review(
    review_id: uuid.UUID,
    data: ReplyRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Review).where(Review.id == review_id, Review.tenant_id == tenant_id))
    review = result.scalar_one_or_none()
    
    if review:
        review.reply_content = data.content
        import datetime
        review.replied_at = datetime.datetime.utcnow()
        await db.commit()
        
    return {"status": "success"}
