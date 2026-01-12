import "./globals.css"
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";

export const metadata = {
  title: "Bottle Shop",
  description: "Buy the best bottles",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <CartProvider>
          <CartSidebar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}