import "./globals.css";
import { CartProvider } from "./context/CartContext";
import CartSidebar from "./components/CartSidebar";
import { Inter } from "next/font/google"; // Optimized Google Font
import { WishlistProvider } from "./context/WishlistContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Bottle Shop | Premium Hydration",
    template: "%s | Bottle Shop", // Allows sub-pages to have titles like "Gallon Bottle | Bottle Shop"
  },
  description:
    "Discover our curated collection of luxury, eco-friendly, and high-performance water bottles.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://bouncybucket.vercel.app"
  ),
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" }, // Add this!
    ],
    apple: [
      { url: "/logo3.png", sizes: "180x180", type: "image/png" }, // Higher quality for Apple
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://yourbottleshop.com",
    siteName: "Bouncy Bucket",
    images: [
      {
        url: "/og-image.png", // Create a 1200x630 image with your logo for sharing
        width: 1200,
        height: 630,
        alt: "Bottle Shop Premium Hydration",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={inter.className}
        style={{ margin: 0 }}
        suppressHydrationWarning
      >
        <CartProvider>
          <WishlistProvider>
            {/* 2. Place Toaster here so it's available globally */}
            <Toaster position="top-center" />
            <CartSidebar />
            {children}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
