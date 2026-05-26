"""Payment endpoints — Stripe integration."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.v1.deps import get_current_active_user
from app.models.user import User
from app.schemas.payment import (
    PaymentIntentCreate,
    PaymentIntentResponse,
    PaymentRead,
    RazorpayOrderCreate,
    RazorpayOrderResponse,
    RazorpayPaymentVerify,
    RazorpayPaymentFail,
    CodOrderCreate,
    CodOrderResponse,
)
from app.services.payment import PaymentService

router = APIRouter()


@router.post(
    "/create-intent",
    response_model=PaymentIntentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_payment_intent(
    payload: PaymentIntentCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a Stripe PaymentIntent for the given order."""
    service = PaymentService(db)
    result = await service.create_payment_intent(payload.order_id, current_user.id)
    return result


@router.get("/{order_id}/status", response_model=PaymentRead)
async def get_payment_status(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get the payment status for a given order."""
    service = PaymentService(db)
    return await service.get_payment_status(order_id, current_user.id)


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle incoming Stripe webhook events.

    This endpoint is public (no JWT) — Stripe signs requests with
    the webhook secret for verification.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    service = PaymentService(db)
    await service.handle_webhook_event(payload, sig_header)

    return {"status": "ok"}


@router.post("/{order_id}/simulate-webhook", status_code=status.HTTP_200_OK)
async def simulate_webhook(
    order_id: uuid.UUID,
    success: bool = True,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Simulate Stripe webhook trigger (for development and local testing)."""
    from app.config import settings
    from fastapi import HTTPException
    
    is_placeholder = (
        not settings.STRIPE_SECRET_KEY
        or "placeholder" in settings.STRIPE_SECRET_KEY.lower()
    )
    if not settings.DEBUG and not is_placeholder:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Simulation is only allowed in development or when Stripe is not configured."
        )

    service = PaymentService(db)
    await service.simulate_payment_update(order_id, success)
    return {"status": "ok", "detail": "Simulation successful"}


@router.post(
    "/razorpay/create-order",
    response_model=RazorpayOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_razorpay_order(
    payload: RazorpayOrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a Razorpay order for the given local order."""
    service = PaymentService(db)
    result = await service.create_razorpay_order(payload.order_id, current_user.id)
    return result


@router.post("/razorpay/verify", status_code=status.HTTP_200_OK)
async def verify_razorpay_payment(
    payload: RazorpayPaymentVerify,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Verify Razorpay payment signature."""
    service = PaymentService(db)
    await service.verify_razorpay_payment(
        payload.razorpay_payment_id,
        payload.razorpay_order_id,
        payload.razorpay_signature,
    )
    return {"status": "ok", "detail": "Payment verified successfully"}


@router.post("/razorpay/fail", status_code=status.HTTP_200_OK)
async def fail_razorpay_payment(
    payload: RazorpayPaymentFail,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Record a failed Razorpay payment attempt."""
    service = PaymentService(db)
    await service.fail_razorpay_payment(payload.razorpay_order_id)
    return {"status": "ok", "detail": "Payment failure recorded"}


@router.post("/razorpay/webhook", status_code=status.HTTP_200_OK)
async def razorpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle incoming Razorpay webhook events.

    This endpoint is public (no JWT) — Razorpay signs requests with
    the webhook secret for verification.
    """
    payload = await request.body()
    sig_header = request.headers.get("X-Razorpay-Signature", "")

    service = PaymentService(db)
    await service.handle_razorpay_webhook_event(payload, sig_header)

    return {"status": "ok"}


@router.post(
    "/cod/create-order",
    response_model=CodOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_cod_payment(
    payload: CodOrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a Cash on Delivery payment for the given order."""
    service = PaymentService(db)
    result = await service.create_cod_payment(payload.order_id, current_user.id)
    return result


