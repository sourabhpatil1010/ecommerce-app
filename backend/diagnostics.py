import asyncio
import logging
from sqlalchemy import select, text
from app.database import async_session_factory
from app.repositories.order import OrderRepository
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.category import Category

logging.basicConfig(level=logging.INFO)

async def run_diagnostics():
    async with async_session_factory() as session:
        # 1. Count orders
        orders_count = await session.execute(text("SELECT COUNT(*) FROM orders;"))
        print(f"Total orders: {orders_count.scalar()}")

        # 2. Count order_items
        order_items_count = await session.execute(text("SELECT COUNT(*) FROM order_items;"))
        print(f"Total order_items: {order_items_count.scalar()}")

        # 3. Check linkage
        linkage_query = text("""
            SELECT o.id, o.status, oi.product_id, p.category_id, c.department
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id = oi.product_id
            LEFT JOIN categories c ON c.id = p.category_id;
        """)
        links = await session.execute(linkage_query)
        print("\nOrder Linkage (Order -> Item -> Product -> Category Dept):")
        for row in links:
            print(f"Order: {row[0]}, Status: {row[1]}, Product: {row[2]}, Category: {row[3]}, Dept: {row[4]}")

        # 4. Test exact query
        print("\nRunning OrderRepository.get_all_orders for department='Electronics', statuses=['PLACED', 'CONFIRMED']...")
        repo = OrderRepository(session)
        orders = await repo.get_all_orders(department="Electronics", statuses=["PLACED", "CONFIRMED"])
        print(f"Orders found by repo: {len(orders)}")
        
        # 5. Check user departments
        users = await session.execute(text("SELECT id, email, role, department FROM users WHERE role = 'PRODUCT_ADMIN'"))
        print("\nProduct Admins:")
        for u in users:
            print(f"Email: {u[1]}, Role: {u[2]}, Dept: {u[3]}")

if __name__ == "__main__":
    asyncio.run(run_diagnostics())
