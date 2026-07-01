"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, ChevronUp, ChevronDown, Star, ExternalLink } from "lucide-react";

export default function FullScreenReelModal({ reels, initialIdx, onClose, onAddToCart, convertToSlug }) {
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const videoRefs = useRef([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIdx) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIdx]);

  const handleNext = () => currentIdx < reels.length - 1 && setCurrentIdx(currentIdx + 1);
  const handlePrev = () => currentIdx > 0 && setCurrentIdx(currentIdx - 1);

  const activeReel = reels[currentIdx];
  const product = activeReel.linkedProduct || {};
  const productImg = product.thumbnail || product.image || "/placeholder.jpg";
  const productSlug = convertToSlug(product.title);

  const modalContent = (
    <div className="fixed inset-0 w-screen h-screen z-[99999] bg-slate-950 flex flex-col justify-between text-white overflow-hidden animate-fade-in font-sans">
      
      {/* Immersive HUD Header Control bar */}
      <header className="w-full px-6 py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-50 absolute top-0 left-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-900/30 px-2.5 py-1 rounded-md">
            Bouncy Bucket TV
          </span>
          <span className="text-xs font-mono text-slate-300 font-medium hidden sm:inline">
            Reel {currentIdx + 1} of {reels.length}
          </span>
        </div>

        <button 
          onClick={onClose} 
          className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-xl active:scale-95"
        >
          Exit View <X size={14} strokeWidth={2.5} />
        </button>
      </header>

      {/* Main Structural Display Layout */}
      <div className="w-full h-full flex flex-col md:flex-row items-center justify-center max-w-6xl mx-auto overflow-hidden relative">
        
        {/* Core Media Window Node */}
        <div className="relative w-full h-full md:h-[85vh] md:max-w-[400px] bg-black md:rounded-2xl border border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
          <video
            ref={el => videoRefs.current[currentIdx] = el}
            src={activeReel.videoUrl}
            loop
            playsInline
            controls
            controlsList="nodownload nofullscreen noremoteplayback"
            className="w-full h-full object-cover"
          />

          {/* Quick Click Video Viewport Switch Arrows */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-40">
            <button _id="prev-btn" disabled={currentIdx === 0} onClick={handlePrev} className="p-2.5 bg-black/60 border border-white/10 disabled:opacity-20 rounded-full hover:bg-slate-900 transition text-white shadow-xl">
              <ChevronUp size={16} />
            </button>
            <button _id="next-btn" disabled={currentIdx === reels.length - 1} onClick={handleNext} className="p-2.5 bg-black/60 border border-white/10 disabled:opacity-20 rounded-full hover:bg-slate-900 transition text-white shadow-xl">
              <ChevronDown size={16} />
            </button>
          </div>

          {/* MOBILE ONLY LAYER: Floating Product Deck over Video Canvas Bottom */}
          <div className="absolute bottom-6 inset-x-4 bg-slate-950/85 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-3 md:hidden z-30 animate-scale-up">
            <div className="relative w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
              <Image src={productImg} alt={product.title} fill sizes="48px" className="object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-white truncate tracking-wide">{product.title}</h4>
              <div className="text-xs font-black text-emerald-400 mt-0.5">₹{product.price}</div>
            </div>

            <div className="flex gap-1.5">
              <button 
                onClick={(e) => onAddToCart(e, product)}
                className="p-2.5 bg-emerald-500 text-slate-950 rounded-lg shadow-md active:scale-90 transition"
              >
                <ShoppingBag size={14} strokeWidth={2.5} />
              </button>
              <Link 
                href={`/shop/${productSlug}`}
                onClick={onClose}
                className="p-2.5 bg-white/10 border border-white/10 rounded-lg text-white"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP ONLY SIDEBAR PANEL DISPLAY */}
        <div className="hidden md:flex w-[340px] bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-r-2xl h-[85vh] flex-col justify-between p-6 shadow-2xl border-l-0">
          <div className="space-y-6 text-center">
            {/* Centered Desktop Image Target Frame Showcase */}
            <div className="relative w-32 h-32 bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-800 mx-auto mt-4">
              <Image src={productImg} alt={product.title} fill sizes="128px" className="object-cover" priority />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white tracking-tight leading-snug uppercase">{product.title}</h3>
              <div className="flex items-center justify-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                  <Star size={10} fill="currentColor" /> {product.rating || "4.8"}
                </div>
                <span className="text-slate-400">({product.reviewsCount || "0"} Reviews)</span>
              </div>
              {activeReel.caption && (
                <p className="text-xs text-slate-400 italic max-w-xs mx-auto pt-2 border-t border-slate-800/40">"{activeReel.caption}"</p>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold tracking-wider text-slate-500 uppercase">Inclusive Price</span>
              <span className="text-xl font-black text-emerald-400">₹{product.price}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={(e) => onAddToCart(e, product)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition duration-200 shadow-md active:scale-98"
            >
              <ShoppingBag size={14} strokeWidth={2.5} /> Add To Cart
            </button>
            <Link 
              href={`/shop/${productSlug}`}
              onClick={onClose}
              className="w-full bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold py-3 px-4 rounded-xl text-center text-xs uppercase tracking-wider border border-slate-800 transition flex items-center justify-center gap-1.5"
            >
              View Specifications <ExternalLink size={12} />
            </Link>
          </div>
        </div>

      </div>

      <footer className="w-full text-center py-4 bg-slate-950 text-[9px] text-slate-600 font-bold tracking-widest uppercase border-t border-slate-900/30 absolute bottom-0 left-0 hidden md:block">
        Bouncy Bucket Operations System &bull; Live Checkout Layer
      </footer>
    </div>
  );

  return createPortal(modalContent, document.body);
}