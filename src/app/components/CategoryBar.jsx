// 1. REMOVED "use client" - it's now a faster Server Component
import ProductCard from "./ProductCard";
import Link from "next/link";

export default function CategoryBar({ title, products, query }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="category-row-section" aria-labelledby={`header-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="container">
        <div className="row-header">
          {/* 2. Added ID for accessibility linking */}
          <h2 id={`header-${title.replace(/\s+/g, '-').toLowerCase()}`}>
            {title}
          </h2>
          
          <Link 
            href={`/shop?${query}`} 
            className="view-all"
            aria-label={`View all products in ${title}`} // 3. SEO & Accessibility boost
          >
            View All →
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