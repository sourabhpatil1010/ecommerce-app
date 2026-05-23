"""Shared schema utilities."""

from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Base schema with ORM mode enabled."""

    model_config = ConfigDict(from_attributes=True)


class TimestampSchema(BaseSchema):
    """Schema mixin for timestamp fields."""

    created_at: datetime
    updated_at: datetime


class IDSchema(BaseSchema):
    """Schema mixin for UUID id field."""

    id: UUID


class PaginationParams(BaseModel):
    """Query params for paginated endpoints."""

    page: int = 1
    per_page: int = 20


class PaginatedResponse(BaseSchema):
    """Wrapper for paginated list responses."""

    total: int
    page: int
    per_page: int
    pages: int
