"""User service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import UserRepository


class UserService:
    """Business logic for user operations."""

    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    # TODO: implement get_user, update_user, list_users, deactivate_user
