import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/product";
import { categoriesApi } from "@/api";
import type { Category } from "@/types";

export function HomePage() {
  // Fetch up to 12 products so we can split them into two sections
  const { products, loading, error } = useProducts({ page: 1, per_page: 12 });

  // Fetch categories to pass down for badges
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    categoriesApi.getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error loading categories", err));
  }, []);

  // Split products for different sections
  const featuredProducts = products.slice(0, 4);
  const trendingProducts = products.slice(4, 12);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-16">
      
      {/* Modern Hero Section */}
      <section data-testid="hero-section" className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container-app py-24 sm:py-32 flex flex-col items-center text-center">
          <h1 className="text-5xl font-extrabold tracking-tighter text-black dark:text-white sm:text-6xl lg:text-7xl">
            Redefine your <span className="text-gray-400 dark:text-gray-500">style.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
            Discover the latest collection of premium products. Unbeatable quality, minimalist design.
          </p>
          <div className="mt-10">
            <Link
              to="/products"
              data-testid="hero-shop-btn"
              className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gray-200 dark:shadow-none hover:bg-gray-800 hover:scale-105 transition-all dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </section>

      <div className="container-app pt-16">
        {/* Global Loading / Error States */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black dark:border-gray-800 dark:border-t-white" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <p className="font-semibold">Unable to load collection</p>
            <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 py-24 text-center dark:border-gray-800 mt-8">
            <p className="text-lg font-medium text-black dark:text-white">No products available at the moment.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            
            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
              <section data-testid="featured-section">
                <div className="mb-8 flex items-end justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
                    Featured Collection
                  </h2>
                  <Link
                    to="/products"
                    data-testid="featured-view-all-btn"
                    className="hidden sm:inline-flex items-center justify-center rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-black hover:bg-gray-200 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 transition-colors"
                  >
                    View All
                  </Link>
                </div>
                <ProductGrid products={featuredProducts} categories={categories} />
                <div className="mt-8 flex justify-center sm:hidden">
                  <Link
                    to="/products"
                    data-testid="mobile-view-all-btn"
                    className="inline-flex w-full items-center justify-center rounded-full bg-gray-100 px-5 py-3 text-sm font-medium text-black hover:bg-gray-200 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800 transition-colors"
                  >
                    View All Products
                  </Link>
                </div>
              </section>
            )}

            {/* Trending Products Section */}
            {trendingProducts.length > 0 && (
              <section data-testid="trending-section">
                <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
                    Trending Now
                  </h2>
                </div>
                <ProductGrid products={trendingProducts} categories={categories} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
