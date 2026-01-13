import CategoryBar from '../components/CategoryBar';
import HeroCarousel from '../components/HeroCarousel';
import CategoryTray from '../components/CategoryTray';
import PriceRangeTray from '../components/PriceRangeTray';

// 1. Metadata remains the same
export const metadata = {
  title: "Premium Water Bottles | Insulated Steel & Glass | BouncyBucket",
  description: "Shop high-quality, eco-friendly insulated water bottles. Keep your drinks cold for 24 hours.",
};

async function getHomeData() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  
  // Parallel fetch for speed
  const [bannersRes, catsRes, steelRes, newArrivalsRes] = await Promise.all([
    fetch(`${base}/storefront/banners`, { next: { revalidate: 3600 } }),
    fetch(`${base}/categories`, { next: { revalidate: 3600 } }),
    fetch(`${base}/products?category=steel&limit=4`, { cache: 'no-store' }),
    fetch(`${base}/products?sort=newest&limit=4`, { cache: 'no-store' })
  ]);

  return {
    banners: (await bannersRes.json()) || [],
    categories: (await catsRes.json()).categories || [],
    steelBottles: (await steelRes.json()).items || [],
    newArrivals: (await newArrivalsRes.json()).items || [],
  };
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <main>
      {/* 2. H1 is critical for SEO. Usually placed in the Hero */}
      <HeroCarousel banners={data.banners} />

      {/* 3. Passing pre-fetched products to avoid "loading skeletons" */}
      <CategoryBar 
        title="Bestselling Steel Bottles" 
        products={data.steelBottles} 
        query="category=steel" 
      />

      <CategoryBar 
        title="New Arrivals" 
        products={data.newArrivals} 
        query="sort=newest" 
      />

      <PriceRangeTray />

      <CategoryTray categories={data.categories} />
    </main>
  );
}