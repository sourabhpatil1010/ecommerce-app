import { useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { ProductGrid } from "@/components/product";
import { categoriesApi, productsApi } from "@/api";
import type { Product } from "@/types";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.is_superuser === true;

  // ─── Filter & Pagination States ──────────────────────────
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest"); // newest, price-low, price-high

  // Apply query parameters (built reactive filter query)
  const queryParams: Record<string, any> = {
    page,
    per_page: 8, // Page size
  };
  if (search.trim()) queryParams.search = search;
  if (selectedCategory) queryParams.category_id = selectedCategory;
  if (minPrice) queryParams.min_price = parseFloat(minPrice);
  if (maxPrice) queryParams.max_price = parseFloat(maxPrice);

  const { products, pages, loading, error, refetch } = useProducts(queryParams);

  // ─── Categories state ──────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    categoriesApi.getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error loading categories", err));
  }, []);

  // ─── Sort products on the frontend for smooth UX ───────
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    // Default newest is handled by backend returning ordered list by created_at desc
    return 0; 
  });

  // ─── Admin Create/Edit Modal State ─────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalError, setModalError] = useState<string | null>(null);
  
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Helpers
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setFormId("");
    setFormName("");
    setFormSlug("");
    setFormPrice("");
    setFormStock("10");
    setFormImageUrl("");
    setFormCategoryId(categories[0]?.id || "");
    setFormDescription("");
    setFormIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setModalMode("edit");
    setFormId(product.id);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormImageUrl(product.image_url || "");
    setFormCategoryId(product.category_id || "");
    setFormDescription(product.description || "");
    setFormIsActive(product.is_active);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const priceNum = parseFloat(formPrice);
    const stockNum = parseInt(formStock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setModalError("Please enter a valid price >= 0");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setModalError("Please enter a valid stock level >= 0");
      return;
    }

    const payload = {
      name: formName,
      slug: formSlug || generateSlug(formName),
      price: priceNum,
      stock: stockNum,
      image_url: formImageUrl.trim() || null,
      category_id: formCategoryId || null,
      description: formDescription.trim() || null,
      is_active: formIsActive,
    };

    try {
      if (modalMode === "create") {
        await productsApi.createProduct(payload);
      } else {
        await productsApi.updateProduct(formId, payload);
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      setModalError(
        err.response?.data?.detail || "An error occurred saving the product."
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsApi.deleteProduct(productId);
        refetch();
      } catch (err: any) {
        alert(err.response?.data?.detail || "Failed to delete product.");
      }
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="container-app py-10">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Discover Products
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Browse our curated selection of high-quality goods.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4.5 w-4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
        
        {/* ─── Sidebar Filters ───────────────────────────────── */}
        <div className="space-y-6 lg:block">
          
          {/* Search Box */}
          <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider dark:text-white">
              Search
            </h3>
            <div className="relative mt-3">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-3 pr-10 text-sm focus:border-primary-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider dark:text-white">
              Categories
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selectedCategory === ""
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filtering */}
          <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider dark:text-white">
              Price Range
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Min ($)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Max ($)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Any"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="w-full rounded-lg border border-gray-350 bg-white py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
          >
            Clear Filters
          </button>
        </div>

        {/* ─── Product Catalog Grid Area ─────────────────────── */}
        <div className="lg:col-span-3">
          
          {/* Sorting and Summary info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Showing {sortedProducts.length} items
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid Render */}
          <div className="mt-6">
            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-950/40 dark:bg-red-950/10 dark:text-red-400">
                <p className="font-bold">Error loading catalog</p>
                <p className="mt-1 text-sm">{error}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 py-16 text-center dark:border-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18" />
                </svg>
                <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">No products found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search criteria or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white hover:bg-primary-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <ProductGrid
                products={sortedProducts}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 border-t border-gray-200 pt-6 dark:border-gray-800">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                <span>Previous</span>
              </button>

              {Array.from({ length: pages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    page === p
                      ? "bg-primary-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
              >
                <span>Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Admin Product Management Modal (Create/Edit Form) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-250 dark:border-gray-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {modalMode === "create" ? "Create Product" : "Edit Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4 p-6 overflow-y-auto max-h-[75vh]">
              {modalError && (
                <div className="rounded-lg bg-red-50 p-3.5 text-sm font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  {modalError}
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (modalMode === "create") {
                      setFormSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g. Mechanical Gaming Keyboard"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Slug URL</label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                  placeholder="e.g. mechanical-gaming-keyboard"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="99.99"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="20"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter detailed description of the product..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="formIsActive" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Visible in customer catalog (Active)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-150 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-750 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-primary-700"
                >
                  {modalMode === "create" ? "Add Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
