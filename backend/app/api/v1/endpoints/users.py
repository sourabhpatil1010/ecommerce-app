"""User endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_current_user_profile():
    """Get the authenticated user's profile."""
    # TODO: implement
    pass


@router.put("/me")
async def update_current_user_profile():
    """Update the authenticated user's profile."""
    # TODO: implement
    pass


@router.get("/")
async def list_users():
    """List all users (admin only)."""
    # TODO: implement
    pass


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get a user by ID (admin only)."""
    # TODO: implement
    pass
