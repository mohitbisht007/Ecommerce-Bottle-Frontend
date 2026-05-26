export default async function sitemap() {
  const baseUrl = 'https://bouncybucket.com';

  // 1. Static Routes of your storefront
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
  ];

  // 2. Dynamic Product Routes from your Render Backend
  let productRoutes = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=500`, {
      next: { revalidate: 3600 } // Revalidate cache every hour
    });
    const data = await res.json();
    
    if (data && data.items) {
      productRoutes = data.items.map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch product slugs for sitemap generation:", error);
  }

  return [...staticRoutes, ...productRoutes];
}