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

  const availableCapacities =
    currentVariant?.sizes || [];

  return (
    <>
      <div className="product-option-section">

        <p className="option-label">
          Color: <strong>{currentVariant.colorName}</strong>
        </p>

        <div className="swatch-grid">

          {product.variants.map((v, i) => (

            <button
              key={`${product._id}-${v.colorName}`}

              className={`swatch-ring ${
                selectedVarIdx === i
                  ? "active"
                  : ""
              }`}

              style={{
                "--swatch-hex": v.colorCode
              }}

              onClick={() => {

                setSelectedVarIdx(i);

                setSelectedColor(v.colorName);

                // auto-select first size
                if (v.sizes?.length > 0) {
                  setSelectedCapacity(
                    v.sizes[0].capacity
                  );
                }

                setActiveImgIdx(0);
              }}
            />

          ))}
        </div>
      </div>

      <div className="product-option-section">

        <p className="option-label">
          Select Capacity:
          <strong> {selectedCapacity}</strong>
        </p>

        <div className="capacity-grid">

          {availableCapacities.map(
            (sizeObj, index) => {

              const vStock =
                sizeObj.stock || 0;

              const isOutOfStock =
                vStock <= 0;

              return (

                <button
                  key={`size-${sizeObj.capacity}-${index}`}

                  className={`size-card ${
                    selectedCapacity ===
                    sizeObj.capacity
                      ? "active"
                      : ""
                  } ${
                    isOutOfStock
                      ? "disabled"
                      : ""
                  }`}

                  onClick={() =>
                    !isOutOfStock &&
                    setSelectedCapacity(
                      sizeObj.capacity
                    )
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
            }
          )}
        </div>
      </div>
    </>
  );
}