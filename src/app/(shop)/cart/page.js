import CartClient from "@/app/components/CartClient";
import ClientOnly from "@/app/components/ClientOnly";

export default function CartPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Your cart</h1>
      {/* Wrapping CartClient in ClientOnly ensures that localStorage 
         and window events inside CartClient never run during build.
      */}
      <ClientOnly>
        <CartClient />
      </ClientOnly>
    </div>
  );
}