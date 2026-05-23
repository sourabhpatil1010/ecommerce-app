import uuid
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.services.user import UserService
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException, BadRequestException, ForbiddenException

# OAuth2 Password Flow scheme
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/auth/login"
)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> User:
    """Dependency: extract and validate the current user from JWT."""
    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if not user_id_str:
            raise UnauthorizedException(detail="Could not validate credentials")
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise UnauthorizedException(detail="Could not validate credentials")

    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise UnauthorizedException(detail="User not found")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency: ensure the current user is active."""
    if not current_user.is_active:
        raise BadRequestException(detail="Inactive user")
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency: ensure the current user is a superuser."""
    if not current_user.is_superuser:
        raise ForbiddenException(detail="The user does not have enough privileges")
    return current_user
