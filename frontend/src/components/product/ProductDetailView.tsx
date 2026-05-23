import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";

interface ProductDetailViewProps {
  product: Product;
  onEdit?: (product: Product) => void;
}

export function ProductDetailView({ product, onEdit }: ProductDetailViewProps) {
  const { addItem, items, updateQuantity } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isAdmin = user?.is_superuser === true;

  const handleAddToCart = () => {
    if (isOutOfStock || quantity < 1) return;

    const existingItem = items.find((i) => i.product_id === product.id);
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + quantity);
    } else {
      addItem({
        id: Math.random().toString(36).substring(2, 9),
        product_id: product.id,
        quantity: quantity,
        unit_price: product.price,
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const placeholderImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80";

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      
      {/* Product Image Pane */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200/60 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <img
          src={product.image_url || placeholderImage}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="rounded-xl bg-black/85 px-6 py-3 text-lg font-bold uppercase tracking-widest text-white shadow-xl">
              Out of Stock
            </span>
          </div>
        ) : product.stock < 5 ? (
          <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md animate-pulse">
            Only {product.stock} items left
          </span>
        ) : null}
      </div>

      {/* Product Details Pane */}
      <div className="flex flex-col justify-center">
        
        {/* Category & Status */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-400">
            Active Catalog Item
          </span>
          {isAdmin && (
            <button
              onClick={() => onEdit?.(product)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-primary-950/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
              <span>Edit Details</span>
            </button>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          {product.name}
        </h1>

        <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          ${product.price.toFixed(2)}
        </p>

        <div className="mt-6 border-t border-gray-150 pt-6 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Description</h3>
          <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {product.description || "No description has been detailed for this product yet. Rest assured, it is made of top quality components."}
          </p>
        </div>

        <div className="mt-8 border-t border-gray-150 pt-6 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Availability</span>
            {isOutOfStock ? (
              <span className="text-sm font-bold text-red-600 dark:text-red-400">Temporarily Sold Out</span>
            ) : (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                In Stock ({product.stock} available)
              </span>
            )}
          </div>
        </div>

        {/* Quantity and Actions */}
        {!isOutOfStock && (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            
            {/* Quantity Selector */}
            <div className="flex items-center self-start rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
              <button
                type="button"
                onClick={decrementQty}
                disabled={quantity <= 1}
                className="flex h-11 w-11 items-center justify-center text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="w-10 text-center font-semibold text-gray-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={incrementQty}
                disabled={quantity >= product.stock}
                className="flex h-11 w-11 items-center justify-center text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className={`flex h-11 flex-grow items-center justify-center gap-2 rounded-lg px-6 font-bold shadow-md transition-all duration-200 ${
                added
                  ? "bg-green-600 text-white shadow-green-200/50"
                  : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200/50"
              }`}
            >
              {added ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Added {quantity} to Cart!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
