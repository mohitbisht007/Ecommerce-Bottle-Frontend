import ProductDetailClient from "@/app/components/ProductDetailClient";

async function fetchProductBySlug(slug) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const res = await fetch(`${base}/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('fetchProductBySlug', err);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Product not found</h1>
        <p className="small">We couldn't find that product.</p>
      </div>
    );
  }

  // normalize images for safety
  const images = product.images && product.images.length ? product.images : ['/placeholder.png'];

  // pass the product data to the client UI
  return <ProductDetailClient product={{ ...product, images }} />;
}