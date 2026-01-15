"use client";
import { useState } from "react";
import Link from "next/link";

export default function ProductCard({ product }) {
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const currentVariant = product.variants[selectedVarIdx];
  const displayImages = currentVariant?.images?.length > 0 
    ? currentVariant.images 
    : [product.thumbnail];

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="luxury-card">
      <div className="card-top">
        {/* Modern floating badge */}
        {discount > 0 && <span className="discount-pill">-{discount}% OFF</span>}
        
        {/* Main Product Link */}
        <Link href={`/shop/${product.slug}`} className="image-click-area">
          <img 
            src={displayImages[activeImgIdx]} 
            alt={product.title} 
            className="main-asset"
          />
        </Link>

        {/* Hover-only Quick Add (Optional touch of luxury) */}
        <button className="quick-add-btn">Quick Add +</button>

        {/* Dynamic Image Indicators */}
        {displayImages.length > 1 && (
          <div className="image-nav">
            {displayImages.map((_, i) => (
              <span 
                key={i} 
                className={`nav-bar ${i === activeImgIdx ? 'active' : ''}`}
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
                className={`color-ring ${i === selectedVarIdx ? 'selected' : ''}`}
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
            <span className="price-strike">₹{product.compareAtPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}