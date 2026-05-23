"""Payment-related Pydantic schemas."""

from uuid import UUID
from datetime import datetime

from app.schemas.common import BaseSchema


class PaymentCreate(BaseSchema):
    """Schema for initiating a payment."""

    order_id: UUID
    amount: float
    currency: str = "USD"
    provider: str


class PaymentRead(BaseSchema):
    """Schema for reading payment data."""

    id: UUID
    order_id: UUID
    amount: float
    currency: str
    status: str
    provider: str | None
    provider_payment_id: str | None
    created_at: datetime
