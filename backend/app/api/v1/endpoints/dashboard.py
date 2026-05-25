"""Dashboard endpoints."""

from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardStatsRead
from app.services.dashboard import DashboardService
from app.api.v1.deps import get_current_superuser

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsRead)
async def get_dashboard_stats(
    _: User = Depends(get_current_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get dashboard statistics (admin only)."""
    dashboard_service = DashboardService(db)
    return await dashboard_service.get_stats()
