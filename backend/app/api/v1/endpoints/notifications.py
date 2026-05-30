"""Notification endpoints."""

from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationRead

router = APIRouter()

@router.get("/", response_model=list[NotificationRead])
async def get_notifications(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user's notifications."""
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.put("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Mark a notification as read."""
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    notification.is_read = True
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification
