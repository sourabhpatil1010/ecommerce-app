import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import settings
from app.models.base import Base

async def drop_all():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        # Drop alembic_version table manually just in case
        try:
            await conn.execute(org_sqlalchemy.text("DROP TABLE IF EXISTS alembic_version"))
        except Exception:
            pass
    print("All tables dropped.")

if __name__ == "__main__":
    import sqlalchemy as org_sqlalchemy
    asyncio.run(drop_all())
