"""Order endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def create_order():
    """Create a new order from the current cart."""
    # TODO: implement
    pass


@router.get("/")
async def list_orders():
    """List orders for the current user."""
    # TODO: implement
    pass


@router.get("/{order_id}")
async def get_order(order_id: str):
    """Get a single order by ID."""
    # TODO: implement
    pass


@router.patch("/{order_id}/status")
async def update_order_status(order_id: str):
    """Update order status (admin only)."""
    # TODO: implement
    pass
