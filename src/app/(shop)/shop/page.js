"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="shop-loading">Loading Collections...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Local state for the price slider to make it feel smooth
  const [priceRange, setPriceRange] = useState(searchParams.get("maxPrice") || 5000);

  const currentCategory = searchParams.get("category") || "";
  const currentCapacity = searchParams.get("capacity") || "";
  const currentSort = searchParams.get("sort") || "newest";

  // Unified Filter Function
  const updateFilter = (filters) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.set(key, filters[key]);
      else params.delete(key);
    });
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${searchParams.toString()}`);
        const data = await res.json();
        setProducts(data.items || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [searchParams]);

  // Reusable Filter UI to avoid repeating code for Desktop and Mobile
  const FilterGroups = () => (
    <>
      <div className="filter-group">
        <h3>Collections</h3>
        <div className="filter-options">
          {["Steel", "Glass", "Copper", "Kids"].map(cat => (
            <label key={cat} className="custom-radio">
              <input 
                type="radio" 
                name="category"
                checked={currentCategory === cat}
                onChange={() => updateFilter({ category: cat })}
              />
              <span className="radio-label">{cat} Bottles</span>
            </label>
          ))}
          <button className="clear-btn" onClick={() => updateFilter({ category: "" })}>All Collections</button>
        </div>
      </div>

      <div className="filter-group">
        <h3>Price Range: Up to ₹{priceRange}</h3>
        <input 
          type="range" min="200" max="5000" step="100"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          onMouseUp={() => updateFilter({ maxPrice: priceRange })}
          className="modern-slider"
        />
        <div className="price-labels"><span>₹200</span><span>₹5000</span></div>
      </div>

      <div className="filter-group">
        <h3>Capacity</h3>
        <div className="tag-grid">
          {["500ml", "750ml", "1L", "2L"].map(size => (
            <button 
              key={size}
              className={`tag-btn ${currentCapacity === size ? 'active' : ''}`}
              onClick={() => updateFilter({ capacity: size })}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="shop-page">
      {/* 1. Mobile Top Bar */}
      <div className="mobile-utility-bar">
        <button className="mobile-filter-trigger" onClick={() => setIsMobileFilterOpen(true)}>
          <span>⚙️ Filters & Sorting</span>
        </button>
      </div>

      <div className="container shop-main-layout">
        
        {/* 2. Desktop Sidebar / Mobile Drawer */}
        <aside className={`shop-sidebar ${isMobileFilterOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h2>Filter By</h2>
            <button className="close-sidebar" onClick={() => setIsMobileFilterOpen(false)}>✕</button>
          </div>
          <FilterGroups />
          <div className="mobile-apply-wrapper">
             <button className="apply-btn" onClick={() => setIsMobileFilterOpen(false)}>See {products.length} Products</button>
          </div>
        </aside>

        {/* 3. Product Display Area */}
        <main className="shop-content">
          <header className="content-header">
            <h1 className="page-title">{currentCategory || "All Bottles"}</h1>
            <div className="sorting-box">
              <select value={currentSort} onChange={(e) => updateFilter({ sort: e.target.value })}>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </header>

          {loading ? (
            <div className="grid-placeholder">Loading items...</div>
          ) : (
            <div className="product-grid">
              {products.length > 0 ? (
                products.map(p => <ProductCard key={p._id} product={p} />)
              ) : (
                <div className="no-results">No bottles match your filters.</div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 4. Background Dimmer for Mobile */}
      {isMobileFilterOpen && <div className="sidebar-overlay" onClick={() => setIsMobileFilterOpen(false)}></div>}
    </div>
  );
}