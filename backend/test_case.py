import asyncio
from sqlalchemy import select, func
from app.database import async_session_factory
from app.models.user import User
from app.services.auth import AuthService

async def test_case_sensitivity():
    async with async_session_factory() as session:
        auth_service = AuthService(session)
        
        # Test Exact Match
        try:
            user = await auth_service.authenticate("product@gmail.com", "Password123!")
            print("[PASS] Exact match: product@gmail.com")
        except Exception as e:
            print("[FAIL] Exact match:", e)
            
        # Test Uppercase Match
        try:
            user = await auth_service.authenticate("Product@gmail.com", "Password123!")
            print("[PASS] Uppercase match: Product@gmail.com")
        except Exception as e:
            print("[FAIL] Uppercase match:", e)

        # Test with spaces
        try:
            user = await auth_service.authenticate("product@gmail.com ", "Password123!")
            print("[PASS] Space match: product@gmail.com ")
        except Exception as e:
            print("[FAIL] Space match:", e)

if __name__ == "__main__":
    asyncio.run(test_case_sensitivity())
