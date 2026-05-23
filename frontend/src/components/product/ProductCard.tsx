import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* TODO: product image, name, price, add-to-cart button */}
      <div className="p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-primary-600">${product.price}</p>
      </div>
    </div>
  );
}
