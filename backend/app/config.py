"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Global application settings."""

    # ─── App ───────────────────────────────────────────
    APP_NAME: str = "E-Commerce API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # ─── Database ──────────────────────────────────────
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://ecommerce_user:changeme@localhost:5432/ecommerce_db"
    )

    # ─── Auth / JWT ────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── Stripe Payments ────────────────────────────────
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # ─── Razorpay Payments ──────────────────────────────
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    RAZORPAY_CURRENCY_CONVERSION_RATE: float = 80.0

    # ─── CORS ──────────────────────────────────────────
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
