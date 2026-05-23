"""Payment repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment
from app.repositories.base import BaseRepository


class PaymentRepository(BaseRepository[Payment]):
    """Data access for Payment entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Payment, session)

    # TODO: add domain-specific queries (e.g. get_by_order_id)
