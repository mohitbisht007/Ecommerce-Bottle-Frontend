// src/components/ReviewList.jsx
'use client';

import { useEffect, useState } from 'react';

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const res = await fetch(`${base}/reviews?productId=${productId}&limit=50`, { cache: 'no-store' });
      if (!res.ok) {
        setReviews([]);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setReviews(json.items || []);
    } catch (err) {
      console.error('load reviews', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!productId) return;
    load();

    // Listen for global event when a new review posted
    const handler = () => load();
    window.addEventListener('bottle_review_posted', handler);
    return () => window.removeEventListener('bottle_review_posted', handler);
  }, [productId]);

  if (loading) return <div className="small">Loading reviews…</div>;
  if (!reviews.length) return <div className="small">No reviews yet — be the first to review!</div>;

  return (
    <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
      {reviews.map(r => (
        <div key={r._id} style={{ padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontWeight: 700 }}>{r.name || 'Anonymous'}</div>
            <div className="small">{new Date(r.createdAt).toLocaleString()}</div>
          </div>
          <div style={{ marginTop: 8 }}>{'★'.repeat(Math.max(0, Math.min(5, r.rating)))}</div>
          <p style={{ marginTop: 8 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
