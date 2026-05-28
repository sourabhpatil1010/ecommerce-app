"""Order repository."""

import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """Data access for Order entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Order, session)

    async def get_by_user_id(self, user_id: uuid.UUID) -> list[Order]:
        """Fetch all orders for a user, sorted by date descending, preloading items and products."""
        stmt = (
            select(Order)
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .options(
                selectinload(Order.items).selectinload(OrderItem.product),
                selectinload(Order.status_history)
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_order_by_id_and_user_id(self, order_id: uuid.UUID, user_id: uuid.UUID) -> Order | None:
        """Fetch a single order by ID and user ID, preloading items and products."""
        stmt = (
            select(Order)
            .where(Order.id == order_id, Order.user_id == user_id)
            .options(
                selectinload(Order.items).selectinload(OrderItem.product),
                selectinload(Order.status_history)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_order_with_items(self, order_id: uuid.UUID) -> Order | None:
        """Fetch a single order by ID, preloading items."""
        stmt = (
            select(Order)
            .where(Order.id == order_id)
            .options(
                selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
                selectinload(Order.status_history)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_all_orders(
        self, skip: int = 0, limit: int = 100, department: str | None = None, statuses: list[str] | None = None
    ) -> list[Order]:
        """Fetch all orders (for admin) optionally filtered by department and statuses."""
        stmt = select(Order)
        if department:
            from app.models.product import Product
            from app.models.category import Category
            stmt = (
                stmt.join(OrderItem, Order.id == OrderItem.order_id)
                .join(Product, OrderItem.product_id == Product.id)
                .join(Category, Product.category_id == Category.id)
                .where(Category.department == department)
                .distinct()
            )
        if statuses:
            stmt = stmt.where(Order.status.in_(statuses))
            
        stmt = (
            stmt.order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .options(
                selectinload(Order.items).selectinload(OrderItem.product),
                selectinload(Order.status_history)
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
