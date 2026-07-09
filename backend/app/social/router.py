import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.tenants.dependencies import get_current_tenant_id
from app.social.models import SocialPost
from pydantic import BaseModel

router = APIRouter(prefix="/social", tags=["social"])

class PostResponse(BaseModel):
    id: uuid.UUID
    content: str
    platforms: list
    status: str
    
    class Config:
        from_attributes = True

@router.get("/posts", response_model=List[PostResponse])
async def list_posts(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SocialPost).where(SocialPost.tenant_id == tenant_id))
    return result.scalars().all()

class PostCreate(BaseModel):
    content: str
    platforms: list
    media_urls: list = []

@router.post("/posts", response_model=PostResponse)
async def create_post(
    data: PostCreate,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db)
):
    post = SocialPost(
        tenant_id=tenant_id,
        content=data.content,
        platforms=data.platforms,
        media_urls=data.media_urls
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post
