import asyncio
import httpx

async def test_api():
    async with httpx.AsyncClient() as client:
        # 1. Login
        resp = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            data={"username": "test@example.com", "password": "password123"}
        )
        if resp.status_code != 200:
            print("Login failed:", resp.text)
            # Try to register
            resp = await client.post(
                "http://localhost:8000/api/v1/auth/register",
                json={"email": "test@example.com", "password": "password123", "full_name": "Test User"}
            )
            print("Register:", resp.status_code, resp.text)
            resp = await client.post(
                "http://localhost:8000/api/v1/auth/login",
                data={"username": "test@example.com", "password": "password123"}
            )
            
        token = resp.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Get orders
        resp = await client.get("http://localhost:8000/api/v1/orders/", headers=headers)
        print("GET /orders status:", resp.status_code)
        print("GET /orders response:", resp.text)

if __name__ == "__main__":
    asyncio.run(test_api())
