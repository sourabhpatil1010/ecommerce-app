import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categoriesApi } from "@/api";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";

export function AdminCategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchCategory = async () => {
        try {
          const res = await categoriesApi.getCategory(id);
          const category = res.data;
          setFormData({
            name: category.name || "",
            slug: category.slug || "",
            description: category.description || "",
          });
        } catch (err: any) {
          toast.error(
            "Failed to load category: " +
              (err.response?.data?.detail || "Unknown error")
          );
          navigate("/admin/categories");
        } finally {
          setIsFetching(false);
        }
      };
      fetchCategory();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** Auto-generate slug from name (only when user hasn't manually edited slug) */
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      name: value,
      ...(slugManuallyEdited
        ? {}
        : {
            slug: value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, ""),
          }),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Category slug is required");
      return;
    }

    // Slug format validation
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug.trim())) {
      toast.error(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
      };

      if (isEditMode && id) {
        await categoriesApi.updateCategory(id, payload);
        toast.success("Category updated successfully");
      } else {
        await categoriesApi.createCategory(payload);
        toast.success("Category created successfully");
      }
      navigate("/admin/categories");
    } catch (err: any) {
      let errorMessage = "Unknown error";
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        errorMessage = detail
          .map(
            (d: any) => `${d.loc ? d.loc.join(".") + ": " : ""}${d.msg}`
          )
          .join(", ");
      } else if (typeof detail === "string") {
        errorMessage = detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(
        isEditMode
          ? `Failed to update category: ${errorMessage}`
          : `Failed to create category: ${errorMessage}`
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
          onClick={() => navigate("/admin/categories")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? "Edit Category" : "Add Category"}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
              placeholder="e.g. Electronics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
              placeholder="e.g. electronics"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL-friendly identifier. Auto-generated from name if left
              unchanged.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
              placeholder="Category description..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              data-testid="category-save-btn"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditMode ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
