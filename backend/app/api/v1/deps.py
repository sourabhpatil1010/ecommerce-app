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
    import logging
    logger = logging.getLogger(__name__)
    
    role_val = getattr(current_user.role, "value", current_user.role) if hasattr(current_user, "role") else ""
    role_str = str(role_val).strip().upper() if role_val else ""
    
    is_super = current_user.is_superuser or (role_str == "SUPER_ADMIN") or (role_str == "ADMIN")
    
    logger.warning(f"Superuser check -> Email: {current_user.email}, is_superuser: {current_user.is_superuser}, role: '{role_str}', result: {is_super}")
    
    if not is_super:
        raise ForbiddenException(detail="The user does not have enough privileges")
    return current_user


def require_roles(roles: list[str]):
    """Dependency generator: check if the current user has any of the required roles."""
    # Ensure all required roles are uppercase for robust comparison
    allowed_roles = [r.upper() for r in roles]
    
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        role_val = getattr(current_user.role, "value", current_user.role) if hasattr(current_user, "role") else ""
        current_role_upper = str(role_val).strip().upper() if role_val else ""
        
        # Superuser always has access
        is_super = current_user.is_superuser or (current_role_upper == "SUPER_ADMIN") or (current_role_upper == "ADMIN")
        if is_super:
            return current_user
            
        if current_role_upper not in allowed_roles:
            raise ForbiddenException(detail="The user does not have enough privileges")
        return current_user
    return role_checker


# Optional OAuth2 Flow
optional_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/auth/login",
    auto_error=False
)

async def get_current_user_optional(
    db: AsyncSession = Depends(get_db),
    token: str | None = Depends(optional_oauth2)
) -> User | None:
    """Dependency: optionally extract and validate the current user from JWT."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if not user_id_str:
            return None
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        return None

    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)
    if user and user.is_active:
        return user
    return None
