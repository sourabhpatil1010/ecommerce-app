import { useState, useEffect } from "react";
import { productsApi } from "@/api";
import { ProductCard } from "./ProductCard";

interface RecentlyViewedProps {
  currentProductId: string;
}

const RECENTLY_VIEWED_KEY = "recently_viewed_products";

export const addRecentlyViewed = (productId: string) => {
  const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
  let viewedIds: string[] = stored ? JSON.parse(stored) : [];
  
  // Remove if exists to move to top
  viewedIds = viewedIds.filter(id => id !== productId);
  viewedIds.unshift(productId);
  
  // Keep only last 8
  viewedIds = viewedIds.slice(0, 8);
  
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(viewedIds));
};

export function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add current product to history
    addRecentlyViewed(currentProductId);

    const fetchRecentlyViewed = async () => {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        const viewedIds: string[] = stored ? JSON.parse(stored) : [];
        
        // Filter out current product
        const idsToFetch = viewedIds.filter(id => id !== currentProductId).slice(0, 4);
        
        if (idsToFetch.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Fetch each product by ID
        const promises = idsToFetch.map(id => productsApi.getProduct(id).catch(() => null));
        const results = await Promise.all(promises);
        
        // Filter out failed requests
        setProducts(results.filter(res => res && res.data).map(res => res!.data));
      } catch (err) {
        console.error("Failed to load recently viewed products", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentlyViewed();
  }, [currentProductId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-16">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-8">Recently Viewed</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
