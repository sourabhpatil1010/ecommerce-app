import asyncio
import logging
from sqlalchemy import select
from app.database import async_session_factory
from app.models.user import User

async def dump_user():
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.email.ilike("product@gmail.com%")))
        users = result.scalars().all()
        for u in users:
            print(f"Email: '{u.email}' (len: {len(u.email)})")
            print(f"Hash: '{u.hashed_password}' (len: {len(u.hashed_password)})")
            print(f"Role: '{u.role}'")
            print(f"Active: {u.is_active}")

if __name__ == "__main__":
    asyncio.run(dump_user())
