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


class RazorpayOrderCreate(BaseSchema):
    """Schema for initiating Razorpay payment."""

    order_id: UUID


class RazorpayOrderResponse(BaseSchema):
    """Schema returned after creating a Razorpay order."""

    payment_id: UUID
    order_id: str
    amount: int
    currency: str
    key: str



class RazorpayPaymentVerify(BaseSchema):
    """Schema for verifying a Razorpay payment signature."""

    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


class RazorpayPaymentFail(BaseSchema):
    """Schema for recording a failed Razorpay payment."""

    razorpay_order_id: str
    error_code: str | None = None
    error_description: str | None = None


class CodOrderCreate(BaseSchema):
    """Schema for initiating COD payment."""

    order_id: UUID


class CodOrderResponse(BaseSchema):
    """Schema returned after creating a COD payment."""

    payment_id: UUID
    provider: str
    status: str
    amount: float

