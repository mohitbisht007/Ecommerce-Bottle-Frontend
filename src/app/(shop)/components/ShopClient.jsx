"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { useTransition } from "react";

// --- 1. FilterGroups NOW USES availableCategories ---
const FilterGroups = ({
  currentCategory,
  updateFilter,
  priceRange,
  setPriceRange,
  currentColor,
  currentCapacity,
  availableCategories, // New Prop
}) => (
  <div className="filter-container">
    <div className="filter-section">
      <h3>Collections</h3>
      <div className="collection-list">
        {/* Dynamic Mapping from API */}
        {availableCategories.map((cat) => (
          <button
            key={cat._id}
            className={`collection-item ${currentCategory === cat.name ? "active" : ""}`}
            onClick={() => updateFilter({ category: currentCategory === cat.name ? "" : cat.name })}
          >
            <span>{cat.displayName} Bottles</span>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
    </div>

    {/* ... Price Range, Color Palette, and Capacity sections remain exactly same ... */}
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
          <div className="slider-progress" style={{ width: `${((priceRange - 200) / (5000 - 200)) * 100}%` }}></div>
          <input
            type="range" min="200" max="5000" step="100"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            onMouseUp={() => updateFilter({ maxPrice: priceRange })}
            className="luxury-slider"
          />
        </div>
    </div>
    
    {/* Color Palette */}
    <div className="filter-section">
        <h3>Color Palette</h3>
        <div className="swatch-row">
          {[{ name: "Black", hex: "#1a1a1a" }, { name: "Blue", hex: "#2563eb" }, { name: "Silver", hex: "#cbd5e1" }, { name: "Pink", hex: "#db2777" }, { name: "Green", hex: "#16a34a" }].map((color) => (
            <button
              key={color.name}
              className={`color-dot ${currentColor === color.name ? "selected" : ""}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => updateFilter({ color: currentColor === color.name ? "" : color.name })}
            />
          ))}
        </div>
    </div>

    {/* Capacity */}
    <div className="filter-section">
        <h3>Size / Capacity</h3>
        <div className="capacity-grid">
          {["500ml", "750ml", "1L", "2L"].map((size) => (
            <button
              key={size}
              className={`capacity-pill ${currentCapacity === size ? "active" : ""}`}
              onClick={() => updateFilter({ capacity: currentCapacity === size ? "" : size })}
            >
              {size}
            </button>
          ))}
        </div>
    </div>
  </div>
);

// --- 2. MAIN COMPONENT ---
export default function ShopClient({ initialProducts, availableCategories }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(searchParams.get("maxPrice") || 5000);

  const currentCategory = searchParams.get("category") || "";
  const currentCapacity = searchParams.get("capacity") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentColor = searchParams.get("color") || "";

  const updateFilter = (filters) => {
  const params = new URLSearchParams(searchParams.toString());
  
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      params.set(key, filters[key]);
    } else {
      params.delete(key);
    }
  });

  // Ensure we reset to page 1 if you add pagination later
  if (params.has("page")) params.set("page", "1");

  startTransition(() => {
      router.push(`/shop?${params.toString()}`, { scroll: false });
    });
};

  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMobileFilterOpen]);

  return (
    <div className="shop-root">
      {/* Mobile Bar and Sidebar logic remain same ... */}
      <div className="mobile-filter-bar">
        <button onClick={() => setIsMobileFilterOpen(true)} className="m-btn">
          <SlidersHorizontal size={18} /> Filters
        </button>
        <div className="v-divider"></div>
        <select value={currentSort} onChange={(e) => updateFilter({ sort: e.target.value })} className="m-sort">
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Price: Low-High</option>
          <option value="price_desc">Price: High-Low</option>
        </select>
      </div>

      <div className="container shop-layout">
        <aside className={`shop-sidebar ${isMobileFilterOpen ? "drawer-active" : ""}`}>
          <div className="sidebar-inner">
            <div className="sidebar-top">
              <h2>Filters</h2>
              <button className="close-drawer" onClick={() => setIsMobileFilterOpen(false)}><X size={20} /></button>
            </div>
            <div className="sidebar-scroll-area">
              <FilterGroups
                currentCategory={currentCategory}
                updateFilter={updateFilter}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                currentColor={currentColor}
                currentCapacity={currentCapacity}
                availableCategories={availableCategories} // Passing dynamic categories
              />
            </div>
          </div>
        </aside>

        <main className="shop-main">
          <div className="shop-header-desktop">
            <h1 className="shop-title">{currentCategory || "All Collections"}</h1>
            <p className="product-count">{initialProducts.length} Products Found</p>
            {/* Sort Dropdown... */}
          </div>

          <div className={`product-grid ${isPending ? "grid-loading" : ""}`}>
            {initialProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </main>
      </div>
    </div>
  );
}