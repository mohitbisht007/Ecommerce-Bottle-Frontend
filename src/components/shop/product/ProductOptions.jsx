export default function ProductOptions({
  product,
  currentVariant,
  selectedVarIdx,
  setSelectedVarIdx,
  selectedColor,
  setSelectedColor,
  selectedCapacity,
  setSelectedCapacity,
  setActiveImgIdx,
}) {
  const availableCapacities = currentVariant?.sizes || [];

  return (
    <>
      {/* ================= PRODUCT IMAGE / DESIGN ================= */}
      <div className="product-option-section">
        <p className="option-label">
          Select Design:
          <strong> {currentVariant?.colorName}</strong>
        </p>

        <div className="flex flex-wrap gap-3 mt-3">
          {product.variants.map((v, i) => {
            const variantImage =
              v.images?.[0] ||
              v.image ||
              product.images?.[0];

            const isSelected = selectedVarIdx === i;

            return (
              <button
                key={`${product._id}-${v.colorName}-${i}`}
                type="button"
                aria-label={`Select ${v.colorName}`}
                title={v.colorName}
                className={`
                  relative
                  w-[76px]
                  h-[76px]
                  p-1
                  rounded-xl
                  overflow-hidden
                  bg-white
                  cursor-pointer
                  transition-all
                  duration-200
                  ease-out

                  border-2
                  ${
                    isSelected
                      ? "border-violet-600 ring-2 ring-violet-100"
                      : "border-gray-200 hover:border-gray-400"
                  }

                  ${
                    isSelected
                      ? "shadow-md"
                      : "shadow-sm hover:shadow-md"
                  }

                  ${
                    isSelected
                      ? "scale-[1.03]"
                      : "hover:-translate-y-0.5"
                  }
                `}
                onClick={() => {
                  setSelectedVarIdx(i);

                  setSelectedColor(v.colorName);

                  // Auto-select first available size
                  if (v.sizes?.length > 0) {
                    const firstAvailableSize = v.sizes.find(
                      (size) => (size.stock || 0) > 0
                    );

                    if (firstAvailableSize) {
                      setSelectedCapacity(
                        firstAvailableSize.capacity
                      );
                    }
                  }

                  setActiveImgIdx(0);

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
              >
                {/* Product image */}
                <img
                  src={variantImage}
                  alt={v.colorName}
                  className="
                    w-full
                    h-full
                    object-contain
                    rounded-lg
                    block
                  "
                />

                {/* Selected indicator */}
                {isSelected && (
                  <span
                    className="
                      absolute
                      top-1
                      right-1
                      w-5
                      h-5
                      rounded-full
                      bg-violet-600
                      text-white
                      flex
                      items-center
                      justify-center
                      text-[11px]
                      font-bold
                      shadow-sm
                    "
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= CAPACITY ================= */}
      <div className="product-option-section">
        <p className="option-label">
          Select Capacity:
          <strong> {selectedCapacity}</strong>
        </p>

        <div className="capacity-grid">
          {availableCapacities.map((sizeObj, index) => {
            const vStock = sizeObj.stock || 0;
            const isOutOfStock = vStock <= 0;

            return (
              <button
                key={`size-${sizeObj.capacity}-${index}`}
                type="button"
                className={`size-card ${
                  selectedCapacity === sizeObj.capacity
                    ? "active"
                    : ""
                } ${
                  isOutOfStock
                    ? "disabled"
                    : ""
                }`}
                onClick={() =>
                  !isOutOfStock &&
                  setSelectedCapacity(sizeObj.capacity)
                }
                disabled={isOutOfStock}
              >
                <span className="size-val">
                  {sizeObj.capacity}
                </span>

                <span className="size-sub">
                  {isOutOfStock
                    ? "Out of Stock"
                    : vStock <= 5
                    ? `Only ${vStock} left`
                    : "Available"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}