// src/components/FeaturedProducts.jsx  (Server Component)
import ProductCard from './ProductCard';

async function fetchFeatured(limit = 8) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const res = await fetch(`${base}/products?featured=true&limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.items || [];
  } catch (err) {
    console.error('fetchFeatured error', err);
    return [];
  }
}

export default async function FeaturedProducts({ limit = 8 }) {
  const products = await fetchFeatured(limit);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: 18 }}>
      <div className="section-title">
        <h2>Featured</h2>
        <div className="small"><a href="/products">See all</a></div>
      </div>

      <div className="featured-carousel" aria-label="Featured products">
        {products.map(p => (
          <div key={p._id}>
            {/* ProductCard is a client component — it's fine to render from server */}
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
