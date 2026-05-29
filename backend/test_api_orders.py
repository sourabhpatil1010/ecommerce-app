import asyncio
import httpx

async def test_api():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # Login
        response = await client.post(
            "/api/v1/auth/token",
            json={"email": "product@gmail.com", "password": "Password123!"}
        )
        token = response.json()["access_token"]
        print("Logged in!")

        headers = {"Authorization": f"Bearer {token}"}
        
        # Call /orders/all
        print("Fetching /api/v1/orders/all...")
        # Simulating frontend's API call
        res = await client.get("/api/v1/orders/all", headers=headers, params={"statuses": ["PLACED", "CONFIRMED"]})
        print(f"Status Code: {res.status_code}")
        orders = res.json()
        print(f"Found {len(orders)} orders")

        # Let's see what happens if I query without statuses
        res_all = await client.get("/api/v1/orders/all", headers=headers)
        print(f"Found {len(res_all.json())} total orders without status filter")

if __name__ == "__main__":
    asyncio.run(test_api())
