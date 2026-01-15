"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const IconHeart = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "#ec4899" : "none"}
    stroke={filled ? "#ec4899" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

export default function ProductCard({ product }) {
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
          className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          aria-label="Add to wishlist"
        >
          <IconHeart filled={isWishlisted} />
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
                className={`color-ring ${
                  i === selectedVarIdx ? "selected" : ""
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
