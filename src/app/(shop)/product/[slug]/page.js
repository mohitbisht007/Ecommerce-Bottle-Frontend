import ProductClient from "@/app/components/ProductClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${slug}`);
    if (!res.ok) return { title: "Product Not Found" };
    const product = await res.json();

    return {
      title: `${product.title} | BouncyBucket`,
      description: product.description?.slice(0, 160),
      openGraph: {
        images: [product.variants[0]?.images[0]],
      },
    };
  } catch (error) {
    return { title: "BouncyBucket" };
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${slug}`, { 
    cache: 'no-store' 
  });

  if (!res.ok) return notFound();
  const product = await res.json();

  // JSON-LD for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.variants[0]?.images[0],
    "description": product.description,
    "brand": { "@type": "Brand", "name": "BouncyBucket" },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "INR",
      "availability": product.variants[0]?.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "url": `${process.env.NEXT_PUBLIC_CLIENT_URL}/product/${slug}`
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 5,
      "reviewCount": product.reviewsCount || 1
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient initialProduct={product} />
    </>
  );
}