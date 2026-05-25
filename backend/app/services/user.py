"""User service."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserUpdate
from app.repositories.user import UserRepository
from app.core.exceptions import NotFoundException, ConflictException


class UserService:
    """Business logic for user operations."""

    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def get_user_by_id(self, user_id: uuid.UUID) -> User | None:
        """Retrieve user by UUID."""
        return await self.user_repo.get_by_id(user_id)

    async def update_user(self, user_id: uuid.UUID, user_in: UserUpdate) -> User:
        """Update user profile, checking email conflicts if updated."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(detail="User not found")

        if user_in.email is not None and user_in.email != user.email:
            existing = await self.user_repo.get_by_email(user_in.email)
            if existing:
                raise ConflictException(detail="Email already registered")
            user.email = user_in.email

        if user_in.full_name is not None:
            user.full_name = user_in.full_name

        return await self.user_repo.update(user)

    async def list_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Fetch all users (admin-only function)."""
        return await self.user_repo.get_all(skip=skip, limit=limit)

    async def update_status(self, user_id: uuid.UUID, is_active: bool) -> User:
        """Update user's active status (admin-only)."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(detail="User not found")
        user.is_active = is_active
        return await self.user_repo.update(user)
