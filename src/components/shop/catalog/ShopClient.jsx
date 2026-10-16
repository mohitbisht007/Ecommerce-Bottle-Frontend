
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  RotateCcw,
  Check,
  Package,
  Star,
} from "lucide-react";

import ProductCard from "@/components/shop/catalog/ProductCard";
import GenericModal from "@/components/ui/GenericModal";
import WhatsAppButton from "@/components/shop/home/WhatsAppButton";

const FEATURE_OPTIONS = [
  { value: "insulated", label: "Insulated" },
  { value: "leakproof", label: "Leakproof" },
  { value: "dishwasherSafe", label: "Dishwasher safe" },
  { value: "rustProof", label: "Rust resistant" },
  { value: "condensationFree", label: "Condensation free" },
  { value: "carHolderFit", label: "Fits car holders" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest arrivals" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Top rated" },
];

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

/* Converts values such as 500ml, 750 ml, 1L and 1.5 litres to ml. */
function capacityToMl(value) {
  const match = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/,/g, "")
    .match(/^([\d.]+)\s*(ml|milliliters?|l|liters?|litres?)?$/);

  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2] || "ml";

  if (!Number.isFinite(amount) || amount <= 0) return null;

  return unit.startsWith("l") ? amount * 1000 : amount;
}

const CAPACITY_GROUPS = [
  {
    id: "under500",
    label: "Under 500 ml",
    description: "Compact & easy to carry",
    matches: (ml) => ml < 500,
  },
  {
    id: "500to750",
    label: "500–750 ml",
    description: "Everyday hydration",
    matches: (ml) => ml >= 500 && ml <= 750,
  },
  {
    id: "750to1000",
    label: "750 ml–1 litre",
    description: "For work and workouts",
    matches: (ml) => ml > 750 && ml <= 1000,
  },
  {
    id: "1000to1500",
    label: "1–1.5 litres",
    description: "Stay hydrated for longer",
    matches: (ml) => ml > 1000 && ml <= 1500,
  },
  {
    id: "1500plus",
    label: "1.5 litres and above",
    description: "High-capacity bottles",
    matches: (ml) => ml > 1500,
  },
];

