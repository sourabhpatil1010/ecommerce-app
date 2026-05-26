import asyncio
import httpx
import uuid

async def test_order():
    async with httpx.AsyncClient() as client:
        # Register a unique user
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        resp = await client.post(
            "http://localhost:8000/api/v1/auth/register",
            json={"email": email, "password": "password123", "full_name": "Test User"}
        )
        print("Register:", resp.status_code)
        
        # Login
        resp = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            data={"username": email, "password": "password123"}
        )
        print("Login:", resp.status_code)
        token = resp.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Add item to cart
        # First we need a product ID. Let's get products
        resp = await client.get("http://localhost:8000/api/v1/products/")
        products = resp.json().get("items", [])
        if not products:
            print("No products found")
            return
        product_id = products[0]["id"]
        
        # Add to cart
        resp = await client.post("http://localhost:8000/api/v1/cart/items", json={"product_id": product_id, "quantity": 1}, headers=headers)
        print("Add to cart:", resp.status_code)
        
        # Create order
        resp = await client.post(
            "http://localhost:8000/api/v1/orders/", 
            json={"shipping_address": "123 Test St"},
            headers=headers
        )
        print("Create order:", resp.status_code, resp.text)
        
        if resp.status_code == 201:
            order_id = resp.json().get("id")
            # Get order
            resp = await client.get(f"http://localhost:8000/api/v1/orders/{order_id}", headers=headers)
            print("Get order:", resp.status_code, resp.text)

if __name__ == "__main__":
    asyncio.run(test_order())
