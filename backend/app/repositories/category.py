"""Category repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    """Data access for Category entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Category, session)

    # TODO: add domain-specific queries (e.g. get_by_slug)
