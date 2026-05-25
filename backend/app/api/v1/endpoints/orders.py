import uuid
from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.v1.deps import get_current_active_user, get_current_superuser
from app.models.user import User
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.services.order import OrderService
from app.repositories.payment import PaymentRepository

router = APIRouter()


def _enrich_order(order: Any, payment: Any = None) -> dict:
    """Convert an Order ORM object to a dict with payment_status attached."""
    data = {
        "id": order.id,
        "user_id": order.user_id,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "shipping_address": order.shipping_address,
        "items": order.items,
        "payment_status": payment.status if payment else None,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }
    return data


@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new order from the current cart."""
    order_service = OrderService(db)
    order = await order_service.create_order(current_user.id, order_in.shipping_address)
    return _enrich_order(order)


@router.get("/", response_model=list[OrderRead])
async def list_orders(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List orders for the current user."""
    order_service = OrderService(db)
    payment_repo = PaymentRepository(db)
    orders = await order_service.list_user_orders(current_user.id)
    result = []
    for order in orders:
        payment = await payment_repo.get_by_order_id(order.id)
        result.append(_enrich_order(order, payment))
    return result


@router.get("/all", response_model=list[OrderRead])
async def list_all_orders(
    skip: int = 0,
    limit: int = 100,
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all orders (admin only)."""
    order_service = OrderService(db)
    payment_repo = PaymentRepository(db)
    orders = await order_service.list_all_orders(skip=skip, limit=limit)
    result = []
    for order in orders:
        payment = await payment_repo.get_by_order_id(order.id)
        result.append(_enrich_order(order, payment))
    return result


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get a single order by ID."""
    order_service = OrderService(db)
    payment_repo = PaymentRepository(db)
    order = await order_service.get_order(order_id, current_user.id)
    payment = await payment_repo.get_by_order_id(order.id)
    return _enrich_order(order, payment)


@router.patch("/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: uuid.UUID,
    status_in: OrderStatusUpdate,
    current_user: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update order status (admin only)."""
    order_service = OrderService(db)
    payment_repo = PaymentRepository(db)
    order = await order_service.update_status(order_id, status_in.status)
    payment = await payment_repo.get_by_order_id(order.id)
    return _enrich_order(order, payment)
