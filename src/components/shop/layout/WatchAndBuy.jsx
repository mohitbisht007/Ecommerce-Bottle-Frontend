"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye, Star, Maximize2, Play, Plus, Minus } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import FullScreenReelModal from "./FullScreenReelModal";

export default function WatchAndBuy() {
  const sectionRef = useRef(null);
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalIdx, setActiveModalIdx] = useState(null);

  // FIXED: Converts pipe characters to "or" AND ampersands to "and" securely before parsing links
  const convertToSlug = (title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .trim()
      .replace(/\|/g, "or")
      .replace(/&/g, "and") // Explicitly map ampersands to textual matching parameters
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    const fetchReelStream = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/stream`);
        const data = await res.json();
        if (data.success) setReels(data.reels || []);
      } catch (err) {
        console.error(err);
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
            if (entry.isIntersecting) video.play().catch(() => {});
            else video.pause();
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

    const currentVariant = targetProduct.variants?.[0] || {};
    const selectedSize = currentVariant.capacities?.[0] || {};
    const color = currentVariant.colorName || currentVariant.baseColorName || "Default";

    const unifiedPayload = {
      ...targetProduct,
      price: selectedSize.price || targetProduct.price,
      compareAtPrice: selectedSize.compareAtPrice ?? targetProduct.compareAtPrice,
      thumbnail: targetProduct.thumbnail || targetProduct.image || "/placeholder.jpg",
      image: targetProduct.image || targetProduct.thumbnail || "/placeholder.jpg"
    };

    addToCart(unifiedPayload, 1, color, selectedSize.capacity || "Standard");
  };

  if (loading || reels.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-24 bg-slate-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        <header className="mb-16 text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-md border border-emerald-900/30 inline-block">
            Bouncy Bucket TV
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">Watch & Buy</h2>
          <div className="w-12 h-1 bg-emerald-500 mx-auto rounded-full mt-2"></div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {reels.map((reel, idx) => {
            const product = reel.linkedProduct || {};
            const productImg = product.thumbnail || product.image || "/placeholder.jpg";
            const productSlug = convertToSlug(product.title);

            const cartIndex = cartItems.findIndex(item => item._id === product._id);
            const inCartItem = cartIndex !== -1 ? cartItems[cartIndex] : null;

            return (
              <div 
                key={reel._id} 
                onClick={() => setActiveModalIdx(idx)}
                className="group relative aspect-[9/16] bg-slate-900 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl cursor-pointer hover:border-slate-800 transition-all duration-500 hover:-translate-y-2"
              >
                <video src={reel.videoUrl} poster={reel.thumbnailUrl || "/placeholder.jpg"} loop muted playsInline autoPlay preload="none" className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Overlaid Card Capsule */}
                <div onClick={(e) => e.stopPropagation()} className="absolute bottom-3 inset-x-3 bg-slate-950/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl flex flex-col items-center text-center transition-all duration-300">
                  <div className="relative w-12 h-12 bg-white rounded-full p-0.5 overflow-hidden border border-white/10 shadow-lg -mt-8 mb-2 flex-shrink-0">
                    <div className="relative w-full h-full rounded-full overflow-hidden">
                      <Image src={productImg} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                  </div>

                  <div className="w-full min-w-0">
                    <h4 className="text-[11px] font-black text-white truncate tracking-wide uppercase leading-tight">{product.title}</h4>
                    <div className="text-xs font-black text-emerald-400 mt-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/10 inline-block">₹{product.price}</div>
                  </div>

                  <div className="w-full grid grid-cols-5 gap-1.5 mt-3 pt-2 border-t border-white/5 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-[40px] transition-all duration-500 ease-in-out">
                    <div className="col-span-2">
                      {inCartItem ? (
                        <div className="w-full bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between p-0.5 h-full">
                          <button onClick={() => updateQuantity(cartIndex, -1)} className="text-slate-400 hover:text-white px-1"><Minus size={10} /></button>
                          <span className="text-[10px] font-black text-white">{inCartItem.quantity}</span>
                          <button onClick={() => updateQuantity(cartIndex, 1)} className="text-slate-400 hover:text-white px-1"><Plus size={10} /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={(e) => handleQuickAdd(e, product)} className="w-full h-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center justify-center cursor-pointer">
                          <ShoppingBag size={12} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                    <Link href={`/shop/${productSlug}`} className="col-span-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/5 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-0.5">
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
        <FullScreenReelModal reels={reels} initialIdx={activeModalIdx} onClose={() => setActiveModalIdx(null)} convertToSlug={convertToSlug} />
      )}
    </section>
  );
}