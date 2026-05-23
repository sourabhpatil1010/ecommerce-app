"""User repository."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Data access for User entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    # TODO: add domain-specific queries (e.g. get_by_email)
