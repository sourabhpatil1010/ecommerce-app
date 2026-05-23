"""Authentication service."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import UserRepository


class AuthService:
    """Handles authentication and registration logic."""

    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    # TODO: implement register, login, refresh_token, get_current_user
