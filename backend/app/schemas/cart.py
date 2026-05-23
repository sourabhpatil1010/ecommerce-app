"""Cart-related Pydantic schemas."""

from uuid import UUID

from app.schemas.common import BaseSchema


class CartItemCreate(BaseSchema):
    """Schema for adding an item to the cart."""

    product_id: UUID
    quantity: int = 1


class CartItemUpdate(BaseSchema):
    """Schema for updating cart item quantity."""

    quantity: int


class CartItemRead(BaseSchema):
    """Schema for reading a cart line item."""

    id: UUID
    product_id: UUID
    quantity: int
    unit_price: float


class CartRead(BaseSchema):
    """Schema for reading the full cart."""

    id: UUID
    user_id: UUID
    items: list[CartItemRead] = []
