import uuid
from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.v1.deps import get_current_active_user
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate, AddressRead
from app.services.address import AddressService

router = APIRouter()


@router.post("/", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
async def create_address(
    address_in: AddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new address."""
    service = AddressService(db)
    return await service.create_address(current_user.id, address_in)


@router.get("/", response_model=list[AddressRead])
async def list_addresses(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List user addresses."""
    service = AddressService(db)
    return await service.get_user_addresses(current_user.id)


@router.get("/{address_id}", response_model=AddressRead)
async def get_address(
    address_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get a specific address."""
    service = AddressService(db)
    return await service.get_address(address_id, current_user.id)


@router.put("/{address_id}", response_model=AddressRead)
async def update_address(
    address_id: uuid.UUID,
    address_in: AddressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update an address."""
    service = AddressService(db)
    return await service.update_address(address_id, current_user.id, address_in)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete an address."""
    service = AddressService(db)
    await service.delete_address(address_id, current_user.id)


@router.put("/{address_id}/default", response_model=AddressRead)
async def set_default_address(
    address_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Set an address as default."""
    service = AddressService(db)
    return await service.set_default(address_id, current_user.id)
