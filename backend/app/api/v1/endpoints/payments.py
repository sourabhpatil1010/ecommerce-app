"""Payment endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def create_payment():
    """Initiate a payment for an order."""
    # TODO: implement
    pass


@router.get("/{payment_id}")
async def get_payment(payment_id: str):
    """Get payment details."""
    # TODO: implement
    pass


@router.post("/webhook")
async def payment_webhook():
    """Handle payment provider webhooks."""
    # TODO: implement
    pass
