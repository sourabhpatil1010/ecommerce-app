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
    coupon_code: str | None = None
    discount_amount: float = 0
    shipping_cost: float = 0
    tax_amount: float = 0


class OrderStatusHistoryRead(BaseSchema):
    """Schema for reading order status history."""

    id: UUID
    order_id: UUID
    old_status: str | None
    new_status: str
    changed_by: UUID | None
    notes: str | None
    created_at: datetime
    updated_at: datetime


class OrderRead(BaseSchema):
    """Schema for reading order data."""

    id: UUID
    user_id: UUID
    status: str
    total_amount: float
    discount_amount: float | None = None
    coupon_code: str | None = None
    shipping_cost: float | None = None
    tax_amount: float | None = None
    shipping_address: str | None
    department: str | None = None
    tracking_id: str | None = None
    courier: str | None = None
    items: list[OrderItemRead] = []
    status_history: list[OrderStatusHistoryRead] = []
    payment_status: str | None = None
    created_at: datetime
    updated_at: datetime


class OrderStatusUpdate(BaseSchema):
    """Schema for updating order status."""

    status: str
    notes: str | None = None
    tracking_id: str | None = None
    courier: str | None = None
