// src/components/AutoImageProductCard.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; 

export default function AutoImageProductCard({ product }) {
    
    // Safety check for image URLs and fallback
    const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
    const imagesToDisplay = allImages.filter(src => src && typeof src === 'string' && src.trim() !== '');

    if (imagesToDisplay.length === 0) {
        // Fallback: Use a generic placeholder if all images fail
        imagesToDisplay.push('/placeholder-product.png'); 
    }
    
    const [index, setIndex] = useState(0);

    // Image Carousel Logic (runs every 2000ms)
    useEffect(() => {
        if (imagesToDisplay.length <= 1) return;
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % imagesToDisplay.length);
        }, 2000); // 2-second interval
        return () => clearInterval(id);
    }, [imagesToDisplay.length]);

    // Format price display
    const formatPrice = (p) => `₹ ${Number(p)}`;

    console.log(product)

    return (
        <div className="showcase-product">
            
            {/* Image Wrapper (Taller and Rounded) */}
            <div className="img-wrap">
                {imagesToDisplay.map((src, idx) => (
                    <Image
                        key={idx}
                        src={src}
                        alt={`${product.title} image ${idx + 1}`}
                        className={`showcase-img ${idx === index ? 'active' : ''}`}
                        width={280} // Matches card width for proper sizing
                        height={220} // Matches new taller height
                        priority={idx === 0}
                    />
                ))}
            </div>

            {/* Content Area */}
            <div className="product-content">
                
                <h4>{product.title}</h4>

                <div className="price-row">
                    <span className="price">{formatPrice(product.price)}</span>
                    {product.compareAtPrice && (
                        <span className="compare">{formatPrice(product.compareAtPrice)}</span>
                    )}
                </div>

                <div className="actions">
                    <button className="btn add-to-cart">Add to Cart</button>
                    <Link href={`/products/${product.slug}`} className="text-link view-product">
                        View Product
                    </Link>
                </div>
            </div>
        </div>
    );
}