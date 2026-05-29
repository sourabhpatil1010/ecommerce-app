import type { Product, Category } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  categories?: Category[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductGrid({ products, categories = [], onEdit, onDelete }: ProductGridProps) {
  // Helper to find category name
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return undefined;
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : undefined;
  };

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={getCategoryName(product.category_id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
