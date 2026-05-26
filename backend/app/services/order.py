"""Order service."""

import uuid
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.order import OrderRepository
from app.models.order import Order, OrderItem
from app.core.exceptions import BadRequestException, NotFoundException


class OrderService:
    """Business logic for order operations."""

    def __init__(self, session: AsyncSession):
        self.order_repo = OrderRepository(session)

    async def create_order(self, user_id: uuid.UUID, shipping_address: str) -> Order:
        """Create a new order from the user's current cart, validating stock and clearing the cart."""
        # 1. Fetch cart using CartService
        from app.services.cart import CartService
        cart_service = CartService(self.order_repo.session)
        cart = await cart_service.get_or_create_cart(user_id)

        # 2. Check if cart is empty
        if not cart.items:
            raise BadRequestException(detail="Cannot checkout with an empty cart")

        # 3. Check stock for each item, decrement stock, and prepare order items
        order_items = []
        total_amount = 0.0

        for item in cart.items:
            product = item.product
            if product.stock < item.quantity:
                raise BadRequestException(
                    detail=f"Not enough stock for product '{product.name}'. Only {product.stock} left."
                )
            # Decrement stock
            product.stock -= item.quantity

            # Create OrderItem entity
            order_item = OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=item.unit_price
            )
            order_items.append(order_item)
            total_amount += float(item.unit_price) * item.quantity

        from app.models.order import OrderStatus
        # 4. Create Order entity
        order = Order(
            user_id=user_id,
            shipping_address=shipping_address,
            status=OrderStatus.CHECKOUT_CREATED.value,
            total_amount=total_amount,
            items=order_items
        )

        # 5. Persist order
        await self.order_repo.create(order)

        # 6. Clear cart
        await cart_service.clear_cart(user_id)

        # Flush session to register all database changes (BaseRepository.create calls flush but we make sure)
        await self.order_repo.session.flush()

        # Refresh order to fetch the preloaded items
        order_refreshed = await self.order_repo.get_order_by_id_and_user_id(order.id, user_id)
        if not order_refreshed:
            return order
        return order_refreshed

    async def list_user_orders(self, user_id: uuid.UUID) -> list[Order]:
        """List all orders belonging to the user."""
        return await self.order_repo.get_by_user_id(user_id)

    async def get_order(self, order_id: uuid.UUID, user_id: uuid.UUID) -> Order:
        """Get details of a single order by ID and user ID."""
        order = await self.order_repo.get_order_by_id_and_user_id(order_id, user_id)
        if not order:
            raise NotFoundException(detail="Order not found")
        return order

    async def update_status(self, order_id: uuid.UUID, status: str) -> Order:
        """Update an order's status (admin only)."""
        order = await self.order_repo.get_order_with_items(order_id)
        if not order:
            raise NotFoundException(detail="Order not found")
        order.status = status
        await self.order_repo.session.flush()
        return order

    async def list_all_orders(self, skip: int = 0, limit: int = 100) -> list[Order]:
        """List all orders (admin only)."""
        return await self.order_repo.get_all_orders(skip=skip, limit=limit)

    async def cancel_order(self, order_id: uuid.UUID, user_id: uuid.UUID) -> Order:
        """Cancel an order if it belongs to the user and is in a cancellable state."""
        from app.core.exceptions import ForbiddenException
        from app.models.order import OrderStatus

        order = await self.order_repo.get_order_with_items(order_id)
        if not order:
            raise NotFoundException(detail="Order not found")

        # Validate ownership
        if order.user_id != user_id:
            raise ForbiddenException(detail="You do not have permission to cancel this order")

        # Only allow cancellation for ORDER_CONFIRMED status
        cancellable_statuses = {OrderStatus.ORDER_CONFIRMED.value}
        if order.status not in cancellable_statuses:
            raise BadRequestException(
                detail=f"Order cannot be cancelled. Current status: {order.status}"
            )

        order.status = OrderStatus.CANCELLED.value
        await self.order_repo.session.flush()
        return order
