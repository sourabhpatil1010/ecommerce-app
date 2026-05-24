"""Cart repository."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cart import Cart
from app.repositories.base import BaseRepository


class CartRepository(BaseRepository[Cart]):
    """Data access for Cart entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Cart, session)

    # Domain-specific queries
    async def get_by_user_id(self, user_id: uuid.UUID) -> Cart | None:
        """Fetch a user's cart, eagerly loading items and product details."""
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.models.cart import CartItem

        stmt = (
            select(Cart)
            .where(Cart.user_id == user_id)
            .options(
                selectinload(Cart.items).selectinload(CartItem.product)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

