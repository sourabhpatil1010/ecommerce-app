"""WishlistItem ORM model."""

import uuid

from sqlalchemy import ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class WishlistItem(Base, UUIDMixin, TimestampMixin):
    """A product saved to a user's wishlist."""

    __tablename__ = "wishlist_items"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("products.id"), nullable=False, index=True
    )

    # Relationships
    user = relationship("User")
    product = relationship("Product")
