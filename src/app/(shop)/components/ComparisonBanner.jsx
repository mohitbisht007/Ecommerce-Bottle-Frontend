"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ComparisonBanner() {
  const [sliderPos, setSliderPos] = useState(50);

  const handleSliderChange = (e) => {
    setSliderPos(e.target.value);
  };

  return (
    <section className="personalize-hero-section">
      {/* 1. HEADER SECTION */}
      <div className="personalize-header">
        <span className="brand-tag">Premium Customization</span>
        <h2 className="main-heading">Personalized Bottles</h2>
      </div>

      {/* 2. THE INTERACTIVE SLIDER */}
      <div className="comparison-container-v2">
        <div className="comparison-slider">
          {/* BASE IMAGE: Plain Bottle */}
          <div 
            className="image-base" 
            style={{ backgroundImage: `url('https://www.thewalletstore.in/cdn/shop/files/Before.jpg?v=1712578428&width=1600')` }}
          ></div>

          {/* OVERLAY IMAGE: Engraved Bottle */}
          <div 
            className="image-overlay" 
            style={{ 
              backgroundImage: `url('https://www.thewalletstore.in/cdn/shop/files/After.jpg?v=1712578466&width=1600')`,
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)` 
            }}
          ></div>

          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderPos} 
            onChange={handleSliderChange} 
            className="slider-input-v2" 
          />

          <div className="slider-divider" style={{ left: `${sliderPos}%` }}>
            <div className="slider-handle">
               <span>←</span><span>→</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. FOOTER CONTENT SECTION */}
      <div className="personalize-footer">
        <p className="sub-content">
          Precision laser engraving that turns a bottle into a memory. 
          Personalize with names, logos, or unique designs for the perfect gift.
        </p>
        <Link href="/shop?category=Personalized" className="premium-view-btn">
          View Products
        </Link>
      </div>
    </section>
  );
}