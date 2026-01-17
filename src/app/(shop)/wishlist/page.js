"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/app/components/ProductCard";
import { useWishlist } from "@/app/context/WishlistContext";
import { toast } from "react-hot-toast";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
          headers: { Authorization: `JWT ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.wishlist);
        }
      } catch (err) {
        toast.error("Failed to load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistDetails();
  }, [wishlistIds]); // Re-fetch if an item is removed via the heart icon

  console.log(products)

  if (loading) return <div className="wishlist-loader">Syncing your favorites...</div>;

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        {/* Header Section */}
        <header className="wishlist-hero">
          <span className="tiny-label">Personal Collection</span>
          <h1>My Wishlist</h1>
          <p>{products.length} {products.length === 1 ? 'Item' : 'Items'} saved for later</p>
        </header>

        {products.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">♡</div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love to find them easily later.</p>
            <Link href="/shop" className="continue-btn">Explore Shop</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {products.map((product) => (
              <div key={product._id} className="wishlist-item-wrapper">
                 <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}