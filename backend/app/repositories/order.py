"""Order repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    """Data access for Order entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Order, session)

    # TODO: add domain-specific queries (e.g. get_by_user_id, filter_by_status)
