"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";

/* ---------- HEART ICON ---------- */

const IconHeart = ({ filled, className = "h-5 w-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

/* ---------- PRODUCT CARD ---------- */

export default function ProductCard({ product }) {
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const { toggleWishlist, isItemWishlisted } = useWishlist();
  const { addToCart } = useCart();

  const active = isItemWishlisted(product._id);

  /* ---------- SAFETY ---------- */

  const variants = product.variants || [];

  const currentVariant = variants[selectedVarIdx] || variants[0];

  const displayImages =
    currentVariant?.images?.length > 0
      ? currentVariant.images
      : product.thumbnail
      ? [product.thumbnail]
      : [];

  const selectedSize = currentVariant?.sizes?.[0];

  const displayPrice =
    selectedSize?.price ??
    product.price ??
    0;

  const displayCompareAt =
    selectedSize?.compareAtPrice ??
    product.compareAtPrice ??
    null;

  const discount =
    displayCompareAt &&
    displayCompareAt > displayPrice
      ? Math.round(
          ((displayCompareAt - displayPrice) /
            displayCompareAt) *
            100
        )
      : 0;

  /* ---------- WISHLIST ---------- */

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product._id);
  };

  /* ---------- QUICK ADD ---------- */

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentVariant) {
      toast.error("This product is unavailable.");
      return;
    }

    if (!selectedSize) {
      toast.error(
        "No size available — open product to choose options."
      );
      return;
    }

    if (selectedSize.stock <= 0) {
      toast.error("Out of stock for this variant.");
      return;
    }

    const color =
      currentVariant.colorName ||
      currentVariant.baseColorName ||
      "";

    addToCart(
      {
        ...product,
        price: selectedSize.price,
        compareAtPrice:
          selectedSize.compareAtPrice ??
          product.compareAtPrice,
      },
      1,
      color,
      selectedSize.capacity
    );

    toast.success(`${product.title} added to your bag`);
  };

  /* ---------- EMPTY IMAGE FALLBACK ---------- */

  const imageSrc =
    displayImages[activeImgIdx] ||
    displayImages[0] ||
    null;

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden border-[5px] border-[#26384b] bg-[#f7f7f5]">
      
      {/* ========================================
          IMAGE AREA
      ======================================== */}

      <div className="relative aspect-[4/3.8] w-full overflow-hidden bg-[#e9e5d9]">

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-2 top-2 z-20 bg-[#26384b] px-2 py-1 text-[7px] font-bold uppercase tracking-wide text-white">
            -{discount}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={
            active
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-2 top-2 z-30 transition-colors duration-200 ${
            active
              ? "text-red-500"
              : "text-white/90 hover:text-white"
          }`}
        >
          <IconHeart
            filled={active}
            className="h-4 w-4"
          />
        </button>

        {/* Product Image */}
        <Link
          href={`/shop/${product.slug}`}
          className="absolute inset-0 block"
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.title || "Product"}
              fill
              sizes="(max-width: 640px) 180px, (max-width: 768px) 205px, (max-width: 1024px) 220px, 235px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No Image
            </div>
          )}
        </Link>

        {/* Image Indicators */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-1 sm:flex">
            {displayImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`View image ${index + 1}`}
                onMouseEnter={() =>
                  setActiveImgIdx(index)
                }
                onClick={() =>
                  setActiveImgIdx(index)
                }
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === activeImgIdx
                    ? "w-3 bg-[#26384b]"
                    : "w-1.5 bg-[#26384b]/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================================
          OVERLAPPING ADD TO CART BUTTON
      ======================================== */}

      <div className="relative z-30 h-0">
        <button
          type="button"
          onClick={handleQuickAdd}
          className="absolute left-1/2 top-[-11px] min-w-[95px] -translate-x-1/2 rounded-full bg-[#26384b] px-5 py-[7px] text-[8px] font-black uppercase tracking-[0.12em] text-white shadow-md transition-all duration-200 hover:scale-[1.04] hover:bg-[#172535]"
        >
          Add to Cart
        </button>
      </div>

      {/* ========================================
          PRODUCT INFORMATION
      ======================================== */}

      <div className="flex min-h-[125px] flex-1 flex-col bg-[#f7f7f5] px-4 pb-4 pt-8">

        {/* Category + Color Options */}
        <div className="mb-2 flex items-center justify-between gap-2">

          {/* Category */}
          <span className="max-w-[55%] truncate text-[7px] font-bold uppercase tracking-[0.14em] text-[#7c8490]">
            {product.category || "Bottles"}
          </span>

          {/* Colors */}
          {variants.length > 0 && (
            <div className="flex shrink-0 items-center gap-1.5">
              {variants.map((variant, index) => (
                <button
                  key={
                    variant._id ||
                    `${variant.colorName}-${index}`
                  }
                  type="button"
                  aria-label={
                    variant.colorName ||
                    `Color option ${index + 1}`
                  }
                  onClick={() => {
                    setSelectedVarIdx(index);
                    setActiveImgIdx(0);
                  }}
                  className={`h-3 w-3 shrink-0 rounded-full border transition-all duration-200 ${
                    index === selectedVarIdx
                      ? "border-[#26384b] ring-1 ring-[#26384b] ring-offset-1"
                      : "border-[#b6bcc4]"
                  }`}
                  style={{
                    backgroundColor:
                      variant.colorCode || "#d1d5db",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Title */}
        <Link
          href={`/shop/${product.slug}`}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-[34px] text-[11px] font-bold leading-[1.45] text-[#26384b] transition-opacity duration-200 hover:opacity-65">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-[11px] font-black text-[#26384b]">
            ₹{Number(displayPrice).toLocaleString("en-IN")}
          </span>

          {displayCompareAt &&
            displayCompareAt > displayPrice && (
              <span className="text-[8px] text-[#8a9199] line-through">
                ₹
                {Number(
                  displayCompareAt
                ).toLocaleString("en-IN")}
              </span>
            )}
        </div>
      </div>
    </div>
  );
}