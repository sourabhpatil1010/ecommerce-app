"""Product repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """Data access for Product entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Product, session)

    # TODO: add domain-specific queries (e.g. get_by_slug, search)
