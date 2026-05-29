import asyncio
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.category import Category
from app.database import engine

def dump_query():
    department = "ELECTRONICS"
    statuses = ["PLACED", "CONFIRMED"]
    
    stmt = select(Order)
    if department:
        stmt = (
            stmt.join(Order.items)
            .join(OrderItem.product)
            .join(Product.category)
            .where(func.upper(Category.department) == func.upper(department))
            .distinct()
        )
        
    if statuses:
        stmt = stmt.where(Order.status.in_(statuses))
        
    stmt = (
        stmt.order_by(Order.created_at.desc())
        .offset(0)
        .limit(100)
    )
    
    print(stmt.compile(compile_kwargs={"literal_binds": True}, dialect=engine.dialect))

if __name__ == "__main__":
    dump_query()
