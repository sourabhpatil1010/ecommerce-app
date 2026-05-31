import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsApi } from "@/api";
import { getCategories } from "@/api/categories";
import { Category } from "@/types";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { uploadsApi } from "@/api";

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    is_active: true,
  });

  const [formImages, setFormImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await getCategories();
        let fetchedCategories = catRes.data || [];
        
        // Lock category dropdown to the admin's assigned department
        if (user?.role === "PRODUCT_ADMIN" && user?.department) {
          const adminDept = user.department.trim().toUpperCase();
          fetchedCategories = fetchedCategories.filter(
            (c: Category) => (c.department || "").trim().toUpperCase() === adminDept
          );
        }
        
        setCategories(fetchedCategories);

        // Auto-select the first available category if not in edit mode
        if (!isEditMode && fetchedCategories.length > 0) {
          setFormData(prev => ({ ...prev, category_id: fetchedCategories[0].id }));
        }

        if (isEditMode && id) {
          const productRes = await productsApi.getProduct(id);
          const product = productRes.data;
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price?.toString() || "0",
            stock: product.stock?.toString() || "0",
            category_id: product.category_id || "",
            is_active: product.is_active ?? true,
          });
          // Populate images from the product's images array
          const existingImages = product.images?.map((img: { image_url: string }) => img.image_url) || [];
          if (existingImages.length === 0 && product.image_url) {
            existingImages.push(product.image_url);
          }
          setFormImages(existingImages);
        }
      } catch (err: any) {
        toast.error("Failed to load data: " + (err.response?.data?.detail || "Unknown error"));
      } finally {
        setIsFetching(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Product title cannot be empty");
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    const stockNum = parseInt(formData.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    try {
      setIsLoading(true);
      
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploadRes = await uploadsApi.uploadProductImages(newFiles);
        uploadedUrls = uploadRes.data;
      }
      
      // Combine existing and newly uploaded images
      const allImages = [...formImages, ...uploadedUrls];
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const payload = {
        name: formData.name.trim(),
        slug,
        description: formData.description || null,
        price: priceNum,
        stock: stockNum,
        image_url: allImages[0] || null,
        category_id: formData.category_id || null,
        is_active: formData.is_active,
        images: allImages,
      };

      if (isEditMode && id) {
        await productsApi.updateProduct(id, payload);
        toast.success("Product updated successfully");
      } else {
        await productsApi.createProduct(payload);
        toast.success("Product created successfully");
      }
      navigate("/admin/products");
    } catch (err: any) {
      let errorMessage = "Unknown error";
      const detail = err.response?.data?.detail;
      
      if (Array.isArray(detail)) {
        errorMessage = detail.map((d: any) => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg}`).join(", ");
      } else if (typeof detail === "string") {
        errorMessage = detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(
        isEditMode
          ? `Failed to update product: ${errorMessage}`
          : `Failed to create product: ${errorMessage}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate("/admin/products")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Product" : "Add Product"}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                placeholder="e.g. Premium Wireless Headphones"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ─── Multiple Image Uploads ────────────────────────── */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                The first image will be used as the primary display image.
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex items-center mt-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active (visible to customers)
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              data-testid="product-save-btn"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditMode ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
