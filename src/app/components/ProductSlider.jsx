"use client";
import { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";

export default function ProductSlider({ title, subtitle, fetchUrl }) {
  const [products, setProducts] = useState([]);
  const scrollRef = useRef(null); // Reference to the scroll container

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
        else if (data.items) setProducts(data.items);
      } catch (err) { console.error(err); }
    };
    if (fetchUrl) loadData();
  }, [fetchUrl]);

  // Function to scroll the slider
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="slider-section">
      <div className="container"> {/* Added a wrapper container for alignment */}
        <div className="slider-header">
          <div>
            <h2 className="slider-title">{title}</h2>
            <p className="slider-subtitle">{subtitle}</p>
          </div>
          <div className="slider-controls">
            <button className="nav-btn" onClick={() => scroll("left")}>&lt;</button>
            <button className="nav-btn" onClick={() => scroll("right")}>&gt;</button>
          </div>
        </div>

        <div className="product-scroll-container" ref={scrollRef}>
          {products.map(item => (
            <div key={item._id} className="slider-item">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}