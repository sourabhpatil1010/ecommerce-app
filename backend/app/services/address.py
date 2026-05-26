"""Service layer for managing addresses."""

import uuid
from typing import Sequence
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


class AddressService:
    """Service handling business logic for addresses."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_address(self, user_id: uuid.UUID, address_in: AddressCreate) -> Address:
        """Create a new address for a user."""
        # If this is the user's first address or is_default is true, handle defaults
        stmt = select(Address).where(Address.user_id == user_id)
        result = await self.db.execute(stmt)
        existing_addresses = result.scalars().all()
        
        is_default = address_in.is_default
        if not existing_addresses:
            is_default = True
            
        if is_default and existing_addresses:
            # Unset default for existing
            await self.db.execute(
                update(Address)
                .where(Address.user_id == user_id)
                .values(is_default=False)
            )

        address = Address(
            user_id=user_id,
            full_name=address_in.full_name,
            phone=address_in.phone,
            pincode=address_in.pincode,
            locality=address_in.locality,
            address_line=address_in.address_line,
            city=address_in.city,
            state=address_in.state,
            landmark=address_in.landmark,
            alternate_phone=address_in.alternate_phone,
            address_type=address_in.address_type,
            is_default=is_default
        )
        self.db.add(address)
        await self.db.commit()
        await self.db.refresh(address)
        return address

    async def get_user_addresses(self, user_id: uuid.UUID) -> Sequence[Address]:
        """Get all addresses for a user."""
        stmt = select(Address).where(Address.user_id == user_id).order_by(Address.created_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_address(self, address_id: uuid.UUID, user_id: uuid.UUID) -> Address:
        """Get a specific address."""
        stmt = select(Address).where(Address.id == address_id, Address.user_id == user_id)
        result = await self.db.execute(stmt)
        address = result.scalar_one_or_none()
        if not address:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found",
            )
        return address

    async def update_address(self, address_id: uuid.UUID, user_id: uuid.UUID, address_in: AddressUpdate) -> Address:
        """Update an existing address."""
        address = await self.get_address(address_id, user_id)
        
        update_data = address_in.model_dump(exclude_unset=True)
        
        if update_data.get("is_default"):
            # Unset default for others
            await self.db.execute(
                update(Address)
                .where(Address.user_id == user_id)
                .where(Address.id != address_id)
                .values(is_default=False)
            )
            
        for field, value in update_data.items():
            setattr(address, field, value)
            
        await self.db.commit()
        await self.db.refresh(address)
        return address

    async def delete_address(self, address_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Delete an address."""
        address = await self.get_address(address_id, user_id)
        was_default = address.is_default
        
        await self.db.delete(address)
        await self.db.commit()
        
        # If default was deleted, make another one default
        if was_default:
            addresses = await self.get_user_addresses(user_id)
            if addresses:
                addresses[0].is_default = True
                await self.db.commit()

    async def set_default(self, address_id: uuid.UUID, user_id: uuid.UUID) -> Address:
        """Set an address as default."""
        address = await self.get_address(address_id, user_id)
        
        if not address.is_default:
            await self.db.execute(
                update(Address)
                .where(Address.user_id == user_id)
                .where(Address.id != address_id)
                .values(is_default=False)
            )
            address.is_default = True
            await self.db.commit()
            await self.db.refresh(address)
            
        return address
