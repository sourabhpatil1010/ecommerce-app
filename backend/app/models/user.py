"""User ORM model."""

import enum
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    PRODUCT_ADMIN = "PRODUCT_ADMIN"
    SHIPPING_ADMIN = "SHIPPING_ADMIN"
    DELIVERY_ADMIN = "DELIVERY_ADMIN"
    CUSTOMER = "CUSTOMER"


class Department(str, enum.Enum):
    ELECTRONICS = "ELECTRONICS"
    FASHION = "FASHION"
    GROCERY = "GROCERY"
    FURNITURE = "FURNITURE"
    BEAUTY = "BEAUTY"
    HOME_KITCHEN = "HOME_KITCHEN"


class User(Base, UUIDMixin, TimestampMixin):
    """Application user account."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    role: Mapped[str] = mapped_column(String(50), default=UserRole.CUSTOMER.value)
    department: Mapped[str | None] = mapped_column(String(50))
    
    addresses: Mapped[list["Address"]] = relationship(back_populates="user", cascade="all, delete-orphan")
