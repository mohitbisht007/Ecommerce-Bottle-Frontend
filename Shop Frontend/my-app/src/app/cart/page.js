// src/app/cart/page.js  (Server Component — renders the client)
import CartClient from "../components/CartClient";

export default function CartPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Your cart</h1>
      <CartClient />
    </div>
  );
}
