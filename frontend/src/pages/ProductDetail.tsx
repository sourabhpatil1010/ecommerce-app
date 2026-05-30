import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { productsApi, categoriesApi, uploadsApi } from "@/api";
import { ProductDetailView, ProductReviews, RelatedProducts, RecentlyViewed } from "@/components/product";
import type { Product, Category } from "@/types";
import { Skeleton, ErrorState } from "@/components/common";
import { ImageUpload } from "@/components/admin/ImageUpload";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch Product ──────────────────────────────────────
  const fetchProductDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const { data } = await productsApi.getProduct(id);
      setProduct(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Failed to load product details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // ─── Admin Edit Modal States ────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Load categories once for dropdown
  useEffect(() => {
    categoriesApi.getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error loading categories", err));
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleOpenEditModal = () => {
    if (!product) return;
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    
    // Populate images from product.images array, falling back to image_url
    const existingImages = product.images?.map((img) => img.image_url) || [];
    if (existingImages.length === 0 && product.image_url) {
      existingImages.push(product.image_url);
    }
    setFormImages(existingImages);
    setNewFiles([]);
    setFormCategoryId(product.category_id || "");
    setFormDescription(product.description || "");
    setFormIsActive(product.is_active);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
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

    try {
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploadRes = await uploadsApi.uploadProductImages(newFiles);
        uploadedUrls = uploadRes.data;
      }
      
      const allImages = [...formImages, ...uploadedUrls];

      const payload = {
        name: formName,
        slug: formSlug || generateSlug(formName),
        price: priceNum,
        stock: stockNum,
        image_url: allImages[0] || null,
        category_id: formCategoryId || null,
        description: formDescription.trim() || null,
        is_active: formIsActive,
        images: allImages,
      };
      await productsApi.updateProduct(product.id, payload);
      setIsModalOpen(false);
      fetchProductDetails(); // Refresh details page on success
    } catch (err: any) {
      setModalError(
        err.response?.data?.detail || "An error occurred saving the product."
      );
    }
  };

  return (
    <div className="container-app py-12">
      
      {/* Back Link */}
      <div className="mb-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          <span>Back to products catalog</span>
        </Link>
      </div>

      {/* Main Content Pane */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-500">
          <Skeleton className="w-full aspect-square rounded-3xl" />
          <div className="flex flex-col gap-6 py-6">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-3 mt-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-14 w-full mt-8 rounded-full" />
          </div>
        </div>
      ) : error ? (
        <ErrorState 
          title="Product Details Failed" 
          message={error} 
          onRetry={() => fetchProductDetails()} 
        />
      ) : product ? (
        <div className="mx-auto max-w-7xl">
          <ProductDetailView product={product} categories={categories} onEdit={handleOpenEditModal} />
          <RelatedProducts productId={product.id} />
          <RecentlyViewed currentProductId={product.id} />
          <ProductReviews productId={product.id} />
        </div>
      ) : null}

      {/* ─── Admin Edit Modal ───────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Product</h2>
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
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ─── Multiple Image Uploads ────────────────────── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Product Images
                </label>
                <ImageUpload
                  existingImages={formImages}
                  onExistingImagesChange={setFormImages}
                  newFiles={newFiles}
                  onNewFilesChange={setNewFiles}
                  maxFiles={10}
                  maxSizeMB={5}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-bold text-white hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
