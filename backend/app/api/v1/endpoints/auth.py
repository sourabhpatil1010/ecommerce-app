"""Authentication endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/register")
async def register():
    """Register a new user."""
    # TODO: implement
    pass


@router.post("/login")
async def login():
    """Authenticate and return JWT tokens."""
    # TODO: implement
    pass


@router.post("/refresh")
async def refresh_token():
    """Refresh an access token."""
    # TODO: implement
    pass
