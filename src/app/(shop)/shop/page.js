import ShopClient from "../components/ShopClient";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const category = params.category || "";
  
  return {
    title: category 
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Water Bottles | BouncyBucket` 
      : "Shop All Collections | BouncyBucket",
    description: `Browse our ${category || 'premium'} collection of eco-friendly water bottles. Filter by price, size, and color.`,
  };
}

async function getShopData(searchParams) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params).toString();

  // Fetch both in parallel for maximum speed
  const [productsRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryString}`, { cache: "no-store" }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { cache: "no-store" })
  ]);

  const productsData = await productsRes.json();
  const categoriesData = await categoriesRes.json();

  return {
    products: productsData.items || [],
    categories: categoriesData.categories || []
  };
}

export default async function ShopPage({ searchParams }) {
  const { products, categories } = await getShopData(searchParams);

  return (
    <ShopClient 
      initialProducts={products} 
      availableCategories={categories} 
    />
  );
}