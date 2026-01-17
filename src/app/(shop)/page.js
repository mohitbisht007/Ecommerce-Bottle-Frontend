import CategoryBar from '../components/CategoryBar';
import HeroCarousel from '../components/HeroCarousel';
import CategoryTray from '../components/CategoryTray';
import PriceRangeTray from '../components/PriceRangeTray';
import ComparisonBanner from './components/ComparisonBanner';

// 1. Metadata remains the same
export const metadata = {
  title: "Premium Water Bottles | Insulated Steel & Glass | BouncyBucket",
  description: "Shop high-quality, eco-friendly insulated water bottles. Keep your drinks cold for 24 hours.",
};

async function getHomeData() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const fallback = { banners: [], categories: [], steelBottles: [], newArrivals: [] };

  if (!base) return fallback;

  try {
    const [bannersRes, catsRes, steelRes, newArrivalsRes] = await Promise.all([
      fetch(`${base}/storefront/banners`, { next: { revalidate: 3600 } }),
      fetch(`${base}/categories`, { cache: 'no-store' }),
      fetch(`${base}/products?category=steel&limit=4`, { cache: 'no-store' }),
      fetch(`${base}/products?sort=newest&limit=4`, { cache: 'no-store' })
    ]);

    // Check every response for JSON content-type
    const results = await Promise.all([bannersRes, catsRes, steelRes, newArrivalsRes].map(async (res) => {
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        return await res.json();
      }
      return null;
    }));

    return {
      banners: results[0] || [],
      categories: results[1]?.categories || [],
      steelBottles: results[2]?.items || [],
      newArrivals: results[3]?.items || [],
    };
  } catch (err) {
    console.error("Home data fetch failed during build:", err.message);
    return fallback;
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <main>
      {/* 2. H1 is critical for SEO. Usually placed in the Hero */}
      <HeroCarousel banners={data.banners} />
      <CategoryTray categories={data.categories} />

      {/* 3. Passing pre-fetched products to avoid "loading skeletons" */}
      <CategoryBar 
        title="Bestselling Steel Bottles" 
        products={data.steelBottles} 
        query="category=steel" 
      />

      <ComparisonBanner />

      <CategoryBar 
        title="New Arrivals" 
        products={data.newArrivals} 
        query="sort=newest" 
      />

      <PriceRangeTray />
    </main>
  );
}