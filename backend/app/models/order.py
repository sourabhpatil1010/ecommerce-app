"""Order and OrderItem ORM models."""

import uuid
import enum

from sqlalchemy import String, Integer, ForeignKey, Numeric, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class OrderStatus(str, enum.Enum):
    CHECKOUT_CREATED = "CHECKOUT_CREATED"
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS"
    ORDER_CONFIRMED = "ORDER_CONFIRMED"
    SHIPPED = "SHIPPED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    # New Phase 1 Statuses
    PLACED = "PLACED"
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PACKED = "PACKED"
    FAILED = "FAILED"
    RETURNED = "RETURNED"


class Order(Base, UUIDMixin, TimestampMixin):
    """A completed customer order."""

    __tablename__ = "orders"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), default=OrderStatus.CHECKOUT_CREATED.value)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    shipping_address: Mapped[str | None] = mapped_column(String(500))
    tracking_id: Mapped[str | None] = mapped_column(String(100))
    courier: Mapped[str | None] = mapped_column(String(100))
    coupon_code: Mapped[str | None] = mapped_column(String(50))
    discount_amount: Mapped[float | None] = mapped_column(Numeric(12, 2))
    shipping_cost: Mapped[float | None] = mapped_column(Numeric(12, 2), default=0)
    tax_amount: Mapped[float | None] = mapped_column(Numeric(12, 2), default=0)

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    user = relationship("User")
    payment = relationship("Payment", back_populates="order", uselist=False)
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base, UUIDMixin):
    """Individual line item in an order."""

    __tablename__ = "order_items"

    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("orders.id"), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class OrderStatusHistory(Base, UUIDMixin, TimestampMixin):
    """Tracks changes to an order's status."""

    __tablename__ = "order_status_history"

    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("orders.id"), nullable=False
    )
    old_status: Mapped[str | None] = mapped_column(String(50))
    new_status: Mapped[str] = mapped_column(String(50), nullable=False)
    changed_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("users.id")
    )
    notes: Mapped[str | None] = mapped_column(String(500))

    # Relationships
    order = relationship("Order", back_populates="status_history")
    user = relationship("User")
