export default function PurchaseControls({
  quantity,
  setQuantity,
  handleAddToBag,
  handleBuyNow,
  isInBag,
  variantStock,
  setIsCartOpen,
}) {
  return (
    <div className="purchase-controls">
      <div className="qty-picker">
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
          -
        </button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>

      <button
        className={`btn-add-cart ${isInBag ? "already-in" : ""}`}
        onClick={handleAddToBag}
      >
        {isInBag ? "Add More to Bag" : "Add to Bag"}
      </button>

      {isInBag ? (
        <button
          className="btn-buy-now view-bag-btn"
          onClick={() => setIsCartOpen(true)}
        >
          View Bag
        </button>
      ) : (
        <button
          className="btn-buy-now"
          onClick={handleBuyNow}
          disabled={variantStock <= 0}
        >
          Buy It Now
        </button>
      )}
    </div>
  );
}