"""Payment repository."""

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment
from app.repositories.base import BaseRepository


class PaymentRepository(BaseRepository[Payment]):
    """Data access for Payment entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Payment, session)

    async def get_by_order_id(self, order_id: uuid.UUID) -> Payment | None:
        """Fetch a payment record by order ID."""
        stmt = select(Payment).where(Payment.order_id == order_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_provider_payment_id(self, provider_payment_id: str) -> Payment | None:
        """Fetch a payment record by Stripe PaymentIntent ID."""
        stmt = select(Payment).where(Payment.provider_payment_id == provider_payment_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()
