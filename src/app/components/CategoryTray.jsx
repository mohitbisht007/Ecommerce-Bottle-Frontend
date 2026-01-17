// 1. REMOVED "use client" - Now a high-speed Server Component
import Link from "next/link";
import Image from "next/image"; // 2. IMPORT Next.js Image

export default function CategoryCircleTray({ categories }) {
  if (!categories || categories.length === 0) return null;

  console.log(categories)

  return (
    <section className="category-circle-section">
      <div className="lifestyle-header">
        <span className="range-tag">Our Range</span>
        <h2 className="lifestyle-title">Designed for Every Lifestyle</h2>
        <p className="lifestyle-subtext">From daily hydration to adventure-grade bottles.</p>
      </div>

      <div className="circle-scroll-container">
        {categories.map((cat) => (
          <Link 
            href={`/shop?category=${encodeURIComponent(cat.name)}`} 
            key={cat._id} 
            className="circle-cat-item"
          >
            <div className="circle-wrapper">
              <Image 
                src={cat.image} 
                alt={cat.displayName} 
                fill
                className="circle-img"
                sizes="120px"
              />
            </div>
            <span className="circle-title">{cat.displayName}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}