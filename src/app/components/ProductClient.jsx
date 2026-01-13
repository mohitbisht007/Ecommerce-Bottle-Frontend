"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReviewSection from "@/app/components/ReviewSection";
import ProductSlider from "@/app/components/ProductSlider";
import { useCart } from "@/app/context/CartContext";
import Image from "next/image";

export default function ProductClient({ initialProduct }) {
  // Use initialProduct directly to avoid "Loading..." flicker
  const [product, setProduct] = useState(initialProduct);
  const { slug } = useParams();
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const router = useRouter()

  // Initialize strings based on the first variant for accurate stock checking
  const [selectedColor, setSelectedColor] = useState(
    initialProduct.variants[0]?.colorName || ""
  );
  const [selectedCapacity, setSelectedCapacity] = useState(
    initialProduct.variants[0]?.capacity || ""
  );

  const { addToCart, cartItems, setIsCartOpen } = useCart();

  // Auto-Play Logic for Gallery
  useEffect(() => {
    if (!product) return;
    const currentImages = product.variants[selectedVarIdx]?.images || [];
    if (currentImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImgIdx((prev) =>
        prev === currentImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [product, selectedVarIdx]);

  if (!product) return <div className="page-loader">Loading...</div>;

  const currentVariant = product.variants[selectedVarIdx];
  const activeImg = currentVariant.images[activeImgIdx];

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100
      )
    : 0;

  const handleAddToBag = () => {
    addToCart(product, quantity, currentVariant.colorName, selectedCapacity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, currentVariant.colorName, selectedCapacity);
    router.push("/checkout");
  };

  const isInBag = cartItems.some(
    (item) =>
      item._id === product._id &&
      item.color === currentVariant.colorName &&
      item.capacity === selectedCapacity
  );

  const availableCapacities = [
    ...new Set(product.variants.map((v) => v.capacity)),
  ];

  const activeVariant =
    product.variants.find(
      (v) => v.colorName === selectedColor && v.capacity === selectedCapacity
    ) || currentVariant;

  const variantStock = activeVariant.stock;

  return (
    <div className="product-page-root">
      <div className="product-grid-wrapper container">
        {/* --- LEFT: GALLERY --- */}
        <div className="gallery-column">
          <div className="sticky-gallery">
            <div className="main-display">
              {discount > 0 && (
                <span className="discount-tag">Save {discount}%</span>
              )}
              <button
                className="share-icon"
                onClick={() => {
                  navigator.share
                    ? navigator.share({
                        title: product.title,
                        url: window.location.href,
                      })
                    : navigator.clipboard.writeText(window.location.href);
                }}
              >
                📤
              </button>

              {/* Next.js Image with 'fill' requires the parent to be 'position: relative'.
          The 'hero-visual' class now handles the scaling via the CSS Fix 1 above.
      */}
              <Image
                src={activeImg}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "contain" }}
                className="hero-visual fade-in"
                key={activeImg}
              />

              <div className="gallery-nav-btns">
                <button
                  onClick={() =>
                    setActiveImgIdx((prev) =>
                      prev === 0 ? currentVariant.images.length - 1 : prev - 1
                    )
                  }
                >
                  ‹
                </button>
                <button
                  onClick={() =>
                    setActiveImgIdx((prev) =>
                      prev === currentVariant.images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  ›
                </button>
              </div>
            </div>

            <div className="navigation-thumbnails">
              {currentVariant.images.map((img, i) => (
                <div
                  key={i}
                  className={`nav-thumb-item ${
                    i === activeImgIdx ? "active" : ""
                  }`}
                  onClick={() => setActiveImgIdx(i)}
                  style={{
                    position: "relative",
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <Image
                    src={img}
                    alt="view"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT: CONTENT --- */}
        <div className="content-column">
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

          {/* COLOR SELECTION */}
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

          {/* CAPACITY SELECTION */}
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

          {/* PURCHASE CONTROLS */}
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

          {/* TRUST INDICATORS */}
          <div className="trust-grid">
            <div className="trust-item">
              <span>🚚</span> Free Express Shipping
            </div>
            <div className="trust-item">
              <span>🛡️</span> 1 Year Warranty
            </div>
            <div className="trust-item">
              <span>♻️</span> BPA Free
            </div>
            <div className="trust-item">
              <span>🔄</span> Easy Returns
            </div>
          </div>

          {/* TABS */}
          <div className="details-tabs">
            <div className="tab-headers">
              <button
                className={activeTab === "description" ? "active" : ""}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                className={activeTab === "shipping" ? "active" : ""}
                onClick={() => setActiveTab("shipping")}
              >
                Policy
              </button>
            </div>
            <div className="tab-body">
              {activeTab === "description" ? (
                <p>{product.description}</p>
              ) : (
                <p>
                  Free shipping on orders above ₹999. 7-day return policy
                  available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductSlider
        title="Similar Styles"
        subtitle="More from our collection"
        fetchUrl={`${process.env.NEXT_PUBLIC_API_URL}/recommend?type=similar&category=${product.category}&productId=${product._id}`}
      />

      <ReviewSection
        productId={product._id}
        productRating={product.rating}
        totalReviews={product.reviewsCount}
      />
    </div>
  );
}
