import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCart();
  const { user } = useAuth();
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isAdmin = user?.is_superuser === true;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const existingItem = items.find((i) => i.product_id === product.id);
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      addItem({
        id: Math.random().toString(36).substring(2, 9),
        product_id: product.id,
        quantity: 1,
        unit_price: product.price,
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const placeholderImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
      
      {/* Admin Badges & Actions */}
      {isAdmin && (
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit?.(product);
            }}
            className="rounded-lg bg-white/90 p-2 text-gray-700 shadow-md backdrop-blur-sm transition-colors hover:bg-primary-500 hover:text-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-primary-600"
            title="Edit Product"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete?.(product.id);
            }}
            className="rounded-lg bg-white/90 p-2 text-gray-700 shadow-md backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-red-600"
            title="Delete Product"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      )}

      {/* Product Image Link */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={product.image_url || placeholderImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Out of stock overlay */}
        {isOutOfStock ? (
          <span className="absolute left-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            Out of Stock
          </span>
        ) : product.stock < 5 ? (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm animate-pulse">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      {/* Product Info & Details */}
      <div className="flex flex-grow flex-col p-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
          {product.is_active ? "Active" : "Draft"}
        </h3>
        <Link to={`/products/${product.id}`} className="mt-1 block flex-grow">
          <h2 className="line-clamp-2 text-base font-semibold text-gray-800 hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400">
            {product.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {product.description || "No description provided for this product."}
          </p>
        </Link>

        {/* Pricing & Add to Cart action */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-200 ${
              isOutOfStock
                ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                : added
                ? "bg-green-600 text-white shadow-green-200/50"
                : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200/50"
            }`}
          >
            {added ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Added!</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
