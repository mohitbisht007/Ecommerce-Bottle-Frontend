// 1. REMOVED "use client" - Now a high-speed Server Component
import Link from "next/link";
import Image from "next/image"; // 2. IMPORT Next.js Image

export default function CategoryTray({ categories }) {
  // We no longer need fetch logic here; it comes from the parent page.js
  if (!categories || categories.length === 0) return null;

  return (
    <section className="premium-tray-section" aria-labelledby="tray-title">
      <div className="tray-header">
        <div className="title-group">
          <span className="tray-tag">COLLECTIONS 2026</span>
          <h2 id="tray-title" className="tray-title">Shop by Category</h2>
        </div>
        <Link href="/shop" className="tray-view-all" aria-label="View all product categories">
          View All
          <span className="arrow-icon" aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="fancy-scroll-container">
        {categories.map((cat) => (
          <Link 
            href={`/shop?category=${encodeURIComponent(cat.name)}`} 
            key={cat._id} 
            className="premium-card"
            aria-label={`Explore ${cat.displayName} collection`}
          >
            <div className="card-outer">
              <div className="glass-morph-bg"></div>
              <div className="image-wrapper" style={{ position: 'relative', height: '200px', width: '100%' }}>
                {/* 3. OPTIMIZED IMAGE */}
                <Image 
                  src={cat.image} 
                  alt={`${cat.displayName} category`} 
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  loading="lazy" 
                />
              </div>
              <div className="card-badge">Explore</div>
            </div>
            <div className="card-details">
              <h3>{cat.displayName}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}