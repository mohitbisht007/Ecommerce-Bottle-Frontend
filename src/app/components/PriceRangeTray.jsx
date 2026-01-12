"use client";
import Link from "next/link";

const priceRanges = [
  { label: 'Under ₹499', query: 'maxPrice=499', sub: 'Budget Friendly', accent: '#3b82f6' },
  { label: '₹500 - ₹999', query: 'minPrice=500&maxPrice=999', sub: 'Most Popular', accent: '#7c3aed' },
  { label: '₹1000 - ₹1999', query: 'minPrice=1000&maxPrice=1999', sub: 'Premium Picks', accent: '#10b981' },
  { label: 'Above ₹2000', query: 'minPrice=2000', sub: 'Luxury Edition', accent: '#f59e0b' },
];

export default function PriceRangeTray() {
  return (
    <section className="price-range-section">
      <div className="range-header">
        <div className="title-stack">
          <span className="tiny-label">CURATED FOR YOU</span>
          <h2>Shop by Budget</h2>
        </div>
      </div>

      <div className="glass-scroll-container">
        {priceRanges.map((range, i) => (
          <Link 
            href={`/shop?${range.query}`} 
            key={i} 
            className="glass-card" 
            style={{ '--card-accent': range.accent }}
          >
            <div className="glass-content">
              <span className="glass-sub">{range.sub}</span>
              <h3 className="glass-label">{range.label}</h3>
              
              <div className="glass-footer">
                <div className="circle-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
            
            {/* Background Decorative Element */}
            <div className="abstract-glow"></div>
          </Link>
        ))}
      </div>
    </section>
  );
}