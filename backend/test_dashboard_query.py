import asyncio
import logging
from app.database import async_session_factory
from app.repositories.order import OrderRepository

logging.basicConfig(level=logging.INFO)

async def test_query():
    async with async_session_factory() as session:
        repo = OrderRepository(session)
        try:
            orders = await repo.get_all_orders(department="Electronics", statuses=["PLACED", "CONFIRMED"])
            print("Number of orders found:", len(orders))
            for o in orders:
                print("Order ID:", o.id, "Status:", o.status)
        except Exception as e:
            print("EXCEPTION:", str(e))

if __name__ == "__main__":
    asyncio.run(test_query())
