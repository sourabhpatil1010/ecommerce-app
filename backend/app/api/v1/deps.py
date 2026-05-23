"""V1 API endpoint dependencies (e.g. get_current_user)."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db  # noqa: F401


async def get_current_user(db: AsyncSession = Depends(get_db)):
    """Dependency: extract and validate the current user from JWT.

    TODO: implement JWT decoding → user lookup.
    """
    pass


async def get_current_active_user(current_user=Depends(get_current_user)):
    """Dependency: ensure the current user is active.

    TODO: check user.is_active.
    """
    pass


async def get_current_superuser(current_user=Depends(get_current_user)):
    """Dependency: ensure the current user is a superuser.

    TODO: check user.is_superuser.
    """
    pass
