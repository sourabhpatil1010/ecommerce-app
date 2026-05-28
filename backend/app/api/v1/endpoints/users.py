"""User endpoints."""

import uuid
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate, UserStatusUpdate, SuperAdminCreateAdmin, AdminUserUpdate
from app.services.user import UserService
from app.api.v1.deps import get_current_active_user, get_current_superuser, get_current_user

router = APIRouter()


@router.get("/me", response_model=UserRead)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get the authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserRead)
async def update_current_user_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update the authenticated user's profile."""
    user_service = UserService(db)
    return await user_service.update_user(current_user.id, user_in)


@router.get("/", response_model=list[UserRead])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all users (admin only)."""
    user_service = UserService(db)
    return await user_service.list_users(skip=skip, limit=limit)


@router.post("/admins", response_model=UserRead, status_code=201)
async def create_admin(
    user_in: SuperAdminCreateAdmin,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new admin user (super admin only)."""
    user_service = UserService(db)
    return await user_service.create_admin(user_in)


@router.get("/admins", response_model=list[UserRead])
async def list_admins(
    skip: int = 0,
    limit: int = 100,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all admin users (super admin only)."""
    user_service = UserService(db)
    return await user_service.list_admins(skip=skip, limit=limit)


@router.put("/admins/{user_id}", response_model=UserRead)
async def update_admin(
    user_id: uuid.UUID,
    role_in: AdminUserUpdate,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update an admin's role and department (super admin only)."""
    user_service = UserService(db)
    return await user_service.update_admin_role(user_id, role_in)


@router.patch("/admins/{user_id}/status", response_model=UserRead)
async def update_admin_status(
    user_id: uuid.UUID,
    status_in: UserStatusUpdate,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update admin status (super admin only)."""
    user_service = UserService(db)
    return await user_service.update_status(user_id, status_in.is_active)


@router.get("/admins/{user_id}", response_model=UserRead)
async def get_admin(
    user_id: uuid.UUID,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get an admin by ID (super admin only)."""
    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)
    if not user or not user.is_superuser:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(detail="Admin not found")
    return user


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: uuid.UUID,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get a user by ID (admin only)."""
    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)
    if not user:
        from app.core.exceptions import NotFoundException
        raise NotFoundException(detail="User not found")
    return user


@router.patch("/{user_id}/status", response_model=UserRead)
async def update_user_status(
    user_id: uuid.UUID,
    status_in: UserStatusUpdate,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update user status (admin only)."""
    user_service = UserService(db)
    return await user_service.update_status(user_id, status_in.is_active)


@router.delete("/admins/{user_id}", status_code=204)
async def delete_admin(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Permanently delete an admin user (super admin only)."""
    import logging
    logger = logging.getLogger(__name__)
    from app.core.exceptions import ForbiddenException
    
    # Manually verify superuser/SUPER_ADMIN (same session as the delete operation)
    role_val = getattr(current_user.role, "value", current_user.role) if hasattr(current_user, "role") else ""
    role_str = str(role_val).strip().upper()
    is_super = current_user.is_superuser or role_str == "SUPER_ADMIN"
    if not is_super:
        raise ForbiddenException(detail="The user does not have enough privileges")
    
    logger.warning(f"Delete admin request: target={user_id} by={current_user.email}")
    user_service = UserService(db)
    await user_service.delete_admin(user_id, current_user.id)
    await db.commit()
