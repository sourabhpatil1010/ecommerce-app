"""Dashboard service for aggregated stats."""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.order import Order
from app.models.product import Product

class DashboardService:
    """Service to handle dashboard analytics."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_stats(self) -> dict:
        """Get aggregate dashboard statistics."""
        # Total users
        users_result = await self.db.execute(select(func.count(User.id)))
        total_users = users_result.scalar_one() or 0

        # Total orders and revenue (only count paid or completed? For now let's just sum all for simplicity)
        # Assuming we just count all orders and sum total_amount
        orders_result = await self.db.execute(
            select(
                func.count(Order.id),
                func.sum(Order.total_amount)
            )
        )
        row = orders_result.first()
        total_orders = row[0] if row else 0
        total_revenue = float(row[1] if row and row[1] else 0)

        # Active products
        products_result = await self.db.execute(
            select(func.count(Product.id)).where(Product.is_active == True)
        )
        active_products = products_result.scalar_one() or 0

        return {
            "total_users": total_users,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "active_products": active_products
        }
