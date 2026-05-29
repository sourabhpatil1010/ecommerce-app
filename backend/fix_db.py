import asyncio
from app.database import async_session_factory
from sqlalchemy import select, update
from app.models.category import Category

async def fix_db():
    async with async_session_factory() as session:
        await session.execute(
            update(Category).where(Category.name == "Electronics").values(department="Electronics")
        )
        await session.commit()
        print("Updated Electronics department")

if __name__ == "__main__":
    asyncio.run(fix_db())
