"""Product repository."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """Data access for Product entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Product, session)

    async def get_by_slug(self, slug: str) -> Product | None:
        """Fetch a single product by slug."""
        from sqlalchemy import select
        result = await self.session.execute(
            select(Product)
            .options(selectinload(Product.images))
            .where(Product.slug == slug)
        )
        return result.scalar_one_or_none()

    async def list_products(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        category_id: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        search: str | None = None,
        is_active: bool | None = None,
        department: str | None = None,
    ) -> tuple[list[Product], int]:
        """Fetch list of products with filters, and return (items, total_count)."""
        import uuid
        from sqlalchemy import select, func, or_

        query = select(Product)
        count_query = select(func.count()).select_from(Product)

        filters = []
        if category_id is not None:
            try:
                # category_id might be a string from API query param, convert to UUID if needed
                cat_uuid = uuid.UUID(str(category_id))
                filters.append(Product.category_id == cat_uuid)
            except ValueError:
                # If it's an invalid UUID format, return empty results or ignore
                pass
        if min_price is not None:
            filters.append(Product.price >= min_price)
        if max_price is not None:
            filters.append(Product.price <= max_price)
        if search and search.strip():
            search_term = f"%{search.strip()}%"
            filters.append(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term),
                )
            )
        if is_active is not None:
            filters.append(Product.is_active == is_active)

        if department is not None:
            from app.models.category import Category
            query = query.join(Product.category)
            count_query = count_query.join(Product.category)
            normalized_dept = department.strip().upper().replace(" ", "_")
            filters.append(func.replace(func.upper(Category.department), " ", "_") == normalized_dept)

        if filters:
            query = query.where(*filters)
            count_query = count_query.where(*filters)

        # Execute count query
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Execute paginated items query ordered by created_at desc
        query = query.options(selectinload(Product.images))
        query = query.order_by(Product.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        items = list(result.scalars().all())

        return items, total

