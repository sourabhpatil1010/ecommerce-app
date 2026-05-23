"""Cart and CartItem ORM models."""

import uuid

from sqlalchemy import Integer, ForeignKey, Numeric, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class Cart(Base, UUIDMixin, TimestampMixin):
    """Shopping cart belonging to a user."""

    __tablename__ = "carts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), unique=True, nullable=False
    )

    # Relationships
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    user = relationship("User")


class CartItem(Base, UUIDMixin):
    """Individual line item in a cart."""

    __tablename__ = "cart_items"

    cart_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("carts.id"), nullable=False
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("products.id"), nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
