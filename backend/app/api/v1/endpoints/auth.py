from typing import Any
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import UserCreate, UserRead, Token, UserLogin, AdminUserCreate
from app.services.auth import AuthService
from app.core.security import create_access_token
from app.api.v1.deps import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=201)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Register a new user."""
    auth_service = AuthService(db)
    user = await auth_service.register(user_in)
    return user


@router.post("/admin-register", response_model=UserRead, status_code=201)
async def admin_register(
    user_in: AdminUserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Register a new admin user."""
    auth_service = AuthService(db)
    user = await auth_service.register_admin(user_in)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Authenticate via OAuth2 form (used by Swagger UI). Returns JWT token."""
    auth_service = AuthService(db)
    user = await auth_service.authenticate(
        email=form_data.username,
        password=form_data.password
    )
    access_token = create_access_token(subject=str(user.id))
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/token", response_model=Token)
async def login_json(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Authenticate via JSON body (used by the frontend). Returns JWT token."""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"LOGIN TRACE: Attempting login for email: {credentials.email}")
    auth_service = AuthService(db)
    try:
        user = await auth_service.authenticate(
            email=credentials.email,
            password=credentials.password
        )
        logger.info(f"LOGIN TRACE: User authenticated successfully. Role: {user.role}, Active: {user.is_active}")
        
        access_token = create_access_token(subject=str(user.id))
        logger.info(f"LOGIN TRACE: JWT generation result: SUCCESS")
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        logger.error(f"LOGIN TRACE: Login failed with exception: {str(e)}")
        raise


@router.get("/me", response_model=UserRead)
async def get_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Return the currently authenticated user's profile."""
    return current_user
