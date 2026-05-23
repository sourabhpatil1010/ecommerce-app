"""Cart endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_cart():
    """Get the current user's cart."""
    # TODO: implement
    pass


@router.post("/items")
async def add_cart_item():
    """Add an item to the cart."""
    # TODO: implement
    pass


@router.put("/items/{item_id}")
async def update_cart_item(item_id: str):
    """Update a cart item's quantity."""
    # TODO: implement
    pass


@router.delete("/items/{item_id}")
async def remove_cart_item(item_id: str):
    """Remove an item from the cart."""
    # TODO: implement
    pass


@router.delete("/")
async def clear_cart():
    """Clear all items from the cart."""
    # TODO: implement
    pass
