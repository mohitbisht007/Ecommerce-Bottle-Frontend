import ProductClient from "@/app/components/ProductClient";

export async function generateMetadata({ params }) {
  // NEXT.JS 15 FIX: Await params
  const { slug } = await params; 
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`);
    
    // Check if the response is actually JSON before parsing
    if (!res.ok) return { title: "Product Not Found" };
    
    const product = await res.json();
    return {
      title: `${product.title} | Bottle Shop`,
      description: product.description?.slice(0, 160),
    };
  } catch (error) {
    return { title: "Bottle Shop" };
  }
}

export default async function Page({ params }) {
  // NEXT.JS 15 FIX: Await params
  const { slug } = await params; 
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${slug}`;
  console.log("Fetching from:", apiUrl); // Debug: Check your terminal for this URL

  const res = await fetch(apiUrl, { cache: 'no-store' });

  // CHECK: If API fails, handle it gracefully so we don't get the JSON error
  if (!res.ok) {
     return <div className="container p-20">Product not found or API is down.</div>;
  }

  const initialProduct = await res.json();
  console.log(initialProduct)

  return <ProductClient initialProduct={initialProduct} />;
}