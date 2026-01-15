// 1. REMOVED "use client" - it's now a faster Server Component
import ProductCard from "./ProductCard";
import Link from "next/link";

export default function CategoryBar({ title, products, query }) {
  if (!products || products.length === 0) return null;

  return (
    <section
      className="category-row-section"
      aria-labelledby={`header-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="container">
        <div className="category-row-header">
          <div className="header-text-group">
            {/* 1. Added a decorative sub-tag for a premium feel */}
            <span className="header-pre-title">Premium Collection</span>
            <h2
              id={`header-${title.replace(/\s+/g, "-").toLowerCase()}`}
              className="header-main-title"
            >
              {title}
            </h2>
          </div>

          <Link
            href={`/shop?${query}`}
            className="modern-view-all"
            aria-label={`View all products in ${title}`}
          >
            <span className="link-text">Explore All</span>
            <span className="link-arrow">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          </Link>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
