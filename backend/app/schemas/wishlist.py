"""Wishlist-related Pydantic schemas."""

from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict


class WishlistBase(BaseModel):
    product_id: uuid.UUID


class WishlistCreate(WishlistBase):
    pass


class WishlistProductRead(BaseModel):
    """Lightweight product schema for wishlist responses.

    Only includes scalar columns — no ORM relationships are accessed,
    which eliminates MissingGreenlet errors in async SQLAlchemy.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    price: float
    stock: int
    image_url: str | None = None
    is_active: bool
    category_id: uuid.UUID | None = None


class WishlistRead(BaseModel):
    """Wishlist item response schema.

    Uses WishlistProductRead instead of ProductRead to avoid
    triggering lazy-loaded relationships during serialization.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime
    product: WishlistProductRead
