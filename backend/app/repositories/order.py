"""Order repository."""

import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem
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
                selectinload(Order.items).selectinload(OrderItem.product)
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
                selectinload(Order.items).selectinload(OrderItem.product)
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
                selectinload(Order.items).selectinload(OrderItem.product)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_all_orders(self, skip: int = 0, limit: int = 100) -> list[Order]:
        """Fetch all orders (for admin)."""
        stmt = (
            select(Order)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .options(
                selectinload(Order.items).selectinload(OrderItem.product)
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
