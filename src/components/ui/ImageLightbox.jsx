"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Fullscreen image viewer portaled to document.body.
 * Fixes stacking-context issues from sticky/transform parents.
 */
export default function ImageLightbox({
  isOpen,
  onClose,
  src,
  alt = "Image preview",
  showNav = false,
  onPrev,
  onNext,
  onTouchStart,
  onTouchEnd,
  counter,
}) {
  const [mounted, setMounted] = useState(false);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (showNav && e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (showNav && e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
      }
    },
    [onClose, onPrev, onNext, showNav]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!mounted || !isOpen || !src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] isolate"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Backdrop — full viewport, closes on click */}
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-zoom-out bg-black/92 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close image viewer"
      />

      {/* Close — fixed to viewport, always on top */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed right-4 top-4 z-[100002] flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 hover:scale-110 hover:border-white/40 hover:bg-black/65 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6 sm:top-6 sm:h-12 sm:w-12"
        aria-label="Close"
      >
        <X size={22} strokeWidth={2.25} aria-hidden />
      </button>

      {counter != null && (
        <p className="pointer-events-none fixed left-1/2 top-5 z-[100002] -translate-x-1/2 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-md sm:top-6">
          {counter}
        </p>
      )}

      {/* Image + nav */}
      <div className="pointer-events-none relative z-[100001] flex h-full w-full items-center justify-center px-4 pb-6 pt-16 sm:px-12 sm:pt-20">
        {showNav && onPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="pointer-events-auto absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:left-6 sm:h-14 sm:w-14"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} strokeWidth={2} aria-hidden />
          </button>
        )}

        <div
          className="pointer-events-auto relative h-[min(78vh,820px)] w-[min(92vw,1100px)]"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain select-none"
            priority
            sizes="100vw"
            draggable={false}
          />
        </div>

        {showNav && onNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="pointer-events-auto absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-6 sm:h-14 sm:w-14"
            aria-label="Next image"
          >
            <ChevronRight size={28} strokeWidth={2} aria-hidden />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
