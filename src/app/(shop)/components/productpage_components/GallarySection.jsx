"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "@/app/context/WishlistContext";
import { toast } from "react-hot-toast";

export default function GallerySection({
    product,
    discount,
    currentVariant,
    activeImgIdx,
    setActiveImgIdx,
    customText = "",
    selectedFont = "Inter",
    isCustomizing = false }) {

    const images = currentVariant?.images || [];
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(null);
    const autoPlayRef = useRef(null);
    const { toggleWishlist, isItemWishlisted, wishlistIds } = useWishlist()


    const handleNext = useCallback(() => {
        setActiveImgIdx((prev) => (prev + 1) % images.length);
    }, [images.length, setActiveImgIdx]);

    const handlePrev = useCallback(() => {
        setActiveImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length, setActiveImgIdx]);

    const handleShare = async () => {
        const shareData = {
            title: product?.title || "Bouncy Bucket",
            text: `Check out this ${product?.title} on Bouncy Bucket!`,
            url: window.location.href, // Or a specific product link: `${window.location.origin}/product/${product?._id}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support Web Share API
                await navigator.clipboard.writeText(shareData.url);
                toast.success("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    const active = isItemWishlisted(product._id);

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product._id);
    };

    // Auto-play Logic
    useEffect(() => {
    // We add !isCustomizing to the condition
    if (!isPaused && !isLightboxOpen && images.length > 1 && !isCustomizing) {
        autoPlayRef.current = setInterval(handleNext, 4000);
    } else {
        clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
}, [isPaused, isLightboxOpen, handleNext, images.length, isCustomizing]);

    // Scroll Lock for Lightbox
    useEffect(() => {
        document.body.style.overflow = isLightboxOpen ? "hidden" : "auto";
    }, [isLightboxOpen]);

    const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        if (!touchStartX.current) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? handleNext() : handlePrev();
        }
        touchStartX.current = null;
    };

    return (
        <div className="gallery-container">
            {/* --- LIGHTBOX --- */}
            {isLightboxOpen && (
                <div className="lb-backdrop" onClick={() => setIsLightboxOpen(false)}>
                    <div className="lb-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lb-close" onClick={() => setIsLightboxOpen(false)}><p>X</p></button>
                        <button className="lb-arrow prev" onClick={handlePrev}><ChevronLeft size={32} /></button>
                        <div className="lb-image-box" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                            <Image src={images[activeImgIdx]} alt="Zoom" fill className="lb-img-render" priority />
                        </div>
                        <button className="lb-arrow next" onClick={handleNext}><ChevronRight size={32} /></button>
                    </div>
                </div>
            )}

            {/* --- MAIN DISPLAY --- */}
            <div
                className="main-viewport"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={(e) => { setIsPaused(true); onTouchStart(e); }}
                onTouchEnd={(e) => { setIsPaused(false); onTouchEnd(e); }}
            >
                {/* 1. Updated Discount Badge */}
                {discount > 0 && <span className="save-badge">-{discount}%</span>}

                {/* 2. Added Share and Wishlist Buttons */}
                <div className="viewport-actions">
                    {/* Wishlist Button */}
                    <button
                        className={`action-btn wishlist ${active ? "active" : ""}`}
                        onClick={handleWishlistClick}
                        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart
                            size={20}
                            // Toggle between outline and filled based on state
                            fill={active ? "#ff3b30" : "none"}
                            color={active ? "#ff3b30" : "currentColor"}
                        />
                    </button>

                    {/* Share Button */}
                    <button
                        className="action-btn share"
                        onClick={handleShare}
                        aria-label="Share Product"
                    >
                        <Share2 size={18} />
                    </button>
                </div>


                <div className="viewport-clicker" onClick={() => !isCustomizing && setIsLightboxOpen(true)}>
                    <Image src={images[activeImgIdx]} alt={product?.title} fill className="main-img-render" priority />
                    
                    {/* --- LIVE ENGRAVING LAYER --- */}
                    {isCustomizing && customText && (
                        <div 
                          className="engraving-canvas"
                          style={{
                            top: product.customizationOptions?.textPosition?.top || "55%",
                            left: product.customizationOptions?.textPosition?.left || "50%",
                            fontFamily: selectedFont
                          }}
                        >
                            <span className="live-text">{customText}</span>
                        </div>
                    )}
                </div>

                {/* Hide Nav if Customizing for better focus */}
                {!isCustomizing && (
                    <div className="viewport-nav">
                        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }}><ChevronLeft size={20} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleNext(); }}><ChevronRight size={20} /></button>
                    </div>
                )}
            </div>


            {/* --- THUMBNAILS --- */}
            <div className="thumb-strip">
                {images.map((img, i) => (
                    <div
                        key={i}
                        className={`thumb-item ${i === activeImgIdx ? "active" : ""}`}
                        onClick={() => setActiveImgIdx(i)}
                    >
                        <Image src={img} alt="thumb" fill style={{ objectFit: 'cover' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}