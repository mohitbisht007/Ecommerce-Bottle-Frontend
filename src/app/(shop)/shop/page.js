import ShopClient from "../components/ShopClient";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const category = params.category || "";

  return {
    title: category
      ? `${
          category.charAt(0).toUpperCase() + category.slice(1)
        } Water Bottles | BouncyBucket`
      : "Shop All Collections | BouncyBucket",
    description: `Browse our ${
      category || "premium"
    } collection of eco-friendly water bottles. Filter by price, size, and color.`,
  };
}

async function getShopData(searchParams) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params).toString();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 1. Safety Check: If URL is missing, don't even try
  if (!apiUrl) {
    console.error("API URL is missing in Environment Variables!");
    return { products: [], categories: [] };
  }

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/products?${queryString}`, { cache: "no-store" }),
      fetch(`${apiUrl}/categories`, { cache: "no-store" }),
    ]);

    // 2. Content-Type Check: Ensure we actually got JSON
    const isProductsJson = productsRes.headers
      .get("content-type")
      ?.includes("application/json");
    const isCategoriesJson = categoriesRes.headers
      .get("content-type")
      ?.includes("application/json");

    if (!isProductsJson || !isCategoriesJson) {
      console.warn(
        "API returned HTML instead of JSON (possibly Render sleeping). Returning empty data for build."
      );
      return { products: [], categories: [] };
    }

    const productsData = await productsRes.json();
    const categoriesData = await categoriesRes.json();

    return {
      products: productsData.items || [],
      categories: categoriesData.categories || [],
    };
  } catch (error) {
    // 3. Graceful Failure: Build continues even if API is down
    console.error("Fetch failed during build:", error.message);
    return { products: [], categories: [] };
  }
}

export default async function ShopPage({ searchParams }) {
  const { products, categories } = await getShopData(searchParams);

  return (
    <ShopClient initialProducts={products} availableCategories={categories} />
  );
}
