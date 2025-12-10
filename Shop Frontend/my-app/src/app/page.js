// src/app/page.js  (Server Component)
import CategoryBar from './components/CategoryBar';
import FeaturedProducts from './components/FeaturedProducts';
import ProductCard from './components/ProductCard';

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
      <h1>Welcome to Bottle Shop</h1>
      <p className="small">Reusable bottles — eco-friendly and stylish.</p>

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
