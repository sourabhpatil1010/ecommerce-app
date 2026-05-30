import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { wishlistApi } from "@/api";
import { useAuth } from "@/hooks/useAuth";

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      wishlistApi.getWishlist()
        .then(res => setWishlistIds(res.data.map((item: any) => item.product_id)))
        .catch(err => console.error("Failed to fetch wishlist", err));
    } else {
      setWishlistIds([]);
    }
  }, [isAuthenticated]);

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated) return;
    
    if (wishlistIds.includes(productId)) {
      setWishlistIds(prev => prev.filter(id => id !== productId));
      try {
        await wishlistApi.removeFromWishlist(productId);
      } catch (err) {
        setWishlistIds(prev => [...prev, productId]); // revert
      }
    } else {
      setWishlistIds(prev => [...prev, productId]);
      try {
        await wishlistApi.addToWishlist(productId);
      } catch (err) {
        setWishlistIds(prev => prev.filter(id => id !== productId)); // revert
      }
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