function getCapacityGroups(capacities = []) {
  return CAPACITY_GROUPS.map((group) => ({
    ...group,
    values: capacities.filter((capacity) => {
      const ml = capacityToMl(capacity);
      return ml !== null && group.matches(ml);
    }),
  })).filter((group) => group.values.length > 0);
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-stone-200 py-5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-stone-900">
          {title}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-stone-500 transition-transform ${open ? "" : "-rotate-90"
            }`}
        />
      </button>

      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

function CheckboxOption({ label, checked, onChange, count }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />

      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition ${checked
            ? "border-stone-900 bg-stone-900 text-white"
            : "border-stone-300 bg-white group-hover:border-stone-500"
          }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>

      <span className="flex-1 text-sm text-stone-600 transition group-hover:text-stone-950">
        {label}
      </span>

      {count != null && (
        <span className="text-xs text-stone-400">{count}</span>
      )}
    </label>
  );
}

function FilterGroups({
  categories = [],
  filters = {},
  selected,
  priceRange,
  setPriceRange,
  updateFilter,
}) {
  const colors = filters.colors || [];
  const capacities = filters.capacities || [];
  const materials = filters.materials || [];
  const maxPrice = Math.max(200, Number(filters.maxPrice) || 5000);
  const capacityGroups = getCapacityGroups(capacities);

  const selectedColors = selected.color
    ? selected.color.split(",").filter(Boolean)
    : [];

  const selectedCapacities = selected.capacity
    ? selected.capacity.split(",").filter(Boolean)
    : [];

  const selectedMaterials = selected.material
    ? selected.material.split(",").filter(Boolean)
    : [];

  const selectedFeatures = selected.feature
    ? selected.feature.split(",").filter(Boolean)
    : [];

  const toggleMultiValue = (key, currentValues, value) => {
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateFilter({ [key]: nextValues.join(",") });
  };

  return (
    <div>
      {/* Collections */}
      <FilterSection title="Collections">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateFilter({ category: "" })}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${!selected.category
                ? "bg-stone-100 font-semibold text-stone-950"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
              }`}
          >
            <span>All collections</span>
            {!selected.category && <Check size={15} />}
          </button>

          {categories.map((category) => {
            const name = category.name || category.slug || "";
            const label =
              category.displayName || category.name || category.slug || "";

            return (
              <button
                key={category._id || name}
                type="button"
                onClick={() =>
                  updateFilter({
                    category: selected.category === name ? "" : name,
                  })
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${selected.category === name
                    ? "bg-stone-100 font-semibold text-stone-950"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                  }`}
              >
                <span>{label}</span>
                {selected.category === name ? (
                  <Check size={15} />
                ) : (
                  <ChevronRight size={15} className="text-stone-400" />
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price range">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-stone-500">Maximum price</span>

          <div className="flex items-center rounded-lg border border-stone-200 px-2.5 py-1.5 focus-within:border-stone-500">
            <span className="mr-1 text-sm text-stone-500">₹</span>
            <input
              type="number"
              min="200"
              max={maxPrice}
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              onBlur={() => {
                const value = Math.min(
                  maxPrice,
                  Math.max(200, Number(priceRange) || 200)
                );
                setPriceRange(String(value));
                updateFilter({ maxPrice: String(value) });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className="w-20 bg-transparent text-right text-sm font-semibold text-stone-900 outline-none"
            />
          </div>
        </div>

        <input
          type="range"
          min="200"
          max={maxPrice}
          step="100"
          value={Math.min(
            maxPrice,
            Math.max(200, Number(priceRange) || 200)
          )}
          onChange={(event) => setPriceRange(event.target.value)}
          onMouseUp={(event) =>
            updateFilter({ maxPrice: event.currentTarget.value })
          }
          onTouchEnd={() =>
            updateFilter({
              maxPrice: String(
                Math.min(
                  maxPrice,
                  Math.max(200, Number(priceRange) || 200)
                )
              ),
            })
          }
          className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900"
          aria-label="Maximum price"
        />

        <div className="mt-2 flex justify-between text-xs text-stone-500">
          <span>₹200</span>
          <span>{formatPrice(maxPrice)}</span>
        </div>
      </FilterSection>

      {/* Color */}
      {colors.length > 0 && (
        <FilterSection title="Color">
          <div className="grid grid-cols-3 gap-x-2 gap-y-4">
            {colors.map((color) => {
              const name = color.baseColorName;
              const hex = color.hex || "#D6D3D1";
              const checked = selectedColors.includes(name);

              return (
                <label
                  key={name}
                  title={name}
                  className="group flex cursor-pointer flex-col items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleMultiValue("color", selectedColors, name)
                    }
                    className="sr-only"
                  />

                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white p-1 transition ${checked
                        ? "border-stone-900 ring-2 ring-stone-300 ring-offset-2"
                        : "border-stone-200 group-hover:border-stone-500"
                      }`}
                  >
                    <span
                      className="flex h-full w-full items-center justify-center rounded-full border border-black/10"
                      style={{ backgroundColor: hex }}
                    >
                      {checked && (
                        <Check
                          size={16}
                          className={
                            ["#ffffff", "#fff", "white"].includes(
                              hex.toLowerCase()
                            )
                              ? "text-stone-900"
                              : "text-white drop-shadow"
                          }
                        />
                      )}
                    </span>
                  </span>

                  <span className="text-center text-xs text-stone-600">
                    {name}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Friendly capacity ranges */}
      {capacityGroups.length > 0 && (
        <FilterSection title="Bottle capacity">
          <div className="space-y-2">
            {capacityGroups.map((group) => {
              const checked = group.values.every((capacity) =>
                selectedCapacities.includes(capacity)
              );

              return (
                <label
                  key={group.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${checked
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-200 hover:border-stone-400"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const nextCapacities = checked
                        ? selectedCapacities.filter(
                          (capacity) => !group.values.includes(capacity)
                        )
                        : [
                          ...new Set([
                            ...selectedCapacities,
                            ...group.values,
                          ]),
                        ];

                      updateFilter({
                        capacity: nextCapacities.join(","),
                      });
                    }}
                    className="h-4 w-4 accent-stone-900"
                  />

                  <span className="flex-1">
                    <span className="block text-sm font-medium text-stone-800">
                      {group.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-stone-500">
                      {group.description}
                    </span>
                  </span>

                  {checked && (
                    <Check size={16} className="text-stone-900" />
                  )}
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Material */}
      {materials.length > 0 && (
        <FilterSection title="Material">
          <div className="space-y-1">
            {materials.map((material) => (
              <CheckboxOption
                key={material}
                label={material}
                checked={selectedMaterials.includes(material)}
                onChange={() =>
                  toggleMultiValue("material", selectedMaterials, material)
                }
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Features */}
      <FilterSection title="Features">
        <div className="space-y-1">
          {FEATURE_OPTIONS.map((feature) => (
            <CheckboxOption
              key={feature.value}
              label={feature.label}
              checked={selectedFeatures.includes(feature.value)}
              onChange={() =>
                toggleMultiValue(
                  "feature",
                  selectedFeatures,
                  feature.value
                )
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <CheckboxOption
          label="In stock only"
          checked={selected.inStock === "true"}
          onChange={() =>
            updateFilter({
              inStock: selected.inStock === "true" ? "" : "true",
            })
          }
        />

        <div className="mt-3 border-t border-stone-100 pt-3">
          <CheckboxOption
            label="Personalizable"
            checked={selected.customizable === "true"}
            onChange={() =>
              updateFilter({
                customizable:
                  selected.customizable === "true" ? "" : "true",
              })
            }
          />
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Customer rating">
        <div className="space-y-1">
          {[4, 3, 2].map((rating) => (
            <label
              key={rating}
              className="flex cursor-pointer items-center gap-3 py-2"
            >
              <input
                type="radio"
                name="minRating"
                checked={selected.minRating === String(rating)}
                onChange={() =>
                  updateFilter({
                    minRating:
                      selected.minRating === String(rating)
                        ? ""
                        : String(rating),
                  })
                }
                className="h-4 w-4 accent-stone-900"
              />

              <span className="flex items-center gap-1 text-sm text-stone-600">
                <span className="font-medium text-stone-800">
                  {rating}+
                </span>
                <span className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={13}
                      fill={index < rating ? "currentColor" : "none"}
                    />
                  ))}
                </span>
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

export default function ShopClient({
  initialProducts = [],
  availableCategories = [],
  availableFilters = {},
  totalPages = 1,
  currentPage = 1,
  totalProducts = 0,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const productsSectionRef = useRef(null);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [priceRange, setPriceRange] = useState(
    searchParams.get("maxPrice") ||
    String(availableFilters.maxPrice || 5000)
  );

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);

  const selected = {
    category: searchParams.get("category") || "",
    color: searchParams.get("color") || "",
    capacity: searchParams.get("capacity") || "",
    material: searchParams.get("material") || "",
    feature: searchParams.get("feature") || "",
    inStock: searchParams.get("inStock") || "",
    customizable: searchParams.get("customizable") || "",
    minRating: searchParams.get("minRating") || "",
    maxPrice:
      searchParams.get("maxPrice") ||
      String(availableFilters.maxPrice || 5000),
    sort: searchParams.get("sort") || "newest",
    q: searchParams.get("q") || "",
  };

  useEffect(() => {
    setSearchInput(searchParams.get("q") || "");
    setPriceRange(
      searchParams.get("maxPrice") ||
      String(availableFilters.maxPrice || 5000)
    );
  }, [searchParams, availableFilters.maxPrice]);

  useEffect(() => {
    if (searchParams.get("check") !== "success") return;

    try {
      const saved = localStorage.getItem("delivery_context");

      if (saved) {
        setDeliveryData(JSON.parse(saved));
        setShowSuccessModal(true);
      }

      const params = new URLSearchParams(searchParams.toString());
      params.delete("check");

      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        query
          ? `${window.location.pathname}?${query}`
          : window.location.pathname
      );
    } catch (error) {
      console.error("Unable to load delivery information:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    document.body.style.overflow = isMobileFilterOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);


  const updateFilter = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    if (!Object.prototype.hasOwnProperty.call(updates, "page")) {
      params.set("page", "1");
    }

    const query = params.toString();
    const destination = query ? `/shop?${query}` : "/shop";

    startTransition(() => {
      router.push(destination, { scroll: false });
    });
  };


  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      productsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [searchParams]);

  const clearFilters = () => {
    const params = new URLSearchParams();

    if (selected.sort !== "newest") {
      params.set("sort", selected.sort);
    }

    params.set("page", "1");

    startTransition(() => {
      router.push(`/shop?${params.toString()}`, { scroll: false });
    });
  };

  const submitSearch = (event) => {
    event.preventDefault();
    updateFilter({ q: searchInput.trim() });
  };

  const activeFilterCount = [
    selected.category,
    selected.color,
    selected.capacity,
    selected.material,
    selected.feature,
    selected.inStock === "true" ? "inStock" : "",
    selected.customizable === "true" ? "customizable" : "",
    selected.minRating,
    selected.q,
    searchParams.has("maxPrice") ? selected.maxPrice : "",
  ].filter(Boolean).length;

  const selectedColors = selected.color
    ? selected.color.split(",").filter(Boolean)
    : [];

  /*
   * Pick the selected color variant for the card.
   * The matching variant is moved to the front, and its image becomes
   * the thumbnail. This keeps the product identity unchanged.
   */
  const displayProducts = initialProducts.map((product) => {
    const matchingVariant = selectedColors.length
      ? product.variants?.find((variant) =>
        selectedColors.includes(variant.baseColorName)
      )
      : null;

    if (!matchingVariant) return product;

    const variantImages = Array.isArray(matchingVariant.images)
      ? matchingVariant.images.filter(Boolean)
      : [];

    const displayImage = variantImages[0] || product.thumbnail;

    return {
      ...product,
      thumbnail: displayImage,
      variants: [
        matchingVariant,
        ...(product.variants || []).filter(
          (variant) => variant !== matchingVariant
        ),
      ],
    };
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900">
      <GenericModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Congratulations!"
        message={`You are eligible for ${deliveryData?.result?.time || "express"
          } delivery in ${deliveryData?.result?.city || "your area"}.`}
        primaryBtnText="Start Browsing"
        onPrimaryClick={() => setShowSuccessModal(false)}
      />

      <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pt-12">
        <header className="mb-8 border-b border-stone-200 pb-7 sm:mb-10">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
            <span>Home</span>
            <ChevronRight size={13} />
            <span className="text-stone-900">Shop</span>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                Find your everyday essential
              </p>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {selected.category || "Shop all bottles"}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
                Thoughtfully designed bottles for work, workouts, travel and
                everything in between.
              </p>
            </div>

            <form
              onSubmit={submitSearch}
              className="flex w-full max-w-md items-center rounded-xl border border-stone-200 bg-white p-1.5 focus-within:border-stone-500"
            >
              <Search size={18} className="ml-2 shrink-0 text-stone-400" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search bottles..."
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-stone-400"
              />

              <button
                type="submit"
                className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                Search
              </button>
            </form>
          </div>
        </header>

        {/* Mobile controls */}
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium"
          >
            <SlidersHorizontal size={17} />
            Filters

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={selected.sort}
            onChange={(event) => updateFilter({ sort: event.target.value })}
            aria-label="Sort products"
            className="max-w-[65%] rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)] xl:gap-10">
          {/* Desktop filters */}
          <aside className="sticky top-5 hidden rounded-2xl border border-stone-200 bg-white px-5 lg:block">
            <div className="flex items-center justify-between border-b border-stone-200 py-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={17} />
                <h2 className="text-base font-semibold">Filters</h2>

                {activeFilterCount > 0 && (
                  <span className="text-xs text-stone-500">
                    ({activeFilterCount})
                  </span>
                )}
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-stone-500 underline underline-offset-4 hover:text-stone-900"
                >
                  Clear all
                </button>
              )}
            </div>

            <FilterGroups
              categories={availableCategories}
              filters={availableFilters}
              selected={selected}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              updateFilter={updateFilter}
            />
          </aside>

          {/* Mobile filter drawer */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsMobileFilterOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              />

              <div className="absolute inset-y-0 right-0 flex w-full max-w-[390px] flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                  <div>
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Refine your selection
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    aria-label="Close filters"
                    className="rounded-full border border-stone-200 p-2 hover:bg-stone-50"
                  >
                    <X size={19} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5">
                  <FilterGroups
                    categories={availableCategories}
                    filters={availableFilters}
                    selected={selected}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    updateFilter={updateFilter}
                  />
                </div>

                <div className="flex gap-3 border-t border-stone-200 p-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium"
                  >
                    <RotateCcw size={15} />
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex flex-[1.5] items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-700"
                  >
                    Show {totalProducts} products
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <main ref={productsSectionRef}
            className="min-w-0 scroll-mt-6">
            <div className="mb-5 hidden items-center justify-between gap-4 sm:flex">
              <p className="text-sm text-stone-500">
                Showing{" "}
                <span className="font-semibold text-stone-900">
                  {displayProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-stone-900">
                  {totalProducts}
                </span>{" "}
                products
              </p>

              <div className="flex items-center gap-3">
                <label htmlFor="desktop-sort" className="text-sm text-stone-500">
                  Sort by
                </label>

                <select
                  id="desktop-sort"
                  value={selected.sort}
                  onChange={(event) =>
                    updateFilter({ sort: event.target.value })
                  }
                  className="rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filters */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {selected.category && (
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600">
                  {selected.category}
                  <button
                    type="button"
                    onClick={() => updateFilter({ category: "" })}
                    className="ml-2 font-semibold"
                    aria-label="Remove collection filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedColors.map((color) => (
                <span
                  key={color}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() =>
                      updateFilter({
                        color: selectedColors
                          .filter((item) => item !== color)
                          .join(","),
                      })
                    }
                    className="ml-2 font-semibold"
                    aria-label={`Remove ${color} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {selected.capacity && (
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600">
                  Capacity selected
                  <button
                    type="button"
                    onClick={() => updateFilter({ capacity: "" })}
                    className="ml-2 font-semibold"
                    aria-label="Remove capacity filter"
                  >
                    ×
                  </button>
                </span>
              )}

              {selected.q && (
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600">
                  Search: {selected.q}
                  <button
                    type="button"
                    onClick={() => updateFilter({ q: "" })}
                    className="ml-2 font-semibold"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <div
              className={`grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 ${isPending ? "opacity-60 transition-opacity" : ""
                }`}
            >
              {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {displayProducts.length === 0 && (
              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
                  <Package size={24} className="text-stone-500" />
                </div>

                <h2 className="text-xl font-semibold">No products found</h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
                  Try changing your filters or clearing your selection to
                  discover more bottles.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                aria-label="Product pagination"
                className="mt-12 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    updateFilter({ page: String(currentPage - 1) })
                  }
                  className="rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, visiblePages) => (
                    <span key={page} className="contents">
                      {index > 0 &&
                        page - visiblePages[index - 1] > 1 && (
                          <span className="px-1 text-stone-400">…</span>
                        )}

                      <button
                        type="button"
                        onClick={() => updateFilter({ page: String(page) })}
                        aria-current={
                          currentPage === page ? "page" : undefined
                        }
                        className={`min-w-10 rounded-lg border px-3 py-2.5 text-sm ${currentPage === page
                            ? "border-stone-900 bg-stone-900 font-semibold text-white"
                            : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                          }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    updateFilter({ page: String(currentPage + 1) })
                  }
                  className="rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>

      <WhatsAppButton />
    </div>
  );
}
