export const dynamic = "force-dynamic";

import CartClient from "./CartClient";

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Your cart</h1>
      <CartClient />
    </div>
  );
}
