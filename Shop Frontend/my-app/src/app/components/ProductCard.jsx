// src/components/ProductCard.jsx

"use client"

import Link from 'next/link';

export default function ProductCard({ product, onAdd }) {
  const image = product?.images?.[0] || 'https://m.media-amazon.com/images/I/71qa1cXgV6L._SL1500_.jpg';
  const title = product?.title || 'Untitled';
  const price = product?.price ?? '—';

  return (
    <article className="card">
      <Link href={`/product/${product?.slug || ''}`} className="card-link">
        <div className="card-media">
          <img src={image} alt={title} />
        </div>

        <div className="card-body">
          <h3 className="card-title">{title}</h3>
          <div className="card-meta">
            <span className="price">₹{price}</span>
            <span className="small category">{product?.category}</span>
          </div>
        </div>
      </Link>

      <div className="card-actions">
        <button
          className="btn"
          onClick={(e) => { e.preventDefault(); onAdd && onAdd(product); }}
        >
          Add
        </button>

        <Link href={`/product/${product?.slug || ''}`} className="btn outline">
          View
        </Link>
      </div>
    </article>
  );
}
