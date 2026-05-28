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

    async def create_admin(self, user_in: "SuperAdminCreateAdmin") -> User:
        """Create an admin user directly (super admin only)."""
        from app.core.security import hash_password
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise ConflictException(detail="Email already registered")

        hashed = hash_password(user_in.password)
        new_user = User(
            email=user_in.email,
            hashed_password=hashed,
            full_name=user_in.full_name,
            is_active=True,
            is_superuser=True,
            role=user_in.role.value,
            department=user_in.department.value if user_in.department else None,
        )
        return await self.user_repo.create(new_user)

    async def list_admins(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Fetch all admin users."""
        from sqlalchemy import select
        stmt = (
            select(User)
            .where(User.is_superuser == True)
            .order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.user_repo.session.execute(stmt)
        return list(result.scalars().all())

    async def update_admin_role(self, user_id: uuid.UUID, role_in: "AdminUserUpdate") -> User:
        """Update an admin's role and department."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(detail="User not found")
        if not user.is_superuser:
            raise ConflictException(detail="User is not an admin")

        if role_in.role is not None:
            user.role = role_in.role.value
        if role_in.department is not None:
            user.department = role_in.department.value
            
        return await self.user_repo.update(user)

    async def update_status(self, user_id: uuid.UUID, is_active: bool) -> User:
        """Update user's active status (admin-only)."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(detail="User not found")
        user.is_active = is_active
        return await self.user_repo.update(user)

    async def delete_admin(self, user_id: uuid.UUID, requesting_user_id: uuid.UUID) -> None:
        """Permanently delete an admin user from the database."""
        import logging
        logger = logging.getLogger(__name__)
        from app.core.exceptions import ForbiddenException

        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(detail="Admin not found")
        if not user.is_superuser:
            raise ForbiddenException(detail="Target user is not an admin")
        # Prevent self-deletion — compare as strings to avoid UUID type mismatches
        if str(user.id) == str(requesting_user_id):
            raise ForbiddenException(detail="Cannot delete your own account")
        # Prevent deleting other SUPER_ADMINs for safety
        role_val = getattr(user.role, "value", user.role) if hasattr(user, "role") else ""
        if str(role_val).strip().upper() == "SUPER_ADMIN":
            raise ForbiddenException(detail="Cannot delete a Super Admin account")

        logger.warning(f"Permanently deleting admin: {user.email} (id={user.id}, role={user.role})")
        await self.user_repo.session.delete(user)
        await self.user_repo.session.flush()
        logger.warning(f"Admin {user.email} deleted and flushed.")
