"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Cart() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState({ items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);

    const raw = localStorage.getItem("bottle_cart");
    setCart(raw ? JSON.parse(raw) : { items: [] });

    const handler = () => {
      const data = localStorage.getItem("bottle_cart");
      setCart(data ? JSON.parse(data) : { items: [] });
    };

    window.addEventListener("bottle_cart_updated", handler);
    return () => window.removeEventListener("bottle_cart_updated", handler);
  }, []);

  const persist = (nextCart) => {
    setCart(nextCart);
    localStorage.setItem("bottle_cart", JSON.stringify(nextCart));
    window.dispatchEvent(
      new CustomEvent("bottle_cart_updated", { detail: nextCart })
    );
  };

  const updateQty = (productId, qty) => {
    const next = {
      items: cart.items.map((it) =>
        it.productId === productId
          ? { ...it, qty: Math.max(1, Number(qty) || 1) }
          : it
      ),
    };
    persist(next);
  };

  const removeItem = (productId) => {
    persist({ items: cart.items.filter((it) => it.productId !== productId) });
  };

  const clearCart = () => persist({ items: [] });

  const subtotal = cart.items.reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
    0
  );
  const shipping = subtotal > 999 ? 0 : subtotal === 0 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!cart.items.length) return alert("Cart is empty");

    alert(
      JSON.stringify(
        { subtotal, shipping, tax, total, items: cart.items },
        null,
        2
      )
    );
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: 20,
      }}
    >
      <div>
        {cart.items.length === 0 ? (
          <div className="small">
            Your cart is empty. <Link href="/products">Browse products</Link>
          </div>
        ) : (
          cart.items.map((it) => (
            <div key={it.productId} className="cart-list">
              <div style={{ display: "flex", gap: 12 }}>
                <img
                  src={it.image || "/placeholder.png"}
                  alt={it.title}
                  width={80}
                  height={80}
                  style={{ borderRadius: 6, objectFit: "cover" }}
                />

                <div style={{ flex: 1 }}>
                  <strong>{it.title}</strong>
                  <div className="small">₹{it.price}</div>
                  <div>
                    Qty:
                    <input
                      type="number"
                      min="1"
                      value={it.qty}
                      onChange={(e) =>
                        updateQty(it.productId, e.target.value)
                      }
                      style={{ width: 70, marginLeft: 8 }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  ₹{it.price * it.qty}
                  <button onClick={() => removeItem(it.productId)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <aside>
        <div className="cart-list">
          <h3>Summary</h3>
          <div>Subtotal: ₹{subtotal}</div>
          <div>Shipping: ₹{shipping}</div>
          <div>Tax: ₹{tax}</div>
          <hr />
          <strong>Total: ₹{total}</strong>

          <div style={{ marginTop: 12 }}>
            <button onClick={handleCheckout}>Checkout</button>
            <button onClick={clearCart} style={{ marginLeft: 8 }}>
              Clear
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
