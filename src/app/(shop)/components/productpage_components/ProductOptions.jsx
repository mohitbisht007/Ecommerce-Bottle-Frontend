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
  const availableCapacities = [
    ...new Set(product.variants.map((v) => v.capacity)),
  ];

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
                selectedVarIdx === i ? "active" : ""
              }`}
              style={{ "--swatch-hex": v.colorCode }}
              onClick={() => {
                setSelectedVarIdx(i);
                setSelectedColor(v.colorName);
                setActiveImgIdx(0);
              }}
            />
          ))}
        </div>
      </div>

      <div className="product-option-section">
        <p className="option-label">
          Select Capacity: <strong>{selectedCapacity}</strong>
        </p>
        <div className="capacity-grid">
          {availableCapacities.map((size, index) => {
            const variantCheck = product.variants.find(
              (v) => v.capacity === size && v.colorName === selectedColor
            );
            const vStock = variantCheck ? variantCheck.stock : 0;
            const isOutOfStock = vStock <= 0;

            return (
              <button
                key={`size-${size}-${index}`}
                className={`size-card ${
                  selectedCapacity === size ? "active" : ""
                } ${isOutOfStock ? "disabled" : ""}`}
                onClick={() => !isOutOfStock && setSelectedCapacity(size)}
                disabled={isOutOfStock}
              >
                <span className="size-val">{size}</span>
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