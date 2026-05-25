"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.router import api_router
from app.models.base import Base
from app.database import engine
from app.core.logging import setup_logging
from app.core.middleware import RequestLoggingMiddleware

# Initialize logging configuration
setup_logging()


async def seed_data():
    """Seed default admin user, categories and products if database is empty."""
    from sqlalchemy import select, func
    from app.database import async_session_factory
    from app.models.category import Category
    from app.models.product import Product
    from app.models.user import User
    from app.core.security import hash_password

    async with async_session_factory() as session:
        # 1. Seed Admin User
        admin_email = "admin@example.com"
        admin_result = await session.execute(select(User).filter_by(email=admin_email))
        admin_user = admin_result.scalar_one_or_none()
        
        if not admin_user:
            admin_user = User(
                email=admin_email,
                hashed_password=hash_password("AdminSecurePassword123!"),
                full_name="Admin User",
                is_superuser=True,
                is_active=True
            )
            session.add(admin_user)
            await session.commit()

        # 2. Seed Categories
        category_count_result = await session.execute(
            select(func.count()).select_from(Category)
        )
        category_count = category_count_result.scalar_one()

        if category_count == 0:
            categories = [
                Category(name="Electronics", slug="electronics", description="Gadgets, devices, and accessories"),
                Category(name="Clothing", slug="clothing", description="Apparel, shoes, and fashion accessories"),
                Category(name="Home & Kitchen", slug="home-kitchen", description="Appliances, decor, and kitchenware"),
                Category(name="Books", slug="books", description="Novels, textbooks, and guides"),
            ]
            for cat in categories:
                session.add(cat)
            await session.commit()

        # Fetch inserted categories to get their IDs
        cat_list_result = await session.execute(select(Category))
        cat_list = cat_list_result.scalars().all()
        cat_map = {cat.slug: cat.id for cat in cat_list}

        # 3. Seed Products
        product_count_result = await session.execute(
            select(func.count()).select_from(Product)
        )
        product_count = product_count_result.scalar_one()

        if product_count < 10 and cat_map:
            # We define exactly 10 realistic products
            products = [
                # Electronics
                Product(
                    name="Wireless Noise-Canceling Headphones",
                    slug="wireless-noise-canceling-headphones",
                    description="Premium over-ear wireless headphones with advanced active noise canceling, high-fidelity sound, and 30-hour battery life. Perfect for travel, work, or casual listening.",
                    price=299.99,
                    stock=55,
                    image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("electronics"),
                ),
                Product(
                    name="Smart Fitness Watch Pro",
                    slug="smart-fitness-watch-pro",
                    description="Track your heart rate, sleep, steps, and workouts with this elegant fitness watch. Features a built-in GPS, waterproof design, and a vibrant color touchscreen display.",
                    price=189.50,
                    stock=60,
                    image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("electronics"),
                ),
                Product(
                    name="Mechanical Gaming Keyboard",
                    slug="mechanical-gaming-keyboard",
                    description="Tactile RGB backlit mechanical keyboard with blue switches, fully programmable keys, and a comfortable ergonomic wrist rest. Dominate your games with clicky response.",
                    price=89.99,
                    stock=75,
                    image_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("electronics"),
                ),
                Product(
                    name="4K Ultra HD Action Camera",
                    slug="4k-ultra-hd-action-camera",
                    description="Capture your adventures in stunning 4K resolution. Waterproof, durable, and comes with a variety of mounts for helmets, bikes, and surfboards.",
                    price=149.95,
                    stock=50,
                    image_url="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("electronics"),
                ),
                # Clothing
                Product(
                    name="Classic Leather Jacket",
                    slug="classic-leather-jacket",
                    description="Timeless genuine leather jacket featuring a rugged finish, premium metal zippers, multiple utility pockets, and a warm inner lining. Classic style for any season.",
                    price=149.00,
                    stock=65,
                    image_url="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("clothing"),
                ),
                Product(
                    name="Minimalist Canvas Backpack",
                    slug="minimalist-canvas-backpack",
                    description="Durable water-resistant canvas backpack with leather straps. Features a padded laptop sleeve, secret security pocket, and side water bottle compartments.",
                    price=59.95,
                    stock=80,
                    image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("clothing"),
                ),
                Product(
                    name="Cotton Crewneck T-Shirt",
                    slug="cotton-crewneck-t-shirt",
                    description="Essential everyday t-shirt made from 100% organic cotton. Incredibly soft, breathable, and designed for a perfect modern fit.",
                    price=24.50,
                    stock=150,
                    image_url="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("clothing"),
                ),
                # Home & Kitchen
                Product(
                    name="Stainless Steel Espresso Machine",
                    slug="stainless-steel-espresso-machine",
                    description="Bring the cafe experience home. 15-bar professional espresso maker with steam wand for creamy lattes and cappuccinos. Includes filter basket and scoop.",
                    price=249.99,
                    stock=55,
                    image_url="https://images.unsplash.com/photo-1517256064527-09c53b2d0c6f?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("home-kitchen"),
                ),
                Product(
                    name="Cast Iron Dutch Oven",
                    slug="cast-iron-dutch-oven",
                    description="Enameled cast iron dutch oven (5.5 quart) for slow-cooking, roasting, and baking. Exceptional heat retention and distribution with self-basting lid.",
                    price=79.99,
                    stock=60,
                    image_url="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("home-kitchen"),
                ),
                Product(
                    name="Ergonomic Office Chair",
                    slug="ergonomic-office-chair",
                    description="Premium ergonomic mesh chair with adjustable lumbar support, 3D armrests, and a tilt-lock mechanism. Work comfortably all day long.",
                    price=199.00,
                    stock=70,
                    image_url="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80",
                    is_active=True,
                    category_id=cat_map.get("home-kitchen"),
                ),
            ]
            
            # Use a dictionary to easily avoid inserting duplicates
            existing_slugs = await session.execute(select(Product.slug))
            existing_slugs_set = {row[0] for row in existing_slugs.all()}

            for prod in products:
                if prod.category_id is not None and prod.slug not in existing_slugs_set:
                    session.add(prod)
            await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup & shutdown hooks."""
    # Auto-create tables for development
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data if empty
    try:
        await seed_data()
    except Exception as e:
        print(f"Error seeding database: {e}")

    yield
    # TODO: shutdown logic (e.g. close connections)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── Middleware ────────────────────────────────────────
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health-check endpoint."""
    return {"status": "healthy"}
