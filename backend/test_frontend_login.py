import asyncio
import httpx

async def test_frontend_login():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # Test JSON login (/auth/token)
        response = await client.post(
            "/api/v1/auth/token",
            json={"email": "product@gmail.com", "password": "Password123!"}
        )
        print("JSON Login (/auth/token) Response:", response.status_code)
        print(response.text)

if __name__ == "__main__":
    asyncio.run(test_frontend_login())
