"""Payment service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.payment import PaymentRepository


class PaymentService:
    """Business logic for payment processing."""

    def __init__(self, session: AsyncSession):
        self.payment_repo = PaymentRepository(session)

    # TODO: implement create_payment, process_payment, get_payment_status
