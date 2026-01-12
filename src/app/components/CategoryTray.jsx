"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CategoryTray() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeCategories();
  }, []);

  if (loading || categories.length === 0) return null;

  return (
    <section className="premium-tray-section">
      <div className="tray-header">
        <div className="title-group">
          <span className="tray-tag">COLLECTIONS 2026</span>
          <h2 className="tray-title">Shop by Category</h2>
        </div>
        <Link href="/shop" className="tray-view-all">
          View All
          <span className="arrow-icon">→</span>
        </Link>
      </div>

      <div className="fancy-scroll-container">
        {categories.map((cat) => (
          <Link href={`/shop?category=${cat.name}`} key={cat._id} className="premium-card">
            <div className="card-outer">
              <div className="glass-morph-bg"></div>
              <div className="image-wrapper">
                <img src={cat.image} alt={cat.displayName} loading="lazy" />
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