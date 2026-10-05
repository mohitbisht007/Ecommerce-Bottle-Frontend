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

            // Entire variant is OOS only when
            // ALL of its capacities have 0 stock.
            const isVariantOutOfStock =
              !v.sizes?.some(
                (size) => Number(size.stock || 0) > 0
              );

            return (
              <button
                key={`${product._id}-${v.colorName}-${i}`}
                type="button"
                aria-label={`Select ${v.colorName}`}
                title={
                  isVariantOutOfStock
                    ? `${v.colorName} - Out of Stock`
                    : v.colorName
                }
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
                    isVariantOutOfStock
                      ? "opacity-55 grayscale-[35%]"
                      : ""
                  }

                  ${
                    isSelected
                      ? "shadow-md scale-[1.03]"
                      : "shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  }
                `}
                onClick={() => {
                  /*
                   * IMPORTANT:
                   * Even if the variant is completely OOS,
                   * we STILL select it.
                   *
                   * This allows PurchaseControls to show
                   * "Notify Me".
                   */
                  setSelectedVarIdx(i);
                  setSelectedColor(v.colorName);

                  /*
                   * If variant has stock:
                   * select first available capacity.
                   *
                   * If variant is completely OOS:
                   * select the first capacity so the user
                   * can request notification for it.
                   */
                  if (v.sizes?.length > 0) {
                    const firstAvailableSize = v.sizes.find(
                      (size) =>
                        Number(size.stock || 0) > 0
                    );

                    const capacityToSelect =
                      firstAvailableSize ||
                      v.sizes[0];

                    setSelectedCapacity(
                      capacityToSelect.capacity
                    );
                  } else {
                    setSelectedCapacity("");
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

                {/* ================= OOS OVERLAY ================= */}
                {isVariantOutOfStock && (
                  <span className="pointer-events-none absolute inset-0">
                    {/* Soft fade */}
                    <span
                      className="
                        absolute
                        inset-0
                        bg-white/35
                      "
                    />

                    {/* Elegant diagonal strike */}
                    <span
                      className="
                        absolute
                        left-[-12%]
                        top-1/2
                        h-[1.5px]
                        w-[124%]
                        -translate-y-1/2
                        rotate-[-28deg]
                        bg-slate-500/60
                      "
                    />

                    {/* Sold out pill */}
                    <span
                      className="
                        absolute
                        bottom-1
                        left-1/2
                        -translate-x-1/2
                        whitespace-nowrap
                        rounded-full
                        bg-white/90
                        px-2
                        py-0.5
                        text-[8px]
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-500
                        shadow-sm
                      "
                    >
                      Sold out
                    </span>
                  </span>
                )}

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
            const vStock = Number(sizeObj.stock || 0);
            const isOutOfStock = vStock <= 0;
            const isSelected =
              selectedCapacity === sizeObj.capacity;

            return (
              <button
                key={`size-${sizeObj.capacity}-${index}`}
                type="button"
                className={`
                  size-card
                  relative
                  overflow-hidden
                  transition-all
                  duration-200

                  ${isSelected ? "active" : ""}

                  ${
                    isOutOfStock
                      ? "out-of-stock"
                      : ""
                  }
                `}
                onClick={() => {
                  /*
                   * OOS capacities remain clickable.
                   * This is important for Notify Me.
                   */
                  setSelectedCapacity(
                    sizeObj.capacity
                  );
                }}
              >
                {/* Capacity information */}
                <div
                  className={`
                    relative
                    z-10
                    transition-opacity
                    duration-200

                    ${
                      isOutOfStock
                        ? "opacity-60"
                        : ""
                    }
                  `}
                >
                  <span className="size-val">
                    {sizeObj.capacity}
                  </span>
                </div>

                {/* OOS diagonal */}
                {isOutOfStock && (
                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      z-20
                      overflow-hidden
                    "
                  >
                    <span
                      className="
                        absolute
                        left-[-8%]
                        top-1/2
                        h-px
                        w-[116%]
                        -translate-y-1/2
                        rotate-[-14deg]
                        bg-slate-400/60
                      "
                    />
                  </span>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <span
                    className={`
                      absolute
                      bottom-2
                      right-2
                      z-30
                      h-1.5
                      w-1.5
                      rounded-full

                      ${
                        isOutOfStock
                          ? "bg-slate-400"
                          : "bg-violet-600"
                      }
                    `}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}