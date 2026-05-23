"""Product endpoints."""

import uuid
from typing import Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductRead,
    ProductPaginatedResponse,
)
from app.services.product import ProductService
from app.api.v1.deps import get_current_superuser
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=ProductPaginatedResponse)
async def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category_id: str | None = Query(None),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    search: str | None = Query(None),
    is_active: bool | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List products with optional filters and pagination."""
    product_service = ProductService(db)
    return await product_service.list_products(
        page=page,
        per_page=per_page,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        search=search,
        is_active=is_active,
    )


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get a single product by ID."""
    product_service = ProductService(db)
    return await product_service.get_product_by_id(product_id)


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new product (admin only)."""
    product_service = ProductService(db)
    return await product_service.create_product(product_in)


@router.put("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: uuid.UUID,
    product_in: ProductUpdate,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update a product (admin only)."""
    product_service = ProductService(db)
    return await product_service.update_product(product_id, product_in)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: uuid.UUID,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete a product (admin only)."""
    product_service = ProductService(db)
    await product_service.delete_product(product_id)
