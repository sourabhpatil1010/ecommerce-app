import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.database import async_session_factory
from app.models.user import User
from app.models.order import Order
from sqlalchemy import select

def test_exception():
    client = TestClient(app)
    
    # We need to get a valid order id and user
    async def get_order_id():
        async with async_session_factory() as session:
            # get any order
            result = await session.execute(select(Order).limit(1))
            order = result.scalar()
            if not order: return None, None
            
            # get user
            user = await session.get(User, order.user_id)
            return order.id, user

    order_id, user = asyncio.run(get_order_id())
    if not order_id:
        print("No orders in db.")
        return

    # login
    resp = client.post("/api/v1/auth/login", data={"username": user.email, "password": "password123"})
    token = resp.json().get("access_token")
    if not token:
        print("Login failed", resp.json())
        # Try a different way or force auth dependency override
        return
        
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing GET /orders/id...")
    try:
        resp = client.get(f"/api/v1/orders/{order_id}", headers=headers)
        print("Status:", resp.status_code)
        print("Body:", resp.text)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_exception()
