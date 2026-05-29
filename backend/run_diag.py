import asyncio
from app.database import async_session_factory
from sqlalchemy import text

async def run_diagnostic():
    async with async_session_factory() as session:
        sql = """
        SELECT
        o.id,
        o.status,
        p.name,
        c.department
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        JOIN categories c ON c.id = p.category_id;
        """
        try:
            result = await session.execute(text(sql))
            rows = result.fetchall()
            print(f"Diagnostic returned {len(rows)} rows.")
            for row in rows:
                print(row)
        except Exception as e:
            print(f"Error executing SQL: {e}")

if __name__ == "__main__":
    asyncio.run(run_diagnostic())
