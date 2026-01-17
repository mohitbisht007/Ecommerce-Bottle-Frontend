"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useWishlist } from "../context/WishlistContext";

const IconHeart = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="heart-icon-svg"
    style={{ overflow: 'visible' }} // Extra safety to prevent clipping
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export default function ProductCard({ product }) {
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const { toggleWishlist, isItemWishlisted, wishlistIds } = useWishlist()

  const active = isItemWishlisted(product._id);
  
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const currentVariant = product.variants[selectedVarIdx];
  const displayImages =
    currentVariant?.images?.length > 0
      ? currentVariant.images
      : [product.thumbnail];

  const discount = product.compareAtPrice
    ? Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) *
      100
    )
    : 0;

  return (
    <div className="luxury-card">
      <div className="card-top">
        {/* Modern floating badge */}
        {discount > 0 && (
          <span className="discount-pill">-{discount}% OFF</span>
        )}

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn ${active ? "active" : ""}`}
          onClick={handleWishlistClick}
          aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
        >
          <IconHeart filled={active} />
        </button>

        {/* Main Product Link */}
        <Link href={`/shop/${product.slug}`} className="image-click-area">
          <Image
            src={displayImages[activeImgIdx]}
            alt={product.title}
            fill // Use fill to let CSS control the size
            sizes="(max-width: 768px) 100vw, 33vw"
            className="main-asset"
            priority={false}
          />
        </Link>

        {/* Hover-only Quick Add (Optional touch of luxury) */}
        <button className="quick-add-btn hide-mobile">Quick Add +</button>

        {/* Dynamic Image Indicators */}
        {displayImages.length > 1 && (
          <div className="image-nav hide-mobile">
            {displayImages.map((_, i) => (
              <span
                key={i}
                className={`nav-bar ${i === activeImgIdx ? "active" : ""}`}
                onMouseEnter={() => setActiveImgIdx(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="card-bottom">
        <div className="info-row">
          <span className="cat-tag">{product.category}</span>
          <div className="swatch-row">
            {product.variants.map((v, i) => (
              <span
                key={i}
                className={`color-ring ${i === selectedVarIdx ? "selected" : ""
                  }`}
                style={{ "--swatch-color": v.colorCode }}
                onClick={() => {
                  setSelectedVarIdx(i);
                  setActiveImgIdx(0);
                }}
              />
            ))}
          </div>
        </div>

        <Link href={`/shop/${product.slug}`}>
          <h3 className="title">{product.title}</h3>
        </Link>

        <div className="price-box">
          <span className="price-main">₹{product.price.toLocaleString()}</span>
          {product.compareAtPrice && (
            <span className="price-strike">
              ₹{product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
