// src/components/CartClient.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CartClient() {
  const [cart, setCart] = useState({ items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem('bottle_cart');
    const parsed = raw ? JSON.parse(raw) : { items: [] };
    setCart(parsed);
    // listen to global updates (from other components)
    const handler = (e) => {
      const data = localStorage.getItem('bottle_cart');
      setCart(data ? JSON.parse(data) : { items: [] });
    };
    window.addEventListener('bottle_cart_updated', handler);
    return () => window.removeEventListener('bottle_cart_updated', handler);
  }, []);

  // helper to persist and update state
  const persist = (nextCart) => {
    setCart(nextCart);
    localStorage.setItem('bottle_cart', JSON.stringify(nextCart));
    window.dispatchEvent(new CustomEvent('bottle_cart_updated', { detail: nextCart }));
  };

  const updateQty = (productId, qty) => {
    const next = { items: cart.items.map(it => it.productId === productId ? { ...it, qty: Math.max(1, Number(qty) || 1) } : it) };
    persist(next);
  };

  const removeItem = (productId) => {
    const next = { items: cart.items.filter(it => it.productId !== productId) };
    persist(next);
  };

  const clearCart = () => {
    const next = { items: [] };
    persist(next);
  };

  const subtotal = cart.items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0);
  // simple shipping & tax rules mirroring backend logic later
  const shipping = subtotal > 999 ? 0 : (subtotal === 0 ? 0 : 49);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (!cart.items.length) {
      alert('Cart is empty');
      return;
    }

    // If your backend /api/orders exists and you want to call it, uncomment the API call block.
    // For now this is a stub that shows what will be sent.

    const payload = {
      items: cart.items.map(i => ({ productId: i.productId, qty: i.qty })),
      address: { line1: 'Test address', city: 'City', postal: '000000' }
    };

    // Option A: If backend is ready and CORS allowed, you can call:
    /*
    try {
      const res = await API.post('/orders', payload); // ensure API base is reachable from client
      // if backend returns clientSecret you'd integrate Stripe.js here
      alert('Order created. Backend response: ' + JSON.stringify(res.data));
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Checkout failed: ' + (err?.response?.data?.message || err.message));
    }
    */

    // Option B: stub flow (default):
    alert(`Checkout payload (preview):\n\n${JSON.stringify({ items: payload.items, subtotal, shipping, tax, total }, null, 2)}\n\nWhen you wire the backend, this will call /api/orders to create a PaymentIntent.`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
      <div>
        {cart.items.length === 0 ? (
          <div className="small">Your cart is empty. <Link href="/products">Browse products</Link></div>
        ) : (
          cart.items.map(it => (
            <div key={it.productId} className="cart-list" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={it.image || '/placeholder.png'} alt={it.title} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  <div className="small">₹{it.price}</div>
                  <div style={{ marginTop: 6 }}>
                    Qty:
                    <input
                      type="number"
                      min="1"
                      value={it.qty}
                      onChange={(e) => updateQty(it.productId, e.target.value)}
                      style={{ width: 72, marginLeft: 8 }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>₹{(Number(it.price) * Number(it.qty)).toFixed(0)}</div>
                  <button className="btn" onClick={() => removeItem(it.productId)} style={{ marginTop: 8 }}>Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <aside>
        <div className="cart-list">
          <h3>Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="small">Subtotal</span><strong>₹{subtotal}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="small">Shipping</span><strong>₹{shipping}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="small">Tax (approx)</span><strong>₹{tax}</strong></div>
          <hr style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Total</strong><strong>₹{total}</strong></div>

          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={handleCheckout} disabled={cart.items.length === 0}>Proceed to checkout</button>
            <button className="btn outline" onClick={clearCart} style={{ marginLeft: 8 }}>Clear</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
