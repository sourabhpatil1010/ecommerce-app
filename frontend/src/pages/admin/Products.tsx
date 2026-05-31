import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "@/api";
import { Product } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { TableRowSkeleton, EmptyState, ErrorState } from "@/components/common";
import { PackageX } from "lucide-react";

export function AdminProductsPage() {
  const { user } = useAuth();
  const canManageProducts = user?.role === "SUPER_ADMIN" || user?.role === "PRODUCT_ADMIN";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsApi.getProducts({ page, per_page: 20, admin_view: true });
      setProducts(response.data.items);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsApi.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete product: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
          {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h1>
        {(user?.role === "SUPER_ADMIN" || user?.role === "PRODUCT_ADMIN") && (
          <Link 
            to="/admin/products/new"
            data-testid="admin-add-product-btn"
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Product
          </Link>
        )}
      </div>

      {error ? (
        <ErrorState title="Failed to load products" message={error} onRetry={fetchProducts} showHome={false} />
      ) : (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image_url ? (
                        <img className="h-10 w-10 rounded object-cover" src={product.image_url} alt="" loading="lazy" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 dark:bg-gray-700"></div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{product.category_id ? "Has Category" : "Uncategorized"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.is_active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canManageProducts && (
                      <>
                        <Link to={`/admin/products/edit/${product.id}`} data-testid={`admin-edit-product-${product.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 inline-block">
                          <Edit className="h-5 w-5 inline" />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} data-testid={`admin-delete-product-${product.id}`} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="h-5 w-5 inline" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState 
                      icon={PackageX} 
                      title="No products found" 
                      description="You have not added any products yet."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between sm:px-6">
            {/* Simple pagination indicator for now */}
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
