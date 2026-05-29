import asyncio
import httpx
from sqlalchemy import select, update
from app.database import async_session_factory
from app.models.user import User
from app.core.security import hash_password

async def test_endpoint():
    async with async_session_factory() as session:
        # Reset password to Password123!
        hashed = hash_password("Password123!")
        await session.execute(update(User).where(User.email == "product@gmail.com").values(hashed_password=hashed))
        await session.commit()
    
    # Let's login to get token
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # Login
        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "product@gmail.com", "password": "Password123!"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code != 200:
            print("Login failed:", response.text)
            return
            
        token = response.json()["access_token"]
        
        # Hit /all endpoint
        headers = {"Authorization": f"Bearer {token}"}
        res = await client.get("/api/v1/orders/all?statuses=PLACED&statuses=CONFIRMED", headers=headers)
        print("Response status:", res.status_code)
        print("Response JSON:", res.json())

if __name__ == "__main__":
    asyncio.run(test_endpoint())
