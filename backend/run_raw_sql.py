import asyncio
from app.database import async_session_factory
from sqlalchemy import text

async def run_raw_sql():
    async with async_session_factory() as session:
        sql = """
        SELECT DISTINCT orders.user_id, orders.status, orders.total_amount, orders.shipping_address, orders.tracking_id, orders.courier, orders.id, orders.created_at, orders.updated_at 
        FROM orders JOIN order_items ON orders.id = order_items.order_id JOIN products ON products.id = order_items.product_id JOIN categories ON categories.id = products.category_id 
        WHERE upper(categories.department) = upper('ELECTRONICS') AND orders.status IN ('PLACED', 'CONFIRMED') ORDER BY orders.created_at DESC 
        LIMIT 100 OFFSET 0
        """
        try:
            result = await session.execute(text(sql))
            rows = result.fetchall()
            print(f"Returned {len(rows)} rows.")
        except Exception as e:
            print(f"Error executing SQL: {e}")

if __name__ == "__main__":
    asyncio.run(run_raw_sql())
