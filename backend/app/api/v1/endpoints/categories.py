"""Category endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_categories():
    """List all categories."""
    # TODO: implement
    pass


@router.get("/{category_id}")
async def get_category(category_id: str):
    """Get a single category by ID."""
    # TODO: implement
    pass


@router.post("/")
async def create_category():
    """Create a new category (admin only)."""
    # TODO: implement
    pass


@router.put("/{category_id}")
async def update_category(category_id: str):
    """Update a category (admin only)."""
    # TODO: implement
    pass


@router.delete("/{category_id}")
async def delete_category(category_id: str):
    """Delete a category (admin only)."""
    # TODO: implement
    pass
