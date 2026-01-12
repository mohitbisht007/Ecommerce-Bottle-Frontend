// src/app/products/page.js
import ProductCard from '../components/ProductCard';
import Link from 'next/link';
import CategoryBar from '../components/CategoryBar';

const DEFAULT_LIMIT = 12;

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') search.set(k, String(v));
  });
  return search.toString() ? `?${search.toString()}` : '';
}

async function fetchProducts({ category, q, page = 1, limit = DEFAULT_LIMIT, sort } = {}) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    if (sort) params.set('sort', sort);

    const url = `${base}/products?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.error('fetchProducts failed', res.status);
      return { items: [], total: 0, page: 1, pages: 1 };
    }

    const json = await res.json();
    return {
      items: json.items || [],
      total: json.total || 0,
      page: json.page || 1,
      pages: json.pages || 1
    };
  } catch (err) {
    console.error('fetchProducts error', err);
    return { items: [], total: 0, page: 1, pages: 1 };
  }
}

export default async function ProductsPage({ searchParams }) {
  // ✅ unwrap the Promise
  const query = await searchParams;

  const category = query?.category || '';
  const q = query?.q || '';
  const page = Number(query?.page || 1);
  const limit = Number(query?.limit || DEFAULT_LIMIT);
  const sort = query?.sort || '';

  const { items, total, pages } = await fetchProducts({ category, q, page, limit, sort });

  const baseQuery = { category, q, limit, sort };

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>
      <p className="small">Browse products{category ? ` — ${category}` : ''}</p>

      <CategoryBar />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <form action="/products" method="get" style={{ display: 'flex', gap: 8 }}>
            {category && <input type="hidden" name="category" value={category} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
            />
            <button className="btn" type="submit">Search</button>
          </form>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="small">Sort</span>
          <Link href={`/products${buildQuery({ ...baseQuery, sort: '', page: 1 })}`} className="small">Default</Link>
          <Link href={`/products${buildQuery({ ...baseQuery, sort: 'newest', page: 1 })}`} className="small">Newest</Link>
          <Link href={`/products${buildQuery({ ...baseQuery, sort: 'price_asc', page: 1 })}`} className="small">Price ↑</Link>
          <Link href={`/products${buildQuery({ ...baseQuery, sort: 'price_desc', page: 1 })}`} className="small">Price ↓</Link>
        </div>
      </div>

      <section style={{ marginTop: 18 }}>
        {items.length === 0 ? (
          <div className="small">No products found.</div>
        ) : (
          <div className="grid">
            {items.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      <div style={{ marginTop: 18, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        <Link
          href={`/products${buildQuery({ ...baseQuery, page: Math.max(1, page - 1) })}`}
          className="btn outline"
        >
          Prev
        </Link>
        <div className="small" style={{ alignSelf: 'center' }}>
          Page {page} of {pages} — {total} items
        </div>
        <Link
          href={`/products${buildQuery({ ...baseQuery, page: Math.min(pages, page + 1) })}`}
          className="btn outline"
        >
          Next
        </Link>
      </div>
    </div>
  );
}
