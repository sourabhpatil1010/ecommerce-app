import asyncio
from app.database import async_session_factory
from app.services.order import OrderService
from sqlalchemy import select
from app.models.user import User

async def run():
    async with async_session_factory() as session:
        u = (await session.execute(select(User).where(User.email=='admin@example.com'))).scalar_one()
        srv = OrderService(session)
        orders = await srv.list_all_orders(department=u.department, statuses=['PLACED'])
        print(f"Admin dept: {u.department}")
        print(f"Orders count: {len(orders)}")
        for o in orders:
            print(f"Order: {o.id}")
            for i in o.items:
                print(f"  Item product_id: {i.product_id}")

if __name__ == '__main__':
    asyncio.run(run())
