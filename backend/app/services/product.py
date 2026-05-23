"""Product service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.product import ProductRepository


class ProductService:
    """Business logic for product operations."""

    def __init__(self, session: AsyncSession):
        self.product_repo = ProductRepository(session)

    # TODO: implement create, get, list, update, delete, search
