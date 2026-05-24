import uuid
from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.v1.deps import get_current_active_user
from app.models.user import User
from app.schemas.cart import CartRead, CartItemCreate, CartItemUpdate
from app.services.cart import CartService

router = APIRouter()


@router.get("/", response_model=CartRead)
async def get_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get the current user's cart."""
    cart_service = CartService(db)
    return await cart_service.get_or_create_cart(current_user.id)


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
async def add_cart_item(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Add an item to the cart."""
    cart_service = CartService(db)
    return await cart_service.add_item(
        user_id=current_user.id,
        product_id=item_in.product_id,
        quantity=item_in.quantity,
    )


@router.put("/items/{item_id}", response_model=CartRead)
async def update_cart_item(
    item_id: uuid.UUID,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update a cart item's quantity."""
    cart_service = CartService(db)
    return await cart_service.update_item(
        user_id=current_user.id,
        item_id=item_id,
        quantity=item_in.quantity,
    )


@router.delete("/items/{item_id}", response_model=CartRead)
async def remove_cart_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Remove an item from the cart."""
    cart_service = CartService(db)
    return await cart_service.remove_item(
        user_id=current_user.id,
        item_id=item_id,
    )


@router.delete("/", response_model=CartRead)
async def clear_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Clear all items from the cart."""
    cart_service = CartService(db)
    return await cart_service.clear_cart(current_user.id)
