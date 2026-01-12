import "./globals.css"
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";
import { Inter } from 'next/font/google' // Optimized Google Font

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: "Bottle Shop | Premium Hydration",
    template: "%s | Bottle Shop" // Allows sub-pages to have titles like "Gallon Bottle | Bottle Shop"
  },
  description: "Discover our curated collection of luxury, eco-friendly, and high-performance water bottles.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://yourbottleshop.com',
    siteName: 'Bottle Shop',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} style={{ margin: 0 }}>
        <CartProvider>
          {/* CartSidebar stays here so it can be toggled from anywhere */}
          <CartSidebar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}