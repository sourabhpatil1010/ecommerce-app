import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/product";

export function HomePage() {
  // Fetch up to 12 products so we can split them into two sections
  const { products, loading, error } = useProducts({ page: 1, per_page: 12 });

  // Split products for different sections
  const featuredProducts = products.slice(0, 4);
  const trendingProducts = products.slice(4, 12);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 pt-6">
      <div className="container-app">
        {/* Hero Section */}
        <div className="mb-6 overflow-hidden rounded-sm bg-white shadow-sm dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="bg-primary-50 px-8 py-12 text-center dark:bg-primary-900/20 sm:px-16 sm:py-20 lg:py-24">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
              Welcome to Our Store
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Discover the latest products at unbeatable prices.
            </p>
            <div className="mt-8">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-sm bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow hover:bg-primary-700 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Global Loading / Error States */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
          </div>
        ) : error ? (
          <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            <p className="font-bold">Error loading catalog</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-sm border-2 border-dashed border-gray-300 py-16 text-center bg-white dark:bg-gray-900 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No products available at the moment.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Featured Products Section */}
            {featuredProducts.length > 0 && (
              <div className="rounded-sm bg-white shadow-sm dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    Featured Products
                  </h2>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center rounded-sm bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition-colors"
                  >
                    VIEW ALL
                  </Link>
                </div>
                <ProductGrid products={featuredProducts} />
              </div>
            )}

            {/* Trending Products Section */}
            {trendingProducts.length > 0 && (
              <div className="rounded-sm bg-white shadow-sm dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    Trending Right Now
                  </h2>
                </div>
                <ProductGrid products={trendingProducts} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
