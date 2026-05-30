"""ProductReview ORM model."""

import uuid

from sqlalchemy import String, Integer, Text, Boolean, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class ProductReview(Base, UUIDMixin, TimestampMixin):
    """A user review for a product."""

    __tablename__ = "product_reviews"

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("products.id"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False) # 1 to 5
    review_text: Mapped[str | None] = mapped_column(Text)
    is_verified_purchase: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    product = relationship("Product")
    user = relationship("User")
