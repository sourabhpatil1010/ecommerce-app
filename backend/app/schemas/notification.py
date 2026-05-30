from datetime import datetime
import uuid
from pydantic import BaseModel

class NotificationBase(BaseModel):
    title: str
    message: str

class NotificationCreate(NotificationBase):
    pass

class NotificationRead(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
