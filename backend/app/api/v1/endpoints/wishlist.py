"""Wishlist endpoints."""

from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.wishlist import WishlistItem
from app.schemas.wishlist import WishlistCreate, WishlistRead

router = APIRouter()


@router.get("/", response_model=list[WishlistRead])
async def get_wishlist(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user's wishlist."""
    result = await db.execute(
        select(WishlistItem)
        .options(selectinload(WishlistItem.product))
        .where(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=WishlistRead, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    item_in: WishlistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Add a product to the wishlist."""
    product = await db.get(Product, item_in.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing_result = await db.execute(
        select(WishlistItem)
        .options(selectinload(WishlistItem.product))
        .where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == item_in.product_id,
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        return existing

    item = WishlistItem(
        user_id=current_user.id,
        product_id=item_in.product_id,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    # Reload item with product relationship for response
    item_with_rel = await db.execute(
        select(WishlistItem)
        .options(selectinload(WishlistItem.product))
        .where(WishlistItem.id == item.id)
    )
    return item_with_rel.scalar_one()


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Remove a product from the wishlist."""
    item_result = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
    )
    item = item_result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")

    await db.delete(item)
    await db.commit()
