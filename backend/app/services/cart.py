import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cart import Cart, CartItem
from app.repositories.cart import CartRepository
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException
from app.services.product import ProductService


class CartService:
    """Business logic for cart operations."""

    def __init__(self, session: AsyncSession):
        self.cart_repo = CartRepository(session)

    async def get_or_create_cart(self, user_id: uuid.UUID) -> Cart:
        """Fetch the user's cart, creating it if it doesn't exist."""
        cart = await self.cart_repo.get_by_user_id(user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            await self.cart_repo.create(cart)
            cart = await self.cart_repo.get_by_user_id(user_id)
        return cart

    async def add_item(self, user_id: uuid.UUID, product_id: uuid.UUID, quantity: int) -> Cart:
        """Add a product to the user's cart or update its quantity."""
        if quantity <= 0:
            raise BadRequestException(detail="Quantity must be at least 1")

        cart = await self.get_or_create_cart(user_id)
        product_service = ProductService(self.cart_repo.session)
        product = await product_service.get_product_by_id(product_id)

        if not product.is_active:
            raise BadRequestException(detail="Product is not active")

        # Find if the item already exists in the cart
        existing_item = next((item for item in cart.items if item.product_id == product_id), None)

        if existing_item:
            new_quantity = existing_item.quantity + quantity
            if new_quantity > product.stock:
                raise BadRequestException(
                    detail=f"Cannot add {quantity} more. Only {product.stock} items available in stock."
                )
            existing_item.quantity = new_quantity
            existing_item.unit_price = product.price
            existing_item.product = product
        else:
            if quantity > product.stock:
                raise BadRequestException(
                    detail=f"Cannot add {quantity} items. Only {product.stock} items available in stock."
                )
            new_item = CartItem(
                cart=cart,
                product=product,
                product_id=product_id,
                quantity=quantity,
                unit_price=product.price,
            )
            self.cart_repo.session.add(new_item)

        await self.cart_repo.session.flush()
        return cart

    async def update_item(self, user_id: uuid.UUID, item_id: uuid.UUID, quantity: int) -> Cart:
        """Update the quantity of an item in the user's cart."""
        if quantity <= 0:
            raise BadRequestException(detail="Quantity must be at least 1")

        cart = await self.get_or_create_cart(user_id)

        cart_item = next((item for item in cart.items if item.id == item_id), None)
        if not cart_item:
            raise NotFoundException(detail="Cart item not found")

        if quantity > cart_item.product.stock:
            raise BadRequestException(
                detail=f"Cannot update quantity to {quantity}. Only {cart_item.product.stock} items available in stock."
            )

        cart_item.quantity = quantity
        await self.cart_repo.session.flush()
        return cart

    async def remove_item(self, user_id: uuid.UUID, item_id: uuid.UUID) -> Cart:
        """Remove an item from the user's cart."""
        cart = await self.get_or_create_cart(user_id)

        cart_item = next((item for item in cart.items if item.id == item_id), None)
        if not cart_item:
            raise NotFoundException(detail="Cart item not found")

        cart.items.remove(cart_item)
        await self.cart_repo.session.delete(cart_item)
        await self.cart_repo.session.flush()
        return cart

    async def clear_cart(self, user_id: uuid.UUID) -> Cart:
        """Clear all items in the user's cart."""
        cart = await self.get_or_create_cart(user_id)
        for item in list(cart.items):
            await self.cart_repo.session.delete(item)
        cart.items.clear()
        await self.cart_repo.session.flush()
        return cart
