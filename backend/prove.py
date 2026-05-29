import asyncio
import logging
from sqlalchemy import select, func, text
from app.database import async_session_factory
from app.repositories.order import OrderRepository
from app.models.category import Category
from app.models.user import User

logging.basicConfig(level=logging.INFO)

async def prove_case_mismatch():
    async with async_session_factory() as session:
        # Get category departments
        cats = await session.execute(select(Category.name, Category.department))
        print("--- Category Departments in DB ---")
        for c in cats:
            print(f"Category: {c[0]}, Dept: '{c[1]}'")
            
        # Get user departments
        users = await session.execute(select(User.email, User.department).where(User.role == 'PRODUCT_ADMIN'))
        print("\n--- User Departments in DB ---")
        for u in users:
            print(f"Email: {u[0]}, Dept: '{u[1]}'")
            
        # Test current query (strict equality)
        repo = OrderRepository(session)
        print("\n--- Testing query with department='ELECTRONICS' (Strict Equality) ---")
        orders_strict = await repo.get_all_orders(department="ELECTRONICS", statuses=["PLACED", "CONFIRMED"])
        print(f"Found orders: {len(orders_strict)}")
        
        # Test case insensitive query
        print("\n--- Testing query with case insensitive match (Electronics) ---")
        # I'll just pass Title case to the existing function to see if it works
        orders_case_insensitive = await repo.get_all_orders(department="Electronics", statuses=["PLACED", "CONFIRMED"])
        print(f"Found orders: {len(orders_case_insensitive)}")

if __name__ == "__main__":
    asyncio.run(prove_case_mismatch())
