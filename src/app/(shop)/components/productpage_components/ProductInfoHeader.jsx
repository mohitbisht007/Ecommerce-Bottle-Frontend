export default function ProductInfoHeader({
  product,
  variantStock,
  selectedSize
}) {

  const currentPrice =
    selectedSize?.price || product.price;

  const comparePrice =
    selectedSize?.compareAtPrice;

  const discount =
    comparePrice && currentPrice
      ? Math.round(
          ((comparePrice - currentPrice) /
            comparePrice) *
            100
        )
      : 0;

  return (
    <header className="product-info-header">

      <div className="breadcrumb">
        Home / {product.category}
      </div>

      <h1 className="title-text">
        {product.title}
      </h1>

      <div className="rating-row">

        <div className="stars">
          {product.rating}★
        </div>

        <span className="review-count">
          ({product.reviewsCount} Verified Reviews)
        </span>

        <span
          className={
            variantStock <= 0
              ? "out-of-stock-txt"
              : variantStock <= 5
              ? "lowstock"
              : "instock"
          }
        >
          {variantStock <= 0
            ? "● Out of Stock"
            : variantStock <= 5
            ? `● Only ${variantStock} left in stock - order soon`
            : "● In Stock"}
        </span>
      </div>

      <div className="price-container">

        <span className="new-price">
          ₹{currentPrice}
        </span>

        {comparePrice && (
          <>
            <span className="old-price">
              ₹{comparePrice}
            </span>

            <span className="savings-badge">
              -{discount}% OFF
            </span>
          </>
        )}

      </div>
    </header>
  );
}