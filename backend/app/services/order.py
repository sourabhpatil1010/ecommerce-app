"""Order service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.order import OrderRepository


class OrderService:
    """Business logic for order operations."""

    def __init__(self, session: AsyncSession):
        self.order_repo = OrderRepository(session)

    # TODO: implement create_order, get_order, list_user_orders, update_status
