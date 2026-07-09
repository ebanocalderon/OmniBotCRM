import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.core.config import get_settings
from app.tenants.models import Tenant, User
from app.core.security import get_password_hash

async def seed_auth():
    settings = get_settings()
    engine = create_async_engine(str(settings.database_url), echo=False)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        # Check for tenant
        result = await session.execute(select(Tenant).limit(1))
        tenant = result.scalars().first()
        
        if not tenant:
            tenant = Tenant(
                name="OmniBot Inc",
                slug="omnibot",
                plan="enterprise"
            )
            session.add(tenant)
            await session.commit()
            
        # Create admin user
        result = await session.execute(
            select(User).where(User.email == "admin@omnibot.io")
        )
        user = result.scalars().first()
        
        if not user:
            user = User(
                tenant_id=tenant.id,
                email="admin@omnibot.io",
                name="Admin User",
                role="admin",
                hashed_password=get_password_hash("admin")
            )
            session.add(user)
            print("Created admin@omnibot.io user with password 'admin'")
        else:
            user.hashed_password = get_password_hash("admin")
            print("Updated admin@omnibot.io password to 'admin'")
            
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_auth())
