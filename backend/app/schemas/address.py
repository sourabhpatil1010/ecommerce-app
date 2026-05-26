"""Address-related Pydantic schemas."""

from uuid import UUID
from datetime import datetime
from typing import Optional

from app.schemas.common import BaseSchema


class AddressBase(BaseSchema):
    """Base schema for Address containing common attributes."""
    full_name: str
    phone: str
    pincode: str
    locality: str
    address_line: str
    city: str
    state: str
    landmark: Optional[str] = None
    alternate_phone: Optional[str] = None
    address_type: str = "Home"


class AddressCreate(AddressBase):
    """Schema for creating a new address."""
    is_default: bool = False


class AddressUpdate(BaseSchema):
    """Schema for updating an address."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    pincode: Optional[str] = None
    locality: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    landmark: Optional[str] = None
    alternate_phone: Optional[str] = None
    address_type: Optional[str] = None
    is_default: Optional[bool] = None


class AddressRead(AddressBase):
    """Schema for reading an address from the DB."""
    id: UUID
    user_id: UUID
    is_default: bool
    created_at: datetime
    updated_at: datetime
