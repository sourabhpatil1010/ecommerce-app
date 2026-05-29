"""Order repository."""

import uuid
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.category import Category
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
            stmt = (
                stmt.join(Order.items)
                .join(OrderItem.product)
                .join(Product.category)
                .where(func.upper(Category.department) == func.upper(department))
                .distinct()
            )
            
        if statuses:
            # Flatten comma-separated strings if any (e.g., ["PLACED,CONFIRMED"] -> ["PLACED", "CONFIRMED"])
            flat_statuses = []
            for s in statuses:
                flat_statuses.extend([x.strip() for x in s.split(",") if x.strip()])
            stmt = stmt.where(Order.status.in_(flat_statuses))
            
        print("====== EXACT QUERY GENERATED IN REPO ======")
        from sqlalchemy.dialects import postgresql
        print(stmt.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True}))
        print("===========================================")
            
        stmt = (
            stmt.order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
            .options(
                selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.category),
                selectinload(Order.status_history)
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().unique().all())
