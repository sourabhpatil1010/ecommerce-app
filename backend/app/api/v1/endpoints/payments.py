"""Payment endpoints — Stripe integration."""

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.v1.deps import get_current_active_user
from app.models.user import User
from app.schemas.payment import PaymentIntentCreate, PaymentIntentResponse, PaymentRead
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
