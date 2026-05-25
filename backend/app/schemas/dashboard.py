"""Dashboard-related Pydantic schemas."""

from app.schemas.common import BaseSchema

class DashboardStatsRead(BaseSchema):
    """Schema for returning dashboard statistics."""

    total_users: int
    total_orders: int
    total_revenue: float
    active_products: int
