"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import Link from "next/link";
import ProductCard from "@/components/shop/catalog/ProductCard";

import "swiper/css";
import "swiper/css/free-mode";

export default function CategoryBar({ title, products, query }) {
  const swiperRef = useRef(null);

  if (!products || products.length === 0) return null;

  const headingId = `header-${title
    .replace(/\s+/g, "-")
    .toLowerCase()}`;

  return (
    <section
      aria-labelledby={headingId}
      className="w-full overflow-hidden bg-[#b9c9dc] py-10 sm:py-12 md:py-14"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-10">
        {/* ---------- HEADER ---------- */}
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div className="flex items-center gap-5">
            <h2
              id={headingId}
              className="font-sans text-[22px] font-black italic uppercase tracking-[0.18em] text-[#26384b] sm:text-[26px] md:text-[30px]"
            >
              {title}
            </h2>

            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label={`Next ${title} products`}
              className="mb-1 hidden shrink-0 items-center justify-center text-[#26384b] transition-transform duration-200 hover:translate-x-2 sm:flex"
            >
              <svg
                className="h-5 w-12"
                viewBox="0 0 48 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="0" y1="10" x2="42" y2="10" />
                <polyline points="34 3 42 10 34 17" />
              </svg>
            </button>
          </div>

          <Link
            href={`/shop?${query || ""}`}
            aria-label={`View all products in ${title}`}
            className="shrink-0 border-b border-[#26384b] pb-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#26384b] transition-opacity duration-200 hover:opacity-60 sm:text-[10px]"
          >
            View All
          </Link>
        </div>

        {/* ---------- PRODUCT SLIDER ---------- */}
        <Swiper
          modules={[FreeMode]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          slidesPerView="auto"
          spaceBetween={14}
          freeMode={{
            enabled: true,
            sticky: true,
            momentumBounce: false,
          }}
          grabCursor
          watchSlidesProgress
          className="!overflow-visible !py-2"
        >
          {products.map((product) => (
            <SwiperSlide
              key={product._id}
              className="!w-[180px] sm:!w-[205px] md:!w-[220px] lg:!w-[235px]"
            >
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}