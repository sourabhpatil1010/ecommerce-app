"""Product service."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.repositories.product import ProductRepository


class ProductService:
    """Business logic for product operations."""

    def __init__(self, session: AsyncSession):
        self.product_repo = ProductRepository(session)

    async def create_product(self, product_in: ProductCreate, current_user=None) -> Product:
        """Create a new product with uniqueness and category checks."""
        import uuid
        from app.models.product import Product
        from app.core.exceptions import ConflictException, NotFoundException
        from app.repositories.category import CategoryRepository

        # Check slug uniqueness
        existing_slug = await self.product_repo.get_by_slug(product_in.slug)
        if existing_slug:
            raise ConflictException(detail="Product slug already exists")

        # Validate category exists if provided (or required for PRODUCT_ADMIN)
        if not product_in.category_id and current_user and current_user.role == "PRODUCT_ADMIN":
            from app.core.exceptions import ForbiddenException
            raise ForbiddenException(detail="PRODUCT_ADMIN must assign a category to the product")
            
        if product_in.category_id:
            category_repo = CategoryRepository(self.product_repo.session)
            category = await category_repo.get_by_id(product_in.category_id)
            if not category:
                raise NotFoundException(detail="Category not found")
                
            if current_user and current_user.role == "PRODUCT_ADMIN":
                if category.department and current_user.department:
                    cat_dept = category.department.strip().upper().replace(" ", "_")
                    user_dept = current_user.department.strip().upper().replace(" ", "_")
                    if cat_dept != user_dept:
                        from app.core.exceptions import ForbiddenException
                        raise ForbiddenException(detail="Cannot assign product to a category outside your department")

        # Create product
        product = Product(
            name=product_in.name,
            slug=product_in.slug,
            description=product_in.description,
            price=product_in.price,
            stock=product_in.stock,
            image_url=product_in.image_url,
            category_id=product_in.category_id,
        )
        return await self.product_repo.create(product)

    async def get_product_by_id(self, product_id: uuid.UUID) -> Product:
        """Retrieve a product by ID, raising 404 if not found."""
        from app.core.exceptions import NotFoundException
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException(detail="Product not found")
        return product

    async def get_product_by_slug(self, slug: str) -> Product:
        """Retrieve a product by slug, raising 404 if not found."""
        from app.core.exceptions import NotFoundException
        product = await self.product_repo.get_by_slug(slug)
        if not product:
            raise NotFoundException(detail="Product not found")
        return product

    async def list_products(
        self,
        *,
        page: int = 1,
        per_page: int = 20,
        category_id: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        search: str | None = None,
        is_active: bool | None = None,
        department: str | None = None,
    ) -> dict:
        """Fetch a paginated response of products with sorting and filters."""
        import math

        if page < 1:
            page = 1
        if per_page < 1:
            per_page = 20

        skip = (page - 1) * per_page
        limit = per_page

        items, total = await self.product_repo.list_products(
            skip=skip,
            limit=limit,
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            search=search,
            is_active=is_active,
            department=department,
        )

        pages = math.ceil(total / per_page) if total > 0 else 0

        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages,
        }

    async def update_product(
        self, product_id: uuid.UUID, product_in: ProductUpdate, current_user=None
    ) -> Product:
        """Update an existing product checking conflicts and categories."""
        from app.core.exceptions import NotFoundException, ConflictException
        from app.repositories.category import CategoryRepository

        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException(detail="Product not found")

        # Check slug uniqueness if changed
        if product_in.slug is not None and product_in.slug != product.slug:
            existing_slug = await self.product_repo.get_by_slug(product_in.slug)
            if existing_slug:
                raise ConflictException(detail="Product slug already exists")
            product.slug = product_in.slug

        # Check category existence if changed
        if product_in.category_id is not None and product_in.category_id != product.category_id:
            category_repo = CategoryRepository(self.product_repo.session)
            category = await category_repo.get_by_id(product_in.category_id)
            if not category:
                raise NotFoundException(detail="Category not found")
                
            if current_user and current_user.role == "PRODUCT_ADMIN":
                if category.department and current_user.department:
                    cat_dept = category.department.strip().upper().replace(" ", "_")
                    user_dept = current_user.department.strip().upper().replace(" ", "_")
                    if cat_dept != user_dept:
                        from app.core.exceptions import ForbiddenException
                        raise ForbiddenException(detail="Cannot assign product to a category outside your department")
                    
            product.category_id = product_in.category_id

        # Update remaining fields if provided
        if product_in.name is not None:
            product.name = product_in.name
        if product_in.description is not None:
            product.description = product_in.description
        if product_in.price is not None:
            product.price = product_in.price
        if product_in.stock is not None:
            product.stock = product_in.stock
        if product_in.image_url is not None:
            product.image_url = product_in.image_url
        if product_in.is_active is not None:
            product.is_active = product_in.is_active

        return await self.product_repo.update(product)

    async def delete_product(self, product_id: uuid.UUID, current_user=None) -> None:
        """Delete a product by ID."""
        from app.core.exceptions import NotFoundException, ForbiddenException
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundException(detail="Product not found")
            
        if current_user and current_user.role == "PRODUCT_ADMIN":
            if product.category and product.category.department and current_user.department:
                if product.category.department != current_user.department:
                    raise ForbiddenException(detail="Cannot delete product from a category outside your department")
                    
        await self.product_repo.delete(product)

