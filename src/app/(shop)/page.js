// src/app/page.js
import CategoryBar from '../components/CategoryBar';
import FeaturedProducts from '../components/FeaturedProducts';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import CategoryTray from '../components/CategoryTray';
import PriceRangeTray from '../components/PriceRangeTray';

export const metadata = {
  title: "Premium Water Bottles | Insulated Steel & Glass | Bottle Shop",
  description: "Shop high-quality, eco-friendly insulated water bottles. Keep your drinks cold for 24 hours. Free shipping on orders over ₹500.",
  keywords: ["steel bottles", "insulated water bottle", "gym bottles", "eco-friendly"]
};

async function fetchHomeData() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    const [bannersRes, productsRes] = await Promise.all([
      fetch(`${base}/storefront/banners`, { next: { revalidate: 3600 } }), // Cache for 1 hour
      fetch(`${base}/products?limit=8&sort=newest`, { cache: 'no-store' })
    ]);

    if (!bannersRes.ok || !productsRes.ok) throw new Error("Failed to fetch data");

    const banners = await bannersRes.json();
    const productsJson = await productsRes.json();

    return {
      bannerImages: banners.length > 0 ? banners.map(b => b.imageUrl) : [],
      newArrivals: productsJson.items || []
    };
  } catch (err) {
    console.error("Home Data Error:", err);
    return { bannerImages: [], newArrivals: [] }; // Fallback to empty
  }
}

export default async function HomePage() {
  const { bannerImages, newArrivals } = await fetchHomeData();

  // Fallback images if none are uploaded in admin yet
  const fallbackImages = [
    'https://www.solara.in/cdn/shop/files/WhatsApp_Image_2025-11-05_at_5.46.28_PM.jpg?v=1762511484&width=1600'
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Now uses dynamic banners from your Admin Dashboard */}
      <HeroCarousel 
        images={bannerImages.length > 0 ? bannerImages : fallbackImages} 
        interval={4500} 
        height="500px" 
      />

      <CategoryBar title="Bestselling Steel Bottles" query="category=Steel"/>

      <CategoryBar title="New Arrivals" query="sort=new" />
      <PriceRangeTray />
      <CategoryTray />
    </div>
  );
}