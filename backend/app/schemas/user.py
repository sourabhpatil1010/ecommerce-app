"""User-related Pydantic schemas."""

from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.common import BaseSchema, TimestampSchema


class UserCreate(BaseSchema):
    """Schema for creating a new user."""

    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str | None = None


class AdminUserCreate(UserCreate):
    """Schema for creating a new admin user."""

    admin_secret: str


class UserUpdate(BaseSchema):
    """Schema for updating user profile."""

    full_name: str | None = None
    email: EmailStr | None = None


class UserStatusUpdate(BaseSchema):
    """Schema for updating user active status (admin only)."""

    is_active: bool


class UserRead(TimestampSchema):
    """Schema for reading user data (no password)."""

    id: UUID
    email: str
    full_name: str | None
    is_active: bool
    is_superuser: bool


class UserLogin(BaseSchema):
    """Schema for login request."""

    email: EmailStr
    password: str


class Token(BaseSchema):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseSchema):
    """Decoded JWT payload."""

    sub: str
