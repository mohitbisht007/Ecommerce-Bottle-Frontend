"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";

export default function ShopPage() {
  return (
    <Suspense
      fallback={<div className="shop-loading">Loading Collections...</div>}
    >
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
  const [priceRange, setPriceRange] = useState(
    searchParams.get("maxPrice") || 5000
  );

  const currentCategory = searchParams.get("category") || "";
  const currentCapacity = searchParams.get("capacity") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentColor = searchParams.get("color") || "";

  const updateFilter = (filters) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params.set(key, filters[key]);
      else params.delete(key);
    });
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMobileFilterOpen]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/products?${searchParams.toString()}`
        );
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

  const FilterGroups = () => (
    <div className="filter-container">
      <div className="filter-section">
        <h3>Collections</h3>
        <div className="collection-list">
          {["Steel", "Glass", "Copper", "Kids"].map((cat) => (
            <button
              key={cat}
              className={`collection-item ${
                currentCategory === cat ? "active" : ""
              }`}
              onClick={() =>
                updateFilter({ category: currentCategory === cat ? "" : cat })
              }
            >
              <span>{cat} Bottles</span>
              <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section luxury-price-section">
        <div className="filter-header-flex">
          <h3>Price Range</h3>
          <div className="price-input-display">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              onBlur={() => updateFilter({ maxPrice: priceRange })}
              className="price-num-input"
            />
          </div>
        </div>

        <div className="slider-container">
          <div
            className="slider-progress"
            style={{ width: `${((priceRange - 200) / (5000 - 200)) * 100}%` }}
          ></div>
          <input
            type="range"
            min="200"
            max="5000"
            step="100"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            onMouseUp={() => updateFilter({ maxPrice: priceRange })}
            onTouchEnd={() => updateFilter({ maxPrice: priceRange })}
            className="luxury-slider"
          />
        </div>

        <div className="slider-limits">
          <span className="limit-box">Min: ₹200</span>
          <span className="limit-box">Max: ₹5000</span>
        </div>
      </div>
      <div className="filter-section">
        <h3>Color Palette</h3>
        <div className="swatch-row">
          {[
            { name: "Black", hex: "#1a1a1a" },
            { name: "Blue", hex: "#2563eb" },
            { name: "Silver", hex: "#cbd5e1" },
            { name: "Pink", hex: "#db2777" },
            { name: "Green", hex: "#16a34a" },
          ].map((color) => (
            <button
              key={color.name}
              className={`color-dot ${
                currentColor === color.name ? "selected" : ""
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() =>
                updateFilter({
                  color: currentColor === color.name ? "" : color.name,
                })
              }
              title={color.name}
            />
          ))}
        </div>
      </div>
      <div className="filter-section">
        <h3>Size / Capacity</h3>
        <div className="capacity-grid">
          {["500ml", "750ml", "1L", "2L"].map((size) => (
            <button
              key={size}
              className={`capacity-pill ${
                currentCapacity === size ? "active" : ""
              }`}
              onClick={() =>
                updateFilter({ capacity: currentCapacity === size ? "" : size })
              }
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-section">
        <h3>Preferences</h3>
        <div className="preference-list">
          {/* In Stock Toggle */}
          <div
            className={`pref-row ${
              searchParams.get("inStock") === "true" ? "active" : ""
            }`}
            onClick={() =>
              updateFilter({
                inStock: searchParams.get("inStock") === "true" ? "" : "true",
              })
            }
          >
            <div className="pref-info">
              <span className="pref-title">In Stock Only</span>
              <span className="pref-desc">Hide unavailable items</span>
            </div>
            <div className="modern-switch">
              <div className="switch-handle"></div>
            </div>
          </div>

          {/* Insulated Toggle */}
          <div
            className={`pref-row ${
              searchParams.get("insulated") === "true" ? "active" : ""
            }`}
            onClick={() =>
              updateFilter({
                insulated:
                  searchParams.get("insulated") === "true" ? "" : "true",
              })
            }
          >
            <div className="pref-info">
              <span className="pref-title">Insulated</span>
              <span className="pref-desc">Keeps 24h Cold / 12h Hot</span>
            </div>
            <div className="modern-switch">
              <div className="switch-handle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="shop-root">
      <div className="mobile-filter-bar">
        <button onClick={() => setIsMobileFilterOpen(true)} className="m-btn">
          <SlidersHorizontal size={18} /> Filters
        </button>
        <div className="v-divider"></div>
        <select
          value={currentSort}
          onChange={(e) => updateFilter({ sort: e.target.value })}
          className="m-sort"
        >
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Price: Low-High</option>
          <option value="price_desc">Price: High-Low</option>
        </select>
      </div>

      <div className="container shop-layout">
        <aside
          className={`shop-sidebar ${
            isMobileFilterOpen ? "drawer-active" : ""
          }`}
        >
          <div className="sidebar-inner">
            <div className="sidebar-top">
              <h2>Filters</h2>
              <button
                className="close-drawer"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="sidebar-scroll-area">
              <FilterGroups />
            </div>
            {/* THIS BUTTON IS KEY FOR MOBILE */}
            <div className="sidebar-bottom-mobile">
              <button
                className="view-results-btn"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Show {products.length} Results
              </button>
            </div>
          </div>
        </aside>

        <main className="shop-main">
          <div className="shop-header-desktop">
            <div>
              <h1 className="shop-title">
                {currentCategory || "All Collections"}
              </h1>
              <p className="product-count">{products.length} Products Found</p>
            </div>
            <div className="sort-wrapper">
              <span className="sort-label">Sort by</span>
              <select
                value={currentSort}
                onChange={(e) => updateFilter({ sort: e.target.value })}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {products.length > 0 ? (
                products.map((p) => <ProductCard key={p._id} product={p} />)
              ) : (
                <div className="empty-state">
                  <h3>No bottles found</h3>
                  <button
                    onClick={() => router.push("/shop")}
                    className="reset-btn"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {isMobileFilterOpen && (
        <div
          className="overlay-dim"
          onClick={() => setIsMobileFilterOpen(false)}
        ></div>
      )}
    </div>
  );
}
