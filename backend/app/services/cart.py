"""Cart service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.cart import CartRepository


class CartService:
    """Business logic for cart operations."""

    def __init__(self, session: AsyncSession):
        self.cart_repo = CartRepository(session)

    # TODO: implement get_cart, add_item, update_item, remove_item, clear_cart
