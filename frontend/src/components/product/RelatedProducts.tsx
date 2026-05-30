import { useState, useEffect } from "react";
import { productsApi } from "@/api";
import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  productId: string;
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await productsApi.getRelatedProducts(productId);
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load related products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [productId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-16 border-t border-gray-100 dark:border-gray-800 pt-16">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-8">Related Products</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
