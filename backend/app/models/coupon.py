"""Coupon ORM model."""

from datetime import datetime

from sqlalchemy import String, Numeric, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin, TimestampMixin


class Coupon(Base, UUIDMixin, TimestampMixin):
    """A discount coupon for orders."""

    __tablename__ = "coupons"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    discount_percentage: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    max_discount_amount: Mapped[float | None] = mapped_column(Numeric(10, 2))
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    usage_limit: Mapped[int | None] = mapped_column(Integer)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
