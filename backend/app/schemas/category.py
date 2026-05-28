"""Category-related Pydantic schemas."""

from uuid import UUID

from app.schemas.common import BaseSchema, TimestampSchema


class CategoryCreate(BaseSchema):
    """Schema for creating a category."""

    name: str
    slug: str
    description: str | None = None
    department: str | None = None


class CategoryUpdate(BaseSchema):
    """Schema for updating a category."""

    name: str | None = None
    slug: str | None = None
    description: str | None = None
    department: str | None = None


class CategoryRead(TimestampSchema):
    """Schema for reading category data."""

    id: UUID
    name: str
    slug: str
    description: str | None
    department: str | None
