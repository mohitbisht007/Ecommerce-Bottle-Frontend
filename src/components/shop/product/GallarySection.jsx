"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useWishlist } from "@/app/context/WishlistContext";
import { toast } from "react-hot-toast";
import ImageLightbox from "@/components/ui/ImageLightbox";

const getCustomizationRules = (capacity, orientation, engravingSize) => {
    const caps = capacity?.toLowerCase() || "750ml";

    // Scale multipliers - Adjusted to make 3inch noticeably "Bold"
    const sizeMultiplier = {
        "1inch": 0.5,
        "2inch": 0.85,
        "3inch": 1.3 // Increased for real impact
    };
    const m = sizeMultiplier[engravingSize] || 0.85;

    const baseRules = {
        "500ml": { horizontal: 1.0, vertical: 1.4, widthLimit: "25%" },
        "750ml": { horizontal: 1.3, vertical: 1.7, widthLimit: "30%" },
        "1000ml": { horizontal: 1.6, vertical: 2.1, widthLimit: "35%" }
    };

    const config = baseRules[caps] || baseRules["750ml"];
    // FIX: Use the specific orientation base size
    const baseSize = orientation === "vertical" ? config.vertical : config.horizontal;

    return {
        fontSize: `${baseSize * m}rem`,
        widthLimit: config.widthLimit,
        maxChars: orientation === "vertical" ? 10 : 15
    };
};

export default function GallerySection({
    product,
    selectedSize,
    currentVariant,
    activeImgIdx,
    setActiveImgIdx,
    customText = "",
    selectedFont = "Montserrat",
    isCustomizing = false,
    orientation = "vertical", // "horizontal" or "vertical"
    engravingSize,
}) {

    const images = currentVariant?.images || [];
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(null);
    const autoPlayRef = useRef(null);
    const { toggleWishlist, isItemWishlisted, wishlistIds } = useWishlist()

    const activeRules = getCustomizationRules(
        selectedSize?.capacity,
        orientation,
        engravingSize
    );

    // 2. Logic for Engraving Color (Black vs White)
    const engravingColor = currentVariant?.engravingColorType === 'dark'
        ? "rgba(0,0,0,0.8)"      // Black font for light bottles
        : "rgba(255,255,255,0.9)";

    const currentPrice =
        selectedSize?.price || product.price;

    const comparePrice =
        selectedSize?.compareAtPrice;

    const discount =
        comparePrice && currentPrice
            ? Math.round(
                ((comparePrice - currentPrice) /
                    comparePrice) *
                100
            )
            : 0;

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
            <ImageLightbox
                isOpen={isLightboxOpen && images.length > 0}
                onClose={() => setIsLightboxOpen(false)}
                src={images[activeImgIdx]}
                alt={product?.title ? `${product.title} — image ${activeImgIdx + 1}` : "Product image"}
                showNav={images.length > 1}
                onPrev={handlePrev}
                onNext={handleNext}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                counter={
                    images.length > 1
                        ? `${activeImgIdx + 1} / ${images.length}`
                        : null
                }
            />

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
                            className={`engraving-canvas ${orientation}`}
                            style={{
                                top: product.customizationOptions?.textPosition?.top || "55%",
                                left: product.customizationOptions?.textPosition?.left || "50%",
                                fontFamily: selectedFont,
                                color: engravingColor,
                                fontSize: activeRules.fontSize,
                                letterSpacing: activeRules.letterSpacing,
                                // Apply rotation based on orientation
                                transform: orientation === 'vertical'
                                    ? 'translate(-50%, -50%) rotate(90deg)'
                                    : 'translate(-50%, -50%)'
                            }}
                        >
                            <span className="live-text">
                                {/* Limit text strictly based on capacity rules */}
                                {customText.substring(0, activeRules.maxChars)}
                            </span>
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