// src/app/product/[slug]/page.js
import AddToCartButton from '@/app/components/AddToCartButton';
import Image from 'next/image';

async function fetchProduct(slug) {
  try {
    const base = 'http://localhost:8080/api';
    const res = await fetch(`${base}/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('fetchProduct error', err);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Product not found</h1>
        <p className="small">No product matches that URL.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
        <div>
          {/* Use native img if you haven't configured next/image domains. Image component is optional */}
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <img src="/placeholder.png" alt="placeholder" style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
          )}
        </div>

        <div>
          <h1>{product.title}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
            <div className="price" style={{ fontSize: 22 }}>₹{product.price}</div>
            {product.compareAtPrice && (
              <div style={{ textDecoration: 'line-through', color: '#999' }}>₹{product.compareAtPrice}</div>
            )}
            <div className="small" style={{ marginLeft: 8 }}>{product.category}</div>
          </div>

          <p style={{ marginTop: 14, color: '#333' }}>{product.description}</p>

          {product.tags && product.tags.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong className="small">Tags:</strong>{' '}
              <span className="small">{product.tags.join(', ')}</span>
            </div>
          )}

          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            {/* AddToCartButton is a client component */}
            <AddToCartButton product={product} />
            <button className="btn outline">Buy now</button>
          </div>

          <div style={{ marginTop: 24 }}>
            <h3 className="small">Product details</h3>
            <ul>
              <li>SKU: {product.sku || '—'}</li>
              <li>Stock: {product.stock ?? '—'}</li>
              <li>Variants: {product.variants?.length ?? 0}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
