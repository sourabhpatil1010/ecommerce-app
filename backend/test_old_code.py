import asyncio
import logging
from sqlalchemy import select, func, text
from app.database import async_session_factory
from app.repositories.order import OrderRepository
from app.models.category import Category
from app.models.order import Order, OrderItem
from app.models.product import Product

logging.basicConfig(level=logging.INFO)

async def test_old_code():
    async with async_session_factory() as session:
        department = "ELECTRONICS"
        normalized_user_department = department.strip().upper().replace(" ", "_")
        
        stmt = select(Order)
        stmt = (
            stmt.join(Order.items)
            .join(OrderItem.product)
            .join(Product.category)
            .where(func.replace(func.upper(Category.department), " ", "_") == normalized_user_department)
            .distinct()
        )
        result = await session.execute(stmt)
        orders = list(result.scalars().unique().all())
        print("Orders with old code:", len(orders))
        
if __name__ == "__main__":
    asyncio.run(test_old_code())
