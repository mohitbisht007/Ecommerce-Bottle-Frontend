"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast"; // Recommended for "Real Work" feedback

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchWishlistIds = async () => {
    const token = localStorage.getItem("token"); 

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `JWT ${token}` },
      });
      const data = await res.json();
    
      if (data.user) {
        const stringIds = (data.user.wishlist || []).map(id =>
          typeof id === 'string' ? id : id._id ? id._id.toString() : id.toString()
        );
        setWishlistIds(stringIds);
      }
    } catch (err) {
      console.error("Reload sync failed:", err);
    }
  };

  useEffect(() => {
    fetchWishlistIds();

    // Custom events for login/logout sync
    window.addEventListener("bottle_auth_changed", fetchWishlistIds);
    return () => window.removeEventListener("bottle_auth_changed", fetchWishlistIds);
  }, []);

  // 2. The Global Toggle Function
  const toggleWishlist = async (productId) => {
    // 1. Check if user exists in localStorage
    const user = JSON.parse(localStorage.getItem("bottle_user") || "null");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      // 2. If not logged in, show a message and stop the function
      toast.error("Please login to save items to your wishlist", {
        icon: '🔒',
      });
      // Optional: router.push('/login') if you want to force them
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      console.log(data)
      if (data.success) {
        const normalized = (data.wishlist || []).map(id =>
          typeof id === "string" ? id : id._id ? id._id.toString() : id.toString()
        );
        setWishlistIds(normalized);
        // data.message will be "Added" or "Removed" from your controller
        toast.success(data.message);
      }
    } catch (err) {
      toast.error("Could not update wishlist");
      console.error(err);
    }
  };

  // Helper to check if a specific product is favorited
  const isItemWishlisted = (id) => {
    if (!id || wishlistIds.length === 0) return false;
    return wishlistIds.some(wishId => String(wishId) === String(id));
  };

  console.log(wishlistIds)

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isItemWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);