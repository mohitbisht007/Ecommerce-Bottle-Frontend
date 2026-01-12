// src/app/page.js
import CategoryBar from '../components/CategoryBar';
import FeaturedProducts from '../components/FeaturedProducts';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import CategoryTray from '../components/CategoryTray';
import PriceRangeTray from '../components/PriceRangeTray';

async function fetchHomeData() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  
  // Fetch Banners and Products in parallel for speed
  const [bannersRes, productsRes] = await Promise.all([
    fetch(`${base}/storefront/banners`, { cache: 'no-store' }),
    fetch(`${base}/products?limit=8&sort=newest`, { cache: 'no-store' })
  ]);

  const banners = await bannersRes.json();
  const productsJson = await productsRes.json();

  return {
    // If banners is an array, we extract just the URLs for your current carousel
    bannerImages: banners.length > 0 ? banners.map(b => b.imageUrl) : [],
    newArrivals: productsJson.items || []
  };
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