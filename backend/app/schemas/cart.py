"""Cart-related Pydantic schemas."""

from uuid import UUID
from pydantic import computed_field

from app.schemas.common import BaseSchema
from app.schemas.product import ProductRead


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
    product: ProductRead


class CartRead(BaseSchema):
    """Schema for reading the full cart."""

    id: UUID
    user_id: UUID
    items: list[CartItemRead] = []

    @computed_field
    @property
    def total(self) -> float:
        """Calculate the total price of all items in the cart."""
        return sum(item.quantity * item.unit_price for item in self.items)

