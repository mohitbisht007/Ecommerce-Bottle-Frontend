export default function PurchaseControls({
  quantity,
  setQuantity,
  handleAddToBag,
  handleBuyNow,
  handleNotifyMe,
  isInBag,
  variantStock,
  setIsCartOpen,
}) {
  const isOutOfStock = variantStock <= 0;

  return (
    <div className="purchase-controls">
      <div className="qty-picker">
        <button
          onClick={() =>
            setQuantity(Math.max(1, quantity - 1))
          }
          disabled={isOutOfStock}
        >
          -
        </button>

        <span>{quantity}</span>

        <button
          onClick={() => setQuantity(quantity + 1)}
          disabled={isOutOfStock}
        >
          +
        </button>
      </div>

      {isOutOfStock ? (
        <button
          type="button"
          className="btn-buy-now"
          onClick={handleNotifyMe}
        >
          Notify Me
        </button>
      ) : (
        <>
          <button
            className={`btn-add-cart ${
              isInBag ? "already-in" : ""
            }`}
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
            >
              Buy It Now
            </button>
          )}
        </>
      )}
    </div>
  );
}