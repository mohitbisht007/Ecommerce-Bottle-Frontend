// 1. Removed "use client" - Now a high-speed Server Component
import Link from "next/link";

const priceRanges = [
  { label: 'Under ₹499', query: 'maxPrice=499', sub: 'Budget Friendly', accent: '#3b82f6' },
  { label: '₹500 - ₹999', query: 'minPrice=500&maxPrice=999', sub: 'Most Popular', accent: '#7c3aed' },
  { label: '₹1000 - ₹1999', query: 'minPrice=1000&maxPrice=1999', sub: 'Premium Picks', accent: '#10b981' },
  { label: 'Above ₹2000', query: 'minPrice=2000', sub: 'Luxury Edition', accent: '#f59e0b' },
];

export default function PriceRangeTray() {
  return (
    <section className="price-range-section" aria-labelledby="budget-heading">
      <div className="range-header">
        <div className="title-stack">
          <span className="tiny-label">CURATED FOR YOU</span>
          <h2 id="budget-heading">Shop by Budget</h2>
        </div>
      </div>

      <div className="glass-scroll-container">
        {priceRanges.map((range, i) => (
          <Link 
            href={`/shop?${range.query}`} 
            key={i} 
            className="glass-card" 
            style={{ '--card-accent': range.accent }}
            aria-label={`Shop products ${range.label}`} // 2. SEO & Accessibility boost
          >
            <div className="glass-content">
              <span className="glass-sub">{range.sub}</span>
              {/* 3. Changed h3 to a span or p if there are too many on one page, but h3 is fine for SEO here */}
              <h3 className="glass-label">{range.label}</h3>
              
              <div className="glass-footer">
                <div className="circle-btn" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="abstract-glow"></div>
          </Link>
        ))}
      </div>
    </section>
  );
}