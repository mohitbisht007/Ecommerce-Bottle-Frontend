"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Star, ExternalLink, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export default function FullScreenReelModal({ reels, initialIdx, onClose, convertToSlug }) {
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const videoRefs = useRef([]);
  
  const scrollTimeout = useRef(null);
  const touchStartY = useRef(0);
  const isTransitioning = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  // Manage playback streams based on current indexing parameters
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

  const changeReelSmoothly = (newIdx) => {
    if (newIdx < 0 || newIdx >= reels.length || isTransitioning.current) return;
    isTransitioning.current = true;
    setCurrentIdx(newIdx);
    
    setTimeout(() => {
      isTransitioning.current = false;
    }, 500); // Matches smooth slide css transition delay timing
  };

  const handleNext = () => changeReelSmoothly(currentIdx + 1);
  const handlePrev = () => changeReelSmoothly(currentIdx - 1);

  // Smooth Mouse Wheel Trackpad Interceptor
  const handleWheel = (e) => {
    e.preventDefault();
    if (scrollTimeout.current || isTransitioning.current) return;

    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
    }, 600);

    if (e.deltaY > 40) {
      handleNext();
    } else if (e.deltaY < -40) {
      handlePrev();
    }
  };

  // Mobile Touch Swipe Trackers
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isTransitioning.current) return;
    const touchEndY = e.changedTouches[0].clientY;
    const distance = touchStartY.current - touchEndY;

    if (distance > 70) {
      handleNext(); 
    } else if (distance < -70) {
      handlePrev(); 
    }
  };

  const activeReel = reels[currentIdx];
  const product = activeReel.linkedProduct || {};
  const productImg = product.thumbnail || product.image || "/placeholder.jpg";
  const productSlug = convertToSlug(product.title);

  const cartIndex = cartItems.findIndex(item => item._id === product._id);
  const existingItem = cartIndex !== -1 ? cartItems[cartIndex] : null;

  const executeAdd = (e) => {
    e.preventDefault();
    const color = product.variants?.[0]?.colorName || "Default";
    const capacity = product.variants?.[0]?.capacities?.[0]?.capacity || "Standard";
    addToCart(product, 1, color, capacity);
  };

  const modalContent = (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 w-screen h-screen z-[99999] bg-slate-950 flex flex-col justify-between text-white overflow-hidden font-sans touch-none"
    >
      {/* Immersive Controls Top Bar */}
      <header className="w-full px-6 py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between z-50 absolute top-0 left-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-900/30 px-2.5 py-1 rounded-md">
            Bouncy Bucket TV
          </span>
          <span className="text-xs font-mono text-slate-300 font-medium hidden sm:inline">
            Reel {currentIdx + 1} of {reels.length} &bull; Swipe / Scroll View
          </span>
        </div>

        <button 
          onClick={onClose} 
          className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow-xl active:scale-95"
        >
          Exit View <X size={14} strokeWidth={2.5} />
        </button>
      </header>

      {/* Main Structural Layout Core */}
      <div className="w-full h-full flex flex-col md:flex-row items-center justify-center max-w-6xl mx-auto overflow-hidden relative">
        
        {/* Left Side Viewport Container Window */}
        <div className="relative w-full h-full md:h-[85vh] md:max-w-[400px] bg-black md:rounded-2xl border border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
          
          {/* VERTICAL SLIDING TRACK CAROUSEL CORE RUNNER */}
          <div 
            className="w-full h-full flex flex-col transition-transform duration-500 ease-out"
            style={{ transform: `translateY(-${currentIdx * 100}%)` }}
          >
            {reels.map((reel, rIdx) => (
              <div key={reel._id} className="w-full h-full flex-shrink-0 relative flex items-center justify-center">
                <video
                  ref={el => videoRefs.current[rIdx] = el}
                  src={reel.videoUrl}
                  loop
                  playsInline
                  controls={rIdx === currentIdx}
                  controlsList="nodownload nofullscreen noremoteplayback"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* MOBILE ONLY FLOATING DETAILS DECK SHEET LAYER */}
          <div className="absolute bottom-6 inset-x-4 bg-slate-950/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col items-center text-center md:hidden z-30 space-y-3">
            <div className="flex items-center gap-3 w-full border-b border-white/5 pb-2">
              <div className="relative w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                <Image src={productImg} alt="" fill sizes="40px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-xs font-black text-white truncate uppercase tracking-wide">{product.title}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-bold">
                  <span className="text-amber-400 flex"><Star size={10} fill="currentColor" /></span>
                  <span>{product.rating || "4.8"}</span>
                </div>
              </div>
              <div className="text-sm font-black text-emerald-400">₹{product.price}</div>
            </div>

            <div className="w-full grid grid-cols-5 gap-2">
              <div className="col-span-3 w-full">
                {existingItem ? (
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between p-1">
                    <button onClick={() => updateQuantity(cartIndex, -1)} className="p-1.5 text-slate-400 hover:text-white transition"><Minus size={12} /></button>
                    <span className="text-xs font-black text-white">{existingItem.quantity} Pcs</span>
                    <button onClick={() => updateQuantity(cartIndex, 1)} className="p-1.5 text-slate-400 hover:text-white transition"><Plus size={12} /></button>
                  </div>
                ) : (
                  <button 
                    onClick={executeAdd}
                    className="w-full bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-1"
                  >
                    <ShoppingBag size={12} strokeWidth={2.5} /> Add to Bag
                  </button>
                )}
              </div>
              <Link 
                href={`/shop/${productSlug}`}
                onClick={onClose}
                className="col-span-2 bg-white/10 border border-white/15 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1"
              >
                Specs <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP SIDEBAR PANEL DISPLAY */}
        <div className="hidden md:flex w-[340px] bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-r-2xl h-[85vh] flex flex-col justify-between p-6 shadow-2xl border-l-0">
          <div className="space-y-6 text-center">
            <div className="relative w-32 h-32 bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-800 mx-auto mt-4">
              <Image src={productImg} alt="" fill sizes="128px" className="object-cover" priority />
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
              <span className="font-bold tracking-wider text-slate-500 uppercase">Price:</span>
              <span className="text-xl font-black text-emerald-400">₹{product.price}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {existingItem ? (
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="block text-[10px] text-center uppercase tracking-widest text-slate-500 font-bold">Modify Quantity</span>
                <div className="flex items-center justify-between">
                  <button onClick={() => updateQuantity(cartIndex, -1)} className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition"><Minus size={14} /></button>
                  <span className="text-sm font-black text-white px-4">{existingItem.quantity} Selected</span>
                  <button onClick={() => updateQuantity(cartIndex, 1)} className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition"><Plus size={14} /></button>
                  <button onClick={() => removeFromCart(cartIndex)} className="p-2 bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:bg-rose-900 hover:text-white rounded-lg transition"><Trash2 size={14} /></button>
                </div>
              </div>
            ) : (
              <button 
                onClick={executeAdd}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition duration-200 shadow-md"
              >
                <ShoppingBag size={14} strokeWidth={2.5} /> Add To Cart
              </button>
            )}
            
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
    </div>
  );

  return createPortal(modalContent, document.body);
}