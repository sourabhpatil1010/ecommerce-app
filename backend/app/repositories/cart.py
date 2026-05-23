"""Cart repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cart import Cart
from app.repositories.base import BaseRepository


class CartRepository(BaseRepository[Cart]):
    """Data access for Cart entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Cart, session)

    # TODO: add domain-specific queries (e.g. get_by_user_id)
