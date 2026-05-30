import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product, Category } from "@/types";
import { formatCurrency } from "@/utils/currency";

interface ProductDetailViewProps {
  product: Product;
  categories: Category[];
  onEdit?: (product: Product) => void;
}

export function ProductDetailView({ product, categories, onEdit }: ProductDetailViewProps) {
  const navigate = useNavigate();
  const { addItem, items, updateQuantity } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const isOutOfStock = product.stock <= 0;
  const isAdmin = user?.is_superuser === true || user?.role === "SUPER_ADMIN" || user?.role === "PRODUCT_ADMIN";

  const handleAddToCart = async () => {
    if (isOutOfStock || quantity < 1) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const existingItem = items.find((i) => i.product_id === product.id);
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        await addItem(product.id, quantity);
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
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

  // Find Category name
  const categoryName = categories.find((c) => c.id === product.category_id)?.name || "Uncategorized";

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
      
      {/* Product Image Pane (Larger, minimal) */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-50 dark:bg-gray-900 border-none">
        <img
          src={product.image_url || placeholderImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-in-out hover:scale-[1.03]"
          loading="lazy"
        />
        
        {/* Modern floating category badge */}
        <div className="absolute left-6 top-6">
          <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black shadow-sm backdrop-blur-md dark:bg-black/80 dark:text-white">
            {categoryName}
          </span>
        </div>

        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <span className="rounded-full bg-black/90 px-8 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-2xl">
              Out of Stock
            </span>
          </div>
        ) : product.stock < 5 ? (
          <span className="absolute bottom-6 left-6 rounded-full bg-amber-500/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md animate-pulse">
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Product Details Pane */}
      <div className="flex flex-col justify-center py-4 lg:py-0">
        
        {/* Status & Admin Edit */}
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {product.is_active ? "Active" : "Inactive"}
          </span>
          {isAdmin && (
            <button
              onClick={() => onEdit?.(product)}
              className="flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 dark:bg-white dark:text-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
              <span>Edit Details</span>
            </button>
          )}
        </div>

        {/* Premium Typography */}
        <h1 className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl dark:text-white">
          {product.name}
        </h1>

        <p className="mt-6 text-3xl font-semibold tracking-tight text-black dark:text-white">
          {formatCurrency(product.price)}
        </p>

        <div className="mt-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Description</h3>
          <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {product.description || "No detailed description is available for this product. Rest assured, it is made of top-quality materials to meet premium standards."}
          </p>
        </div>

        {/* Action Area */}
        {!isOutOfStock && (
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            
            {/* Minimal Quantity Selector */}
            <div className="flex h-14 items-center self-start rounded-full bg-gray-100 dark:bg-gray-800">
              <button
                type="button"
                onClick={decrementQty}
                disabled={quantity <= 1}
                className="flex h-full w-14 items-center justify-center text-black transition-colors hover:text-gray-600 disabled:opacity-30 dark:text-white dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="w-8 text-center font-bold text-black dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={incrementQty}
                disabled={quantity >= product.stock}
                className="flex h-full w-14 items-center justify-center text-black transition-colors hover:text-gray-600 disabled:opacity-30 dark:text-white dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/login");
                  return;
                }
                toggleWishlist(product.id);
              }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95"
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.5}
                className={`h-6 w-6 ${isWishlisted ? "text-red-500" : "text-black dark:text-white"}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </button>

            {/* Apple/Nike style CTA */}
            <button
              onClick={handleAddToCart}
              className={`flex h-14 flex-grow items-center justify-center gap-2 rounded-full px-8 text-sm font-bold transition-all duration-300 active:scale-[0.98] ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-black text-white hover:bg-gray-800 hover:scale-[1.02] dark:bg-white dark:text-black dark:hover:bg-gray-200"
              }`}
            >
              {added ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
