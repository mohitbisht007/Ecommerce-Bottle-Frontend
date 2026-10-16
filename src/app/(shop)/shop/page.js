
import ShopClient from "@/components/shop/catalog/ShopClient";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";

  return {
    title: category
      ? `${category} Water Bottles | BouncyBucket`
      : "Shop All Collections | BouncyBucket",
    description:
      "Discover premium water bottles. Filter by price, color, capacity, material and features.",
  };
}

async function getShopData(searchParams) {
  const params = await searchParams;
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value != null && value !== "") {
      query.set(key, String(value));
    }
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fallback = {
    products: [],
    categories: [],
    filters: {
      colors: [],
      capacities: [],
      materials: [],
      maxPrice: 5000,
    },
    totalPages: 1,
    currentPage: 1,
    totalProducts: 0,
  };

  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not configured.");
    return fallback;
  }

  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${apiUrl}/products?${query.toString()}`, {
        cache: "no-store",
      }),
      fetch(`${apiUrl}/categories`, {
        cache: "no-store",
      }),
    ]);

    if (!productsResponse.ok || !categoriesResponse.ok) {
      console.error("Shop API request failed.");
      return fallback;
    }

    const [productsData, categoriesData] = await Promise.all([
      productsResponse.json(),
      categoriesResponse.json(),
    ]);

    return {
      products: productsData.items || [],
      categories: categoriesData.categories || [],
      filters: productsData.filters || fallback.filters,
      totalPages: productsData.pages || 1,
      currentPage: Number(productsData.page) || 1,
      totalProducts: productsData.total || 0,
    };
  } catch (error) {
    console.error("Failed to load shop data:", error);
    return fallback;
  }
}

export default async function ShopPage({ searchParams }) {
  const {
    products,
    categories,
    filters,
    totalPages,
    currentPage,
    totalProducts,
  } = await getShopData(searchParams);

  return (
    <ShopClient
      initialProducts={products}
      availableCategories={categories}
      availableFilters={filters}
      totalPages={totalPages}
      currentPage={currentPage}
      totalProducts={totalProducts}
    />
  );
}
