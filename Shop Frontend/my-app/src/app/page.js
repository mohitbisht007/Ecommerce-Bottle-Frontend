// src/app/page.js  (Server Component)
import CategoryBar from './components/CategoryBar';
import FeaturedProducts from './components/FeaturedProducts';
import ProductCard from './components/ProductCard';
import HeroCarousel from './components/HeroCarousel';
import SectionShowcase from './components/SectionShowcase';

const IMAGES = [
  'https://www.solara.in/cdn/shop/files/WhatsApp_Image_2025-11-05_at_5.46.28_PM.jpg?v=1762511484&width=1600',
  'https://www.solara.in/cdn/shop/files/Luchn_box_banner_001_V1.jpg?v=1764398741&width=1600',
  'https://www.solara.in/cdn/shop/files/Triply_Banner_3_002.jpg?v=1762251951&width=1900',
];

async function fetchNewArrivals(limit = 8) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const res = await fetch(`${base}/products?limit=${limit}&sort=newest`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.items || [];
  } catch (err) {
    console.error('fetchNewArrivals error', err);
    return [];
  }
}

export default async function HomePage() {
  const newArrivals = await fetchNewArrivals(8);

  return (
    <div style={{ padding: 20 }}>
      <HeroCarousel images={IMAGES} interval={4500} height="500px" />
      <SectionShowcase
        title="New Arrivals"
        promoImage="https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        promoLink="/products?sort=newest"
        products={newArrivals}
      />

      {/* Categories bar */}
      <CategoryBar />

      {/* Featured */}
      <FeaturedProducts limit={8} />

      {/* New arrivals grid */}
      <section style={{ marginTop: 18 }}>
        <div className="section-title">
          <h2>New arrivals</h2>
          <div className="small"><a href="/products?sort=newest">See all</a></div>
        </div>

        <div className="grid" style={{ marginTop: 12 }}>
          {newArrivals.length === 0 ? (
            <div className="small">No new arrivals yet.</div>
          ) : (
            newArrivals.map(p => <ProductCard key={p._id} product={p} />)
          )}
        </div>
      </section>
    </div>
  );
}
