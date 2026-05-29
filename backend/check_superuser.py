import asyncio
from sqlalchemy import select
from app.database import async_session_factory
from app.models.user import User

async def get_user_info():
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.email == "product@gmail.com"))
        user = result.scalar_one_or_none()
        print(f"Role: {user.role}, is_superuser: {user.is_superuser}")

if __name__ == "__main__":
    asyncio.run(get_user_info())
