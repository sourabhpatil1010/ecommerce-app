"""Product-related Pydantic schemas."""

from uuid import UUID

from app.schemas.common import BaseSchema, TimestampSchema


class ProductCreate(BaseSchema):
    """Schema for creating a product."""

    name: str
    slug: str
    description: str | None = None
    price: float
    stock: int = 0
    image_url: str | None = None
    category_id: UUID | None = None


class ProductUpdate(BaseSchema):
    """Schema for updating a product."""

    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
    image_url: str | None = None
    category_id: UUID | None = None
    is_active: bool | None = None


class ProductRead(TimestampSchema):
    """Schema for reading product data."""

    id: UUID
    name: str
    slug: str
    description: str | None
    price: float
    stock: int
    image_url: str | None
    is_active: bool
    category_id: UUID | None
