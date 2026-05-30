"""Coupon endpoints."""

from typing import Any
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.coupon import Coupon
from app.schemas.coupon import CouponCreate, CouponRead, CouponUpdate

router = APIRouter()

@router.get("/", response_model=list[CouponRead])
async def get_coupons(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get all coupons (Admin only)."""
    if current_user.role not in ["SUPER_ADMIN", "PRODUCT_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    result = await db.execute(
        select(Coupon)
        .order_by(Coupon.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/", response_model=CouponRead, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    coupon_in: CouponCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new coupon (Admin only)."""
    if current_user.role not in ["SUPER_ADMIN", "PRODUCT_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    existing_result = await db.execute(select(Coupon).where(Coupon.code == coupon_in.code))
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    coupon = Coupon(
        code=coupon_in.code,
        discount_percentage=coupon_in.discount_percentage,
        max_discount_amount=coupon_in.max_discount_amount,
        valid_until=coupon_in.valid_until,
        is_active=coupon_in.is_active,
        usage_limit=coupon_in.usage_limit
    )
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon

@router.put("/{coupon_id}", response_model=CouponRead)
async def update_coupon(
    coupon_id: uuid.UUID,
    coupon_in: CouponUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update a coupon (Admin only)."""
    if current_user.role not in ["SUPER_ADMIN", "PRODUCT_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    coupon = await db.get(Coupon, coupon_id)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    update_data = coupon_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(coupon, field, value)

    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon

@router.get("/validate/{code}")
async def validate_coupon(
    code: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Validate a coupon code and return details."""
    result = await db.execute(select(Coupon).where(Coupon.code == code))
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
        
    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="Coupon is inactive")
        
    # Handle naive vs aware datetimes for PostgreSQL timestamp with timezone
    if coupon.valid_until:
        now = datetime.now(timezone.utc)
        if coupon.valid_until.tzinfo is None:
            now = now.replace(tzinfo=None)
        if coupon.valid_until < now:
            raise HTTPException(status_code=400, detail="Coupon has expired")
        
    if coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")

    return {
        "valid": True,
        "discount_percentage": float(coupon.discount_percentage),
        "max_discount_amount": float(coupon.max_discount_amount) if coupon.max_discount_amount else None
    }
