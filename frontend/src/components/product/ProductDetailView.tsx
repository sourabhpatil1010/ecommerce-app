import type { Product } from "@/types";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* TODO: image gallery, product info, add-to-cart, reviews */}
      <div className="aspect-square rounded-lg bg-gray-100" />
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-2 text-gray-600">{product.description}</p>
        <p className="mt-4 text-2xl font-semibold text-primary-600">
          ${product.price}
        </p>
      </div>
    </div>
  );
}
