"""User endpoints."""

import uuid
from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate, UserStatusUpdate
from app.services.user import UserService
from app.api.v1.deps import get_current_active_user, get_current_superuser

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
