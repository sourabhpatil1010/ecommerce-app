import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/types";
import { formatCurrency } from "@/utils/currency";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductCard({ product, categoryName, onEdit, onDelete }: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem, items, updateQuantity } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const isOutOfStock = product.stock <= 0;
  const canManageProducts = user?.role === "SUPER_ADMIN" || user?.role === "PRODUCT_ADMIN";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const existingItem = items.find((i) => i.product_id === product.id);
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        await addItem(product.id, 1);
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const placeholderImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80";
  const displayImage = product.images?.[0]?.image_url || product.image_url || placeholderImage;

  return (
    <div className="group flex flex-col relative transition-transform duration-300 hover:-translate-y-1">
      
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative block w-full aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900 rounded-2xl mb-4 group-hover:shadow-2xl transition-all duration-300">
        <img
          src={displayImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {categoryName && (
            <span className="rounded-full bg-white/90 dark:bg-black/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-black dark:text-white backdrop-blur-md shadow-sm">
              {categoryName}
            </span>
          )}
          {isOutOfStock ? (
            <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md shadow-sm">
              Sold Out
            </span>
          ) : product.stock < 5 ? (
            <span className="rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md shadow-sm animate-pulse">
              Low Stock
            </span>
          ) : null}
        </div>

        {/* Admin Actions Overlay */}
        {canManageProducts && (
          <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(product);
              }}
              className="rounded-full bg-white/90 p-2 text-black shadow-md backdrop-blur-md transition-transform hover:scale-110"
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
              className="rounded-full bg-white/90 p-2 text-red-600 shadow-md backdrop-blur-md transition-transform hover:scale-110"
              title="Delete Product"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        )}

        {/* Wishlist Toggle Overlay */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isAuthenticated) {
              navigate("/login");
              return;
            }
            toggleWishlist(product.id);
          }}
          className="absolute right-4 bottom-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition-transform hover:scale-110 opacity-0 group-hover:opacity-100 dark:bg-black/80"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            className={`h-5 w-5 ${isWishlisted ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>
      </Link>

      {/* Product Details */}
      <div className="flex flex-col gap-1 px-1">
        <Link to={`/products/${product.id}`} className="flex justify-between items-start gap-4">
          <h2 className="text-base font-medium text-black dark:text-white line-clamp-1 hover:underline underline-offset-4">
            {product.name}
          </h2>
          <span className="text-base font-bold text-black dark:text-white whitespace-nowrap">
            {formatCurrency(product.price)}
          </span>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
          {product.description || "Premium quality product."}
        </p>

        {/* Add to Cart Action */}
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 active:scale-100"
                : added
                ? "bg-green-500 text-white"
                : "bg-black text-white hover:bg-gray-800 hover:shadow-lg dark:bg-white dark:text-black dark:hover:bg-gray-200"
            }`}
          >
            {added ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>Added to Bag</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
