"""User-related Pydantic schemas."""

from uuid import UUID

from pydantic import EmailStr

from app.schemas.common import BaseSchema, TimestampSchema


class UserCreate(BaseSchema):
    """Schema for creating a new user."""

    email: EmailStr
    password: str
    full_name: str | None = None


class UserUpdate(BaseSchema):
    """Schema for updating user profile."""

    full_name: str | None = None
    email: EmailStr | None = None


class UserRead(TimestampSchema):
    """Schema for reading user data (no password)."""

    id: UUID
    email: str
    full_name: str | None
    is_active: bool


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
