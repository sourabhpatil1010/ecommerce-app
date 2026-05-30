import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { ProductGrid } from "@/components/product";
import { categoriesApi, productsApi } from "@/api";
import type { Product, Category } from "@/types";
import { ProductCardSkeleton, EmptyState, ErrorState } from "@/components/common";
import { SearchX } from "lucide-react";
import { toast } from "react-hot-toast";

export function ProductsPage() {
  const { user } = useAuth();

  // ─── Filter & Pagination States ──────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest"); // newest, price-low, price-high

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

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
        toast.success("Product deleted successfully");
        refetch();
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Failed to delete product.");
      }
    }
  };

  const handleResetFilters = () => {
    setSearchParams((prev) => {
      prev.delete("search");
      return prev;
    }, { replace: true });
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="container-app py-12">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 pb-10 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white">
            Collection
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Explore our latest arrivals and premium selections.
          </p>
        </div>
        {(user?.role === "SUPER_ADMIN" || user?.role === "PRODUCT_ADMIN") && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 rounded-full bg-black dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4.5 w-4.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-4">
        
        {/* ─── Sidebar Filters ───────────────────────────────── */}
        <div className="space-y-8 lg:block">

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Categories
            </h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedCategory === ""
                    ? "font-semibold text-black dark:text-white bg-gray-100 dark:bg-gray-800/50"
                    : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50"
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
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? "font-semibold text-black dark:text-white bg-gray-100 dark:bg-gray-800/50"
                      : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filtering */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Price Range
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Min (₹)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border-none bg-gray-100/80 p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-900/80 dark:text-white outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Max (₹)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Any"
                  className="mt-1 w-full rounded-xl border-none bg-gray-100/80 p-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-900/80 dark:text-white outline-none transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="w-full rounded-full border border-gray-200 dark:border-gray-800 bg-transparent py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            Clear All
          </button>
        </div>

        {/* ─── Product Catalog Grid Area ─────────────────────── */}
        <div className="lg:col-span-3">
          
          {/* Sorting and Summary info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Showing <span className="text-black dark:text-white font-semibold">{sortedProducts.length}</span> results
            </p>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border-none bg-gray-100/80 px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-black outline-none dark:bg-gray-900/80 dark:focus:ring-white dark:text-white cursor-pointer transition-shadow"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid Render */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : error ? (
              <ErrorState 
                title="Unable to load collection" 
                message={error} 
                onRetry={() => refetch()} 
                showHome={false} 
              />
            ) : sortedProducts.length === 0 ? (
              <EmptyState 
                icon={SearchX} 
                title="No matching products found" 
                description="Try adjusting your search or filters to find what you're looking for." 
                actionLabel="Clear Filters" 
                onAction={handleResetFilters} 
              />
            ) : (
              <ProductGrid
                products={sortedProducts}
                categories={categories}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && pages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white dark:border-gray-800 dark:bg-black dark:text-gray-400 dark:hover:bg-gray-900 dark:disabled:hover:bg-black"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pages }, (_, idx) => idx + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-colors ${
                      page === p
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white dark:border-gray-800 dark:bg-black dark:text-gray-400 dark:hover:bg-gray-900 dark:disabled:hover:bg-black"
              >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6 dark:border-gray-800">
              <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">
                {modalMode === "create" ? "Create Product" : "Edit Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleModalSubmit} className="space-y-5 p-8 overflow-y-auto max-h-[75vh]">
              {modalError && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400">
                  {modalError}
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Name</label>
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
                  placeholder="Product name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Slug URL</label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                  placeholder="product-slug"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Stock</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Product description..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:checked:bg-white dark:checked:border-transparent cursor-pointer"
                />
                <label htmlFor="formIsActive" className="text-sm font-medium text-black dark:text-white cursor-pointer">
                  Visible in store
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
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
