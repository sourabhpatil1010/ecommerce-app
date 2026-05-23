import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/types";
import { productsApi } from "@/api";

/**
 * Hook to fetch and manage product listings with pagination and filters.
 */
export function useProducts(params?: Record<string, any>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize parameters to avoid unnecessary triggers on object reference changes
  const paramsKey = JSON.stringify(params);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await productsApi.getProducts(params);
      
      if (data && typeof data === "object" && "items" in data) {
        setProducts(data.items);
        setTotal(data.total);
        setPage(data.page);
        setPages(data.pages);
        setPerPage(data.per_page);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotal(data.length);
        setPage(1);
        setPages(1);
        setPerPage(data.length);
      } else {
        setProducts([]);
        setTotal(0);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    total,
    page,
    pages,
    perPage,
    loading,
    error,
    refetch: fetchProducts,
  };
}
