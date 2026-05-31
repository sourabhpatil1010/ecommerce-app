import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { wishlistApi } from "@/api";
import { useAuth, useCart } from "@/hooks";
import { Skeleton, EmptyState, ErrorState } from "@/components/common";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wishlistApi.getWishlist();
      setItems(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleRemove = async (productId: string) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setItems(items.filter(item => item.product_id !== productId));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-app py-16">
        <EmptyState 
          emoji="❤️"
          title="Sign in to view your Wishlist"
          description="Save items you love to your wishlist to easily find them later."
          actionLabel="Log In"
          onAction={() => window.location.href = "/login"}
        />
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">
          My Wishlist
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {items.length} {items.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState 
          title="Could not load wishlist" 
          message={error} 
          onRetry={fetchWishlist} 
        />
      ) : items.length === 0 ? (
        <EmptyState 
          icon={Heart} 
          title="Your wishlist is empty" 
          description="You haven't saved any items yet. Start exploring and add items you love!" 
          actionLabel="Browse Products" 
          onAction={() => window.location.href = "/products"} 
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
          {items.map((item) => (
            <div key={item.id} data-testid={`wishlist-item-${item.product.id}`} className="group relative flex flex-col rounded-2xl bg-white dark:bg-gray-950 p-4 shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg hover:-translate-y-1">
              <Link to={`/product/${item.product.id}`} className="relative block overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 aspect-square">
                <img
                  src={item.product.image_url || "/placeholder.jpg"}
                  alt={item.product.name}
                  loading="lazy"
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/500?text=No+Image'; }}
                />
              </Link>

              <button
                onClick={() => handleRemove(item.product_id)}
                data-testid={`wishlist-remove-${item.product.id}`}
                className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-black/80 backdrop-blur text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="mt-4 flex flex-col flex-1">
                <Link to={`/product/${item.product.id}`} className="block">
                  <h3 className="text-sm font-semibold text-black dark:text-white line-clamp-1 group-hover:underline">
                    {item.product.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-bold text-black dark:text-white">
                    ₹{item.product.price.toLocaleString()}
                  </p>
                  {!item.product.is_active || item.product.stock <= 0 ? (
                    <span className="text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  ) : null}
                </div>
                
                <button
                  onClick={() => addItem(item.product.id, 1)}
                  disabled={!item.product.is_active || item.product.stock <= 0}
                  data-testid={`wishlist-add-to-bag-${item.product.id}`}
                  className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-black dark:bg-white py-2.5 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
