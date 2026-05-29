import asyncio
import logging
from app.database import async_session_factory
from app.repositories.order import OrderRepository

logging.basicConfig()
logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)

async def check_admin_orders():
    async with async_session_factory() as session:
        order_repo = OrderRepository(session)
        print("--- Testing get_all_orders for ELECTRONICS ---")
        orders = await order_repo.get_all_orders(department="ELECTRONICS", statuses=["PLACED"])
        print(f"Number of orders found for ELECTRONICS: {len(orders)}")

        print("\n--- Testing get_all_orders with NO department ---")
        orders_all = await order_repo.get_all_orders(statuses=["PLACED"])
        print(f"Number of orders found for NO department: {len(orders_all)}")

if __name__ == "__main__":
    asyncio.run(check_admin_orders())
