import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

async def main():
    engine = create_async_engine('postgresql+asyncpg://ecommerce_user:changeme@localhost:5432/ecommerce_db')
    async with engine.connect() as conn:
        print("=== USERS ===")
        res = await conn.execute(text("SELECT id, email, role, department FROM users WHERE role = 'PRODUCT_ADMIN'"))
        for row in res.fetchall(): print(row)
        
        print("\n=== PRODUCTS ===")
        res = await conn.execute(text("SELECT id, name, department FROM products LIMIT 5"))
        for row in res.fetchall(): print(row)
        
        print("\n=== CATEGORIES ===")
        try:
            res = await conn.execute(text("SELECT id, name, department FROM categories LIMIT 5"))
            for row in res.fetchall(): print(row)
        except Exception as e:
            print(f"Categories error: {e}")

asyncio.run(main())
