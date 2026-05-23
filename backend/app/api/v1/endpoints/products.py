"""Product endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_products():
    """List products with optional filters."""
    # TODO: implement
    pass


@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get a single product by ID."""
    # TODO: implement
    pass


@router.post("/")
async def create_product():
    """Create a new product (admin only)."""
    # TODO: implement
    pass


@router.put("/{product_id}")
async def update_product(product_id: str):
    """Update a product (admin only)."""
    # TODO: implement
    pass


@router.delete("/{product_id}")
async def delete_product(product_id: str):
    """Delete a product (admin only)."""
    # TODO: implement
    pass
