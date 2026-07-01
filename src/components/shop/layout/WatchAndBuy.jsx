"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye, Star, Maximize2, Play } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import FullScreenReelModal from "./FullScreenReelModal";

export default function WatchAndBuy() {
    const sectionRef = useRef(null);
    const { addToCart } = useCart();
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeModalIdx, setActiveModalIdx] = useState(null);

    const convertToSlug = (title) => {
        if (!title) return "";
        return title
            .toLowerCase()
            .trim()
            // 1. Convert the pipe character '|' directly to 'or' before running main cleanup strips
            .replace(/\|/g, "or")
            // 2. Remove any remaining invalid characters that aren't letters, numbers, spaces, or hyphens
            .replace(/[^\w\s-]/g, "")
            // 3. Flatten spaces, underscores, and consecutive hyphens down to a single clean hyphen
            .replace(/[\s_]+/g, "-")
            .replace(/-+/g, "-")
            // 4. Trim any trailing or leading dangling edge hyphens
            .replace(/^-+|-+$/g, "");
    };

    useEffect(() => {
        const fetchReelStream = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/stream`);
                const data = await res.json();
                if (data.success) setReels(data.reels || []);
            } catch (err) {
                console.error("Failed to stream Watch & Buy video nodes:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReelStream();
    }, []);

    useEffect(() => {
        if (loading || reels.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const videos = entry.target.querySelectorAll("video");
                    videos.forEach((video) => {
                        if (entry.isIntersecting) {
                            video.play().catch(() => { });
                        } else {
                            video.pause();
                        }
                    });
                });
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, [reels, loading]);

    const handleQuickAdd = (e, targetProduct) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!targetProduct || !targetProduct._id) return;

        // 1. Safe Variant Fallback extraction
        const hasVariants = targetProduct.variants && targetProduct.variants.length > 0;
        const currentVariant = hasVariants ? targetProduct.variants[0] : null;
        const selectedSize = currentVariant?.capacities?.[0] || null;

        // 2. Structural parameters gathering with robust root-level fallbacks
        const color = currentVariant?.colorName || currentVariant?.baseColorName || "Default";
        const capacity = selectedSize?.capacity || "Standard";

        // Fall back to root values if variants are absent or empty
        const itemPrice = selectedSize?.price || targetProduct.price;
        const itemComparePrice = selectedSize?.compareAtPrice ?? targetProduct.compareAtPrice;

        // 3. Assemble unified payload with matching image keys
        const unifiedPayload = {
            ...targetProduct,
            price: itemPrice,
            compareAtPrice: itemComparePrice,
            thumbnail: targetProduct.thumbnail || targetProduct.image || currentVariant?.images?.[0] || "/placeholder.jpg",
            image: targetProduct.image || targetProduct.thumbnail || currentVariant?.images?.[0] || "/placeholder.jpg"
        };

        // 4. Push directly into your global context state
        addToCart(
            unifiedPayload,
            1,
            color,
            capacity
        );

        console.log(`${targetProduct.title} added to your bag smoothly.`);
    };

    if (loading) return null;
    if (reels.length === 0) return null;

    return (
        <section ref={sectionRef} className="py-24 bg-slate-950 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">

                <header className="mb-16 text-center max-w-2xl mx-auto space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-900/30 inline-block">
                        Bouncy Bucket TV
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                        Watch & Buy
                    </h2>
                    <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mt-2"></div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {reels.map((reel, idx) => {
                        const product = reel.linkedProduct || {};
                        const productImg = product.thumbnail || product.image || "/placeholder.jpg";
                        const productSlug = convertToSlug(product.title);

                        return (
                            <div
                                key={reel._id}
                                onClick={() => setActiveModalIdx(idx)}
                                className="group relative aspect-[9/16] bg-slate-900 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl cursor-pointer hover:border-slate-800 transition-all duration-500 hover:-translate-y-2"
                            >
                                <video
                                    src={reel.videoUrl}
                                    poster={reel.thumbnailUrl || "/placeholder.jpg"}
                                    loop
                                    muted
                                    playsInline
                                    autoPlay
                                    preload="none"
                                    className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-500"
                                />

                                <div className="absolute inset-0 flex items-center justify-center transition-all duration-300">
                                    <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                                        <Play size={16} fill="currentColor" className="ml-0.5 text-white" />
                                    </div>
                                </div>

                                <div className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                                    <Maximize2 size={12} />
                                </div>

                                {/* Overlaid Card Capsule */}
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute bottom-3 inset-x-3 bg-slate-950/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl flex flex-col items-center text-center transform transition-all duration-300 group-hover:border-white/20"
                                >
                                    <div className="relative w-12 h-12 bg-white rounded-full p-0.5 overflow-hidden border border-white/10 shadow-lg -mt-8 mb-2 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                                        <div className="relative w-full h-full rounded-full overflow-hidden">
                                            <Image src={productImg} alt={product.title || "Bottle"} fill sizes="48px" className="object-cover" />
                                        </div>
                                    </div>

                                    <div className="w-full min-w-0">
                                        <h4 className="text-[11px] font-black text-white truncate tracking-wide uppercase leading-tight">
                                            {product.title || "Luxury Edition"}
                                        </h4>
                                        <div className="flex items-center justify-center gap-1 mt-1 text-[9px] text-slate-400">
                                            <div className="flex text-amber-400"><Star size={8} fill="currentColor" /></div>
                                            <span className="font-bold text-slate-200">{product.rating || "4.8"}</span>
                                        </div>
                                        <div className="text-xs font-black text-emerald-400 mt-1.5 bg-emerald-950/40 px-3 py-0.5 rounded-md border border-emerald-500/10 inline-block">
                                            ₹{product.price}
                                        </div>
                                    </div>

                                    {/* MODIFIED: Changed max-h rules to show immediately on mobile views */}
                                    <div className="w-full grid grid-cols-5 gap-1.5 mt-3 pt-2 border-t border-white/5 md:opacity-0 md:max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-[40px] md:transition-all md:duration-500 ease-in-out">
                                        <button
                                            type="button"
                                            onClick={(e) => handleQuickAdd(e, product)} // FIXED: Context parameter binding restored
                                            className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                                        >
                                            <ShoppingBag size={12} strokeWidth={2.5} />
                                        </button>
                                        <Link
                                            href={`/shop/${productSlug}`}
                                            className="col-span-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/5 transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-0.5"
                                        >
                                            Details <Eye size={10} />
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>

            </div>

            {activeModalIdx !== null && (
                <FullScreenReelModal
                    reels={reels}
                    initialIdx={activeModalIdx}
                    onClose={() => setActiveModalIdx(null)}
                    onAddToCart={handleQuickAdd}
                    convertToSlug={convertToSlug}
                />
            )}
        </section>
    );
}