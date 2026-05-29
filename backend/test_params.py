import asyncio
import httpx

async def test_api_comma():
    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # Login
        response = await client.post(
            "/api/v1/auth/token",
            json={"email": "product@gmail.com", "password": "Password123!"}
        )
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 1: ?statuses=PLACED&statuses=CONFIRMED (what Axios indexes: null sends)
        res1 = await client.get("/api/v1/orders/all?statuses=PLACED&statuses=CONFIRMED", headers=headers)
        print(f"res1 (multiple params): {len(res1.json())} orders")

        # Test 2: ?statuses=PLACED,CONFIRMED (what some defaults might send)
        res2 = await client.get("/api/v1/orders/all?statuses=PLACED,CONFIRMED", headers=headers)
        print(f"res2 (comma separated): {len(res2.json())} orders")

        # Test 3: ?statuses[]=PLACED&statuses[]=CONFIRMED (what Axios defaults send without indexes: null)
        res3 = await client.get("/api/v1/orders/all?statuses[]=PLACED&statuses[]=CONFIRMED", headers=headers)
        print(f"res3 (brackets): {len(res3.json())} orders")

if __name__ == "__main__":
    asyncio.run(test_api_comma())
