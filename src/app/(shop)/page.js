import CategoryBar from '@/components/shop/home/CategoryBar';
import HeroCarousel from '@/components/shop/home/HeroCarousel';
import PriceRangeTray from '@/components/shop/home/PriceRangeTray';
import ComparisonBanner from '@/components/shop/home/ComparisonBanner';
import DeliveryRadar from '@/components/shop/home/DeliveryRadar';
import WhatsAppButton from '@/components/shop/home/WhatsAppButton';
import WatchAndBuy from '@/components/shop/layout/WatchAndBuy';

// 1. Metadata remains the same
export const metadata = {
  title: "Premium Water Bottles | Insulated Steel & Glass | BouncyBucket",
  description: "Shop high-quality, eco-friendly insulated water bottles. Keep your drinks cold for 24 hours.",
};

async function getHomeData() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const fallback = { banners: [], categories: [], steelBottles: [], newArrivals: [], tumbler: [], };

  if (!base) return fallback;

  try {
    const [bannersRes,
      catsRes,
      steelRes,
      tumblerRes,
      newArrivalsRes,] = await Promise.all([
      fetch(`${base}/storefront/banners`, { next: { revalidate: 60 } }),
      fetch(`${base}/categories`, { next: { revalidate: 60 } }),
      fetch(`${base}/products?category=stainless-steel&limit=4`, { next: { revalidate: 60 } }),
      fetch(`${base}/products?category=tumbler&limit=4`, { next: { revalidate: 60 } }),
      fetch(`${base}/products?sort=newest&limit=4`, { next: { revalidate: 60 } })
    ]);

    // Check every response for JSON content-type
    const results = await Promise.all([bannersRes,
        catsRes,
        steelRes,
        tumblerRes,
        newArrivalsRes,].map(async (res) => {
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        return await res.json();
      }
      return null;
    }));

    return {
      banners: results[0] || [],
      categories: results[1]?.categories || [],
      steelBottles: results[2]?.items || [],
      tumbler: results[3]?.items || [],
      newArrivals: results[4]?.items || [],
    };
  } catch (err) {
    console.error("Home data fetch failed during build:", err.message);
    return fallback;
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  console.log(data)

  return (
    <main>
      {/* 2. H1 is critical for SEO. Usually placed in the Hero */}
      <HeroCarousel banners={data.banners} />
      <CategoryBar
        title="New Arrivals"
        products={data.newArrivals}
        query="sort=newest"
      />


      <CategoryBar
        title="Tumbers"
        products={data.tumbler}
        query="sort=newest"
      />

      <CategoryBar
        title="Steel Bottles"
        products={data.steelBottles}
        query="category=steel"
      />

      

      <ComparisonBanner />
      < DeliveryRadar />

      {/* 3. Passing pre-fetched products to avoid "loading skeletons" */}
      
      <PriceRangeTray />
      <WatchAndBuy />
      <WhatsAppButton />
    </main>
  );
}