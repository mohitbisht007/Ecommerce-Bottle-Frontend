// src/components/CategoryBar.jsx  (Server Component)
import Link from 'next/link';

async function fetchCategories() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const res = await fetch(`${base}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.categories || [];
  } catch (err) {
    console.error('fetchCategories error', err);
    return [];
  }
}

export default async function CategoryBar() {
  const categories = await fetchCategories();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="category-bar" style={{ padding: '8px 0' }}>
      <Link href="/products" className="category-pill">All</Link>
      {categories.map(cat => (
        <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`} className="category-pill">
          {cat}
        </Link>
      ))}
    </div>
  );
}
