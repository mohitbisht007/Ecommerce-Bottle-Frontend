// src/components/AddToCartButton.jsx
'use client';

import { useState } from 'react';

export default function AddToCartButton({ product }) {
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    try {
      setLoading(true);

      // Basic cart stored in localStorage as: { items: [{ productId, title, price, qty, image }] }
      const raw = localStorage.getItem('bottle_cart');
      const cart = raw ? JSON.parse(raw) : { items: [] };

      const existingIndex = cart.items.findIndex(it => it.productId === product._id);
      if (existingIndex !== -1) {
        cart.items[existingIndex].qty += 1;
      } else {
        cart.items.push({
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || '/placeholder.png',
          qty: 1
        });
      }

      localStorage.setItem('bottle_cart', JSON.stringify(cart));
      // small UX feedback
      window.dispatchEvent(new CustomEvent('bottle_cart_updated', { detail: cart })); // optional for listeners
      alert(`${product.title} added to cart`);
    } catch (err) {
      console.error('AddToCart error', err);
      alert('Could not add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn" onClick={handleAdd} disabled={loading}>
      {loading ? 'Adding...' : 'Add to cart'}
    </button>
  );
}
