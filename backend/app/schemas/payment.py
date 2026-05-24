"""Payment-related Pydantic schemas."""

from uuid import UUID
from datetime import datetime

from app.schemas.common import BaseSchema


class PaymentIntentCreate(BaseSchema):
    """Schema for creating a Stripe PaymentIntent."""

    order_id: UUID


class PaymentIntentResponse(BaseSchema):
    """Schema returned after creating a PaymentIntent."""

    payment_id: UUID
    client_secret: str
    amount: float
    currency: str


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
