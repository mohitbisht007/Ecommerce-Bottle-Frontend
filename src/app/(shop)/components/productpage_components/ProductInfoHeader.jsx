export default function ProductInfoHeader({ product, variantStock, discount }) {
  return (
    <header className="product-info-header">
      <div className="breadcrumb">Home / {product.category}</div>
      <h1 className="title-text">{product.title}</h1>

      <div className="rating-row">
        <div className="stars">{product.rating}★</div>
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
        <span className="new-price">₹{product.price}</span>
        {product.compareAtPrice && (
          <>
            <span className="old-price">₹{product.compareAtPrice}</span>
            <span className="savings-badge">-{discount}% OFF</span>
          </>
        )}
      </div>
    </header>
  );
}