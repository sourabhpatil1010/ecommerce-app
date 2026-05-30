"""Review endpoints."""

from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.review import ProductReview
from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter()

@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    product_id: uuid.UUID,
    review_in: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new product review."""
    
    # Check if product exists
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if user already reviewed
    existing_result = await db.execute(
        select(ProductReview).where(
            ProductReview.product_id == product_id,
            ProductReview.user_id == current_user.id
        )
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    # Check verified purchase
    purchased_result = await db.execute(
        select(OrderItem).join(Order).where(
            Order.user_id == current_user.id,
            OrderItem.product_id == product_id,
            Order.status == "DELIVERED"
        )
    )
    purchased = purchased_result.scalar_one_or_none()

    is_verified = purchased is not None

    review = ProductReview(
        product_id=product_id,
        user_id=current_user.id,
        rating=review_in.rating,
        review_text=review_in.review_text,
        is_verified_purchase=is_verified
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    review.user = current_user
    return review

@router.get("/product/{product_id}", response_model=list[ReviewRead])
async def get_product_reviews(
    product_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get all reviews for a product."""
    result = await db.execute(
        select(ProductReview)
        .options(joinedload(ProductReview.user))
        .where(ProductReview.product_id == product_id)
        .order_by(ProductReview.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/product/{product_id}/stats")
async def get_product_review_stats(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get aggregate stats for a product."""
    
    result = await db.execute(
        select(
            func.avg(ProductReview.rating),
            func.count(ProductReview.id)
        ).where(ProductReview.product_id == product_id)
    )
    row = result.first()

    avg_rating, count = row if row else (0, 0)
    
    return {
        "average_rating": float(avg_rating) if avg_rating else 0.0,
        "total_reviews": count
    }

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a review."""
    review = await db.get(ProductReview, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    await db.delete(review)
    await db.commit()
