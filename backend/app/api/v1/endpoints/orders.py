import uuid
from typing import Any
from fastapi import APIRouter, Depends, status, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.v1.deps import get_current_active_user, get_current_superuser, require_roles
from app.models.user import User
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.services.order import OrderService
from app.repositories.payment import PaymentRepository

router = APIRouter()


from datetime import datetime, timezone

def _enrich_order(order: Any, payment: Any = None) -> dict:
    """Convert an Order ORM object to a dict with payment_status attached."""
    computed_status = order.status

    data = {
        "id": order.id,
        "user_id": order.user_id,
        "status": computed_status,
        "total_amount": float(order.total_amount),
        "shipping_address": order.shipping_address,
        "items": order.items,
        "status_history": getattr(order, 'status_history', []),
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
    
    # Manually commit to ensure order is persisted
    await db.commit()
    
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
    statuses: list[str] | None = Query(None),
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "PRODUCT_ADMIN", "SHIPPING_ADMIN", "DELIVERY_ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all orders (admin only), filtered by department and statuses if applicable."""
    import logging
    logger = logging.getLogger("orders_api")
    logger.setLevel(logging.DEBUG)
    
    order_service = OrderService(db)
    payment_repo = PaymentRepository(db)
    
    department = None
    role_val = getattr(current_user.role, "value", current_user.role) if hasattr(current_user, "role") else ""
    role_str = str(role_val).strip().upper() if role_val else ""
    if role_str == "PRODUCT_ADMIN":
        department = current_user.department

    logger.debug(f"DEBUG_DASHBOARD: current_user.email = {current_user.email}")
    logger.debug(f"DEBUG_DASHBOARD: current_user.role = {role_str}")
    logger.debug(f"DEBUG_DASHBOARD: current_user.department = {department}")
    logger.debug(f"DEBUG_DASHBOARD: input statuses = {statuses}")

    orders = await order_service.list_all_orders(skip=skip, limit=limit, department=department, statuses=statuses)
    
    logger.debug(f"DEBUG_DASHBOARD: number of orders returned = {len(orders)}")

    result = []
    for order in orders:
        payment = await payment_repo.get_by_order_id(order.id)
        result.append(_enrich_order(order, payment))
    return result


@router.patch("/{order_id}/cancel", response_model=OrderRead)
async def cancel_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Cancel an order. Only allowed when status is ORDER_CONFIRMED."""
    order_service = OrderService(db)
    payment_repo = PaymentRepository(db)
    order = await order_service.cancel_order(order_id, current_user.id)
    await db.commit()
    payment = await payment_repo.get_by_order_id(order.id)
    return _enrich_order(order, payment)


@router.patch("/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: uuid.UUID,
    status_in: OrderStatusUpdate,
    current_user: User = Depends(require_roles(["SUPER_ADMIN", "PRODUCT_ADMIN", "SHIPPING_ADMIN", "DELIVERY_ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update an order's status (admins only)."""
    order_service = OrderService(db)
    payment_repo = PaymentRepository(db)
    order = await order_service.update_status(
        order_id, 
        user=current_user, 
        status=status_in.status, 
        notes=status_in.notes,
        tracking_id=status_in.tracking_id,
        courier=status_in.courier
    )
    await db.commit()
    payment = await payment_repo.get_by_order_id(order.id)
    return _enrich_order(order, payment)


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

