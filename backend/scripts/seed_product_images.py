"""Seed product images for existing products that don't have any."""
import asyncio
from sqlalchemy import select, func

from app.database import async_session_factory
from app.models.product import Product
from app.models.product_image import ProductImage


PRODUCT_IMAGES_MAP = {
    "wireless-noise-canceling-headphones": [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
        "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80",
    ],
    "smart-fitness-watch-pro": [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
    ],
    "mechanical-gaming-keyboard": [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
    ],
    "4k-ultra-hd-action-camera": [
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
    ],
    "classic-leather-jacket": [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
        "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&q=80",
        "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80",
    ],
    "minimalist-canvas-backpack": [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        "https://images.unsplash.com/photo-1581605405669-fcdf81165571?w=800&q=80",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80",
    ],
    "cotton-crewneck-t-shirt": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    ],
    "stainless-steel-espresso-machine": [
        "https://images.unsplash.com/photo-1517256064527-09c53b2d0c6f?w=800&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    ],
    "cast-iron-dutch-oven": [
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    ],
    "ergonomic-office-chair": [
        "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80",
        "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80",
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80",
    ],
}


async def seed_images():
    async with async_session_factory() as session:
        # Get all products
        result = await session.execute(select(Product))
        products = result.scalars().all()

        for product in products:
            # Check if product already has images
            img_count_result = await session.execute(
                select(func.count()).select_from(ProductImage).where(
                    ProductImage.product_id == product.id
                )
            )
            img_count = img_count_result.scalar_one()

            if img_count == 0 and product.slug in PRODUCT_IMAGES_MAP:
                image_urls = PRODUCT_IMAGES_MAP[product.slug]
                for idx, url in enumerate(image_urls):
                    session.add(ProductImage(
                        product_id=product.id,
                        image_url=url,
                        display_order=idx,
                    ))
                print(f"  [OK] Seeded {len(image_urls)} images for: {product.name}")
            elif img_count > 0:
                print(f"  [SKIP] Already has {img_count} images: {product.name}")
            else:
                print(f"  [WARN] No mapping for: {product.slug}")

        await session.commit()
        print("\n[DONE] Done seeding product images!")


if __name__ == "__main__":
    asyncio.run(seed_images())
