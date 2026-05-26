"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { useTransition } from "react";
import GenericModal from "@/app/components/GenericModal";
import WhatsAppButton from "./WhatsAppButton";

const extractAvailableColors = (products) => {
  const colorMap = new Map();

  products.forEach(product => {
    product.variants?.forEach(variant => {
      if (variant.baseColorName && variant.colorCode) {
        // Use colorName as key to avoid duplicates like "Black" appearing twice
        colorMap.set(variant.baseColorName, {
          baseColorName: variant.baseColorName,
          hex: variant.colorCode
        });
      }
    });
  });

  // Convert the Map values back into an array
  return Array.from(colorMap.values());
};

const FilterGroups = ({
  currentCategory,
  updateFilter,
  priceRange,
  setPriceRange,
  currentColor,
  availableColors = [],
  currentCapacities = [],
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
      <div className="filter-header">
        <h3>Color Palette</h3>
        {currentColor.length > 0 && (
          <button
            className="clear-sub-filter"
            onClick={() => updateFilter({ color: "" })}
          >
            Reset
          </button>
        )}
      </div>

      <div className="swatch-grid-container">
        {availableColors.map((color) => {
          const isSelected = currentColor.includes(color.baseColorName);
          return (
            <label
              key={color.baseColorName}
              className={`swatch-wrapper ${isSelected ? "is-selected" : ""}`}
              title={color.baseColorName}
            >
              <input
                type="checkbox"
                className="hidden-input"
                checked={isSelected}
                onChange={() => {
                  const newColors = isSelected
                    ? currentColor.filter(c => c !== color.baseColorName)
                    : [...currentColor, color.baseColorName];
                  updateFilter({ color: newColors.join(",") });
                }}
              />
              <div className="swatch-ring">
                <span
                  className="swatch-dot"
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <div className="inner-check" />}
                </span>
              </div>
              <span className="swatch-label">{color.baseColorName}</span>
            </label>
          );
        })}
      </div>
    </div>

    {/* Capacity */}
    <div className="filter-section">
      <div className="filter-header">
        <h3>Size / Capacity</h3>
        {currentCapacities.length > 0 && (
          <button
            className="clear-sub-filter"
            onClick={() => updateFilter({ capacity: "" })}
          >
            Clear
          </button>
        )}
      </div>

      <div className="capacity-selection-grid">
        {["500ml", "750ml", "1L", "2L"].map((size) => {
          const isSelected = currentCapacities.includes(size);
          return (
            <label key={size} className={`capacity-tile ${isSelected ? "is-active" : ""}`}>
              <input
                type="checkbox"
                className="hidden-input"
                checked={isSelected}
                onChange={() => {
                  const newSizes = isSelected
                    ? currentCapacities.filter((s) => s !== size)
                    : [...currentCapacities, size];
                  updateFilter({ capacity: newSizes.join(",") });
                }}
              />
              <span className="tile-content">
                <span className="size-value">{size}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  </div>
);

// --- 2. MAIN COMPONENT ---
export default function ShopClient({
  initialProducts,
  availableCategories,
  totalPages,
  currentPage,
  totalProducts }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const productsRef = useRef(null);

  const [deliveryData, setDeliveryData] = useState(null);

  const [availableColors] = useState(() => extractAvailableColors(initialProducts));

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState(searchParams.get("maxPrice") || 5000);

  const currentCategory = searchParams.get("category") || "";
  const currentCapacity = searchParams.get("capacity") || "";

  const currentCapacities = searchParams.get("capacity")
    ? searchParams.get("capacity").split(",")
    : [];

  const currentSort = searchParams.get("sort") || "newest";

  const rawColor = searchParams.get("color") || "";
  const currentColors = rawColor ? rawColor.split(",") : [];



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
    if (
      !Object.keys(filters).includes("page")
    ) {
      params.set("page", "1");
    }

    startTransition(() => {

      router.push(
        `/shop?${params.toString()}`,
        { scroll: false }
      );

      setTimeout(() => {

        productsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }, 100);

    });
  };


  useEffect(() => {
    // 1. Check if we just came from a successful check
    if (searchParams.get("check") === "success") {
      const saved = localStorage.getItem("delivery_context");
      if (saved) {
        setDeliveryData(JSON.parse(saved));
        setShowSuccessModal(true);

        // 2. Clean the URL (remove ?check=success) without reloading
        const newPath = window.location.pathname;
        window.history.replaceState(null, "", newPath);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMobileFilterOpen]);

  return (
    <div className="shop-root">
      <GenericModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Congratulations!"
        message={`You are eligible for ${deliveryData?.result?.time} delivery in ${deliveryData?.result?.city}.`}
        primaryBtnText="Start Browsing"
        onPrimaryClick={() => setShowSuccessModal(false)}
      />
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
                currentColor={currentColors}
                currentCapacities={currentCapacities}
                availableCategories={availableCategories}
                availableColors={availableColors} // Passing dynamic categories
              />
            </div>

            <div className="sidebar-mobile-footer">
              <button className="apply-btn-mobile" onClick={() => setIsMobileFilterOpen(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        </aside>

        <main className="shop-main">
          <div className="shop-header-desktop">
            <div className="header-left">
              <h1 className="shop-title">{currentCategory || "All Collections"}</h1>
              <p className="product-count">
                {totalProducts} Products Found
              </p>
            </div>

            {/* Moved Sort inside the header for better PC alignment */}
            <div className="sort-wrapper-desktop">
              <span>Sort by:</span>
              <select value={currentSort} onChange={(e) => updateFilter({ sort: e.target.value })}>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div
            ref={productsRef}
            className={`product-grid ${isPending ? "grid-loading" : ""
              }`}
          >
            {initialProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          {totalPages > 1 && (
            <div className="pagination-wrap">

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((page) => (

                <button
                  key={page}

                  className={`page-btn ${currentPage === page
                    ? "active"
                    : ""
                    }`}

                  onClick={() =>
                    updateFilter({
                      page: String(page)
                    })
                  }
                >
                  {page}
                </button>

              ))}
            </div>
          )}
          <WhatsAppButton />
        </main>
      </div>
    </div>
  );
}