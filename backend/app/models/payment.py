"""Payment ORM model."""

import uuid

from sqlalchemy import String, Numeric, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class Payment(Base, UUIDMixin, TimestampMixin):
    """Payment record linked to an order."""

    __tablename__ = "payments"

    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("orders.id"), unique=True, nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    status: Mapped[str] = mapped_column(String(50), default="pending")
    provider: Mapped[str | None] = mapped_column(String(50))
    provider_payment_id: Mapped[str | None] = mapped_column(String(255))

    # Relationships
    order = relationship("Order", back_populates="payment")
