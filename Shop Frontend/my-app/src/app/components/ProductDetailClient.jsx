// src/components/ProductDetailClient.jsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const IconStar = ({ fill = 'currentColor' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function ProductDetailClient({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || '/placeholder.png');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Calculate Discount %
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const adjust = (d) => setQuantity(q => Math.max(1, q + d));

  return (
    <div className="modern-pdp">
      <div className="pdp-layout">

        {/* LEFT: STICKY GALLERY */}
        <div className="pdp-gallery">
          <div className="main-stage">
            {discount > 0 && <span className="badge-discount">-{discount}% OFF</span>}
            <img src={selectedImage} alt={product.title} className="stage-img" />
          </div>
          <div className="thumb-strip">
            {product.images?.map((img, i) => (
              <div
                key={i}
                className={`thumb-item ${selectedImage === img ? 'active' : ''}`}
                onMouseEnter={() => setSelectedImage(img)}
              >
                <img src={img} alt="thumbnail" />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SCROLLABLE INFO */}
        <div className="pdp-main-info">
          <nav className="breadcrumb">Home / {product.category} / {product.title}</nav>

          <h1 className="product-title">{product.title}</h1>

          <div className="rating-summary">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <IconStar key={i} fill={i < Math.floor(product.rating || 0) ? "#FFC107" : "none"} />
              ))}
            </div>
            <span className="review-count">({product.reviewsCount || 0} Verified Reviews)</span>
          </div>

          <div className="price-stack">
            <span className="current-price">₹{product.price}</span>
            {product.compareAtPrice && (
              <>
                <span className="old-price">₹{product.compareAtPrice}</span>
                <span className="save-tag">Save ₹{product.compareAtPrice - product.price}</span>
              </>
            )}
          </div>

          <p className="short-desc">{product.description?.substring(0, 160)}...</p>

          {/* PROMOTIONS */}
          <div className="offers-box">
            <div className="offer-item">
              <span className="offer-icon">🏷️</span>
              <div>
                <strong>Bank Offer</strong> 10% off on HDFC Cards
              </div>
            </div>
            <div className="offer-item">
              <span className="offer-icon">🚚</span>
              <div>
                <strong>Free Delivery</strong> on orders above ₹999
              </div>
            </div>
          </div>

          {/* SELECTORS */}
          <div className="purchase-zone">
            <div className="qty-selector">
              <button onClick={() => adjust(-1)}>−</button>
              <span>{quantity}</span>
              <button onClick={() => adjust(1)}>+</button>
            </div>

            <button className="buy-btn" onClick={() => {/* Add logic */ }}>
              Add to Cart
            </button>

            <button
              className={`wish-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <div className="delivery-check">
            <p>Estimated Delivery: <strong>3 - 5 Business Days</strong></p>
          </div>

          {/* DETAILED TABS */}
          <div className="tabs-container">
            <div className="tab-header">
              {['Description', 'Specifications', 'Shipping'].map(tab => (
                <button
                  key={tab}
                  className={activeTab === tab.toLowerCase() ? 'active' : ''}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {activeTab === 'description' && <p>{product.description}</p>}
              {activeTab === 'specifications' && <p>{product.about}</p>}
              {activeTab === 'shipping' && <p>Free standard shipping on all orders over ₹999. Returns accepted within 30 days.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}
