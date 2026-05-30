from datetime import datetime
import uuid
from pydantic import BaseModel, Field

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: str | None = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUser(BaseModel):
    id: uuid.UUID
    full_name: str | None = None

    class Config:
        from_attributes = True

class ReviewRead(ReviewBase):
    id: uuid.UUID
    product_id: uuid.UUID
    user_id: uuid.UUID
    is_verified_purchase: bool
    created_at: datetime
    user: ReviewUser | None = None
    
    class Config:
        from_attributes = True
