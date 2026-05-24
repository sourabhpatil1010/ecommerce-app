"""Order-related Pydantic schemas."""

from uuid import UUID
from datetime import datetime

from app.schemas.common import BaseSchema
from app.schemas.product import ProductRead


class OrderItemRead(BaseSchema):
    """Schema for reading an order line item."""

    id: UUID
    product_id: UUID
    quantity: int
    unit_price: float
    product: ProductRead | None = None


class OrderCreate(BaseSchema):
    """Schema for placing a new order."""

    shipping_address: str


class OrderRead(BaseSchema):
    """Schema for reading order data."""

    id: UUID
    user_id: UUID
    status: str
    total_amount: float
    shipping_address: str | None
    items: list[OrderItemRead] = []
    payment_status: str | None = None
    created_at: datetime
    updated_at: datetime


class OrderStatusUpdate(BaseSchema):
    """Schema for updating order status."""

    status: str
