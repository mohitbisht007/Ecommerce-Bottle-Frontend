// src/components/ReviewForm.jsx
'use client';

import { useState } from 'react';

export default function ReviewForm({ productId }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const submit = async (e) => {
    e.preventDefault();
    if (!productId) return alert('Missing product');
    if (!comment.trim()) return alert('Please write a comment');

    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${base}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ productId, rating, comment, name: name || undefined })
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json?.message || 'Could not post review');
      } else {
        // clear
        setName('');
        setRating(5);
        setComment('');
        // notify ReviewList to reload
        window.dispatchEvent(new CustomEvent('bottle_review_posted', { detail: json }));
        alert('Thanks — your review was posted.');
      }
    } catch (err) {
      console.error('post review', err);
      alert('Error posting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: 12, display: 'grid', gap: 8, maxWidth: 760 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
        <select value={rating} onChange={e => setRating(Number(e.target.value))} style={{ padding: 8, borderRadius: 8, border: '1px solid #ddd' }}>
          <option value={5}>5 — Excellent</option>
          <option value={4}>4 — Very good</option>
          <option value={3}>3 — Good</option>
          <option value={2}>2 — Fair</option>
          <option value={1}>1 — Poor</option>
        </select>
      </div>

      <textarea placeholder="Write your review" value={comment} onChange={e => setComment(e.target.value)} rows={4} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Posting…' : 'Post review'}</button>
      </div>
    </form>
  );
}
