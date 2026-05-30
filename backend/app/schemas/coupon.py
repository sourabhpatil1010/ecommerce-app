from datetime import datetime
import uuid
from pydantic import BaseModel, Field

class CouponBase(BaseModel):
    code: str
    discount_percentage: float = Field(..., ge=0.01, le=100.0)
    max_discount_amount: float | None = None
    valid_until: datetime | None = None
    is_active: bool = True
    usage_limit: int | None = None

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    is_active: bool | None = None
    valid_until: datetime | None = None
    usage_limit: int | None = None

class CouponRead(CouponBase):
    id: uuid.UUID
    used_count: int
    created_at: datetime

    class Config:
        from_attributes = True
