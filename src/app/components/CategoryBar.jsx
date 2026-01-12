"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Link from "next/link";

export default function CategoryBar({ title, query }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${query}&limit=4`);
        const data = await res.json();
        setProducts(data.items || []);
      } catch (err) {
        console.error("Failed to fetch category products");
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [query]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="category-row-section">
      <div className="container">
        <div className="row-header">
          <h2>{title}</h2>
          <Link href={`/shop?${query}`} className="view-all">
            View All →
          </Link>
        </div>

        <div className="products-grid">
          {loading 
            ? [1, 2, 3, 4].map((i) => <div key={i} className="skeleton-card"></div>)
            : products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
          }
        </div>
      </div>
    </section>
  );
}