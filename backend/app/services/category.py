"""Category service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.category import CategoryRepository


class CategoryService:
    """Business logic for category operations."""

    def __init__(self, session: AsyncSession):
        self.category_repo = CategoryRepository(session)

    # TODO: implement create, get, list, update, delete
