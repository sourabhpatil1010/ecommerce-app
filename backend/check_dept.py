import asyncio
from app.database import async_session_factory
from app.repositories.user import UserRepository

async def check_dept():
    async with async_session_factory() as session:
        repo = UserRepository(session)
        user = await repo.get_by_email("product@gmail.com")
        print(f"Department: '{user.department}'")

if __name__ == "__main__":
    asyncio.run(check_dept())
