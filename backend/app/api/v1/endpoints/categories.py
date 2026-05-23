"""Category endpoints."""

import uuid
from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
from app.repositories.category import CategoryRepository
from app.models.category import Category
from app.api.v1.deps import get_current_superuser
from app.models.user import User
from app.core.exceptions import NotFoundException, ConflictException

router = APIRouter()


@router.get("/", response_model=list[CategoryRead])
async def list_categories(db: AsyncSession = Depends(get_db)) -> Any:
    """List all categories."""
    repo = CategoryRepository(db)
    return await repo.get_all()


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get a single category by ID."""
    repo = CategoryRepository(db)
    category = await repo.get_by_id(category_id)
    if not category:
        raise NotFoundException(detail="Category not found")
    return category


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new category (admin only)."""
    from sqlalchemy import select
    repo = CategoryRepository(db)

    # Check if slug exists
    slug_result = await db.execute(
        select(Category).where(Category.slug == category_in.slug)
    )
    if slug_result.scalar_one_or_none():
        raise ConflictException(detail="Category slug already exists")

    category = Category(
        name=category_in.name,
        slug=category_in.slug,
        description=category_in.description,
    )
    return await repo.create(category)


@router.put("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: uuid.UUID,
    category_in: CategoryUpdate,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update a category (admin only)."""
    from sqlalchemy import select
    repo = CategoryRepository(db)
    category = await repo.get_by_id(category_id)
    if not category:
        raise NotFoundException(detail="Category not found")

    if category_in.slug is not None and category_in.slug != category.slug:
        slug_result = await db.execute(
            select(Category).where(Category.slug == category_in.slug)
        )
        if slug_result.scalar_one_or_none():
            raise ConflictException(detail="Category slug already exists")
        category.slug = category_in.slug

    if category_in.name is not None:
        category.name = category_in.name
    if category_in.description is not None:
        category.description = category_in.description

    return await repo.update(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete a category (admin only)."""
    repo = CategoryRepository(db)
    category = await repo.get_by_id(category_id)
    if not category:
        raise NotFoundException(detail="Category not found")
    await repo.delete(category)
