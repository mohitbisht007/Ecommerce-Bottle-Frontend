"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function HeroCarousel({ banners }) {
  if (!banners || banners.length === 0) {
    return (
      <section className="h-[420px] w-full animate-pulse bg-slate-200 sm:h-[480px] md:h-[560px] lg:h-[640px]" />
    );
  }

  return (
    <section className="relative w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        loop={banners.length > 1}
        speed={1000}
        autoplay={{ delay: 4000, disableOnInteraction: true }}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        className="hero-swiper"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner._id || index}>
            <div className="relative h-[420px] w-full overflow-hidden sm:h-[480px] md:h-[560px] lg:h-[640px]">
              {/* Background image */}
              <picture className="absolute inset-0 block h-full w-full">
                <source
                  media="(max-width: 768px)"
                  srcSet={banner.mobileImageUrl || banner.imageUrl}
                />
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || "Banner"}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                />
              </picture>

              {/* Readability gradient */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/30" />

              {/* Text content */}
              <div className="relative z-10 flex h-full flex-col items-center justify-start px-4 pt-10 text-center sm:pt-14 md:pt-16">
                {banner.eyebrow && (
                  <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/90 sm:text-sm">
                    {banner.eyebrow}
                  </p>
                )}

                {banner.title && (
                  <h2 className="mt-2 font-serif text-4xl uppercase tracking-wide text-white sm:text-6xl md:text-7xl">
                    {banner.title}
                  </h2>
                )}

                {banner.subtitle && (
                  <p className="mt-2 max-w-md text-sm text-white/90 sm:mt-3 sm:text-lg">
                    {banner.subtitle}
                  </p>
                )}
              </div>

              {/* Full-slide click target (behind the button, above the image) */}
              <Link
                href={banner.link || "/shop"}
                aria-label={banner.title || "View banner"}
                className="absolute inset-0 z-0"
              />
            </div>
          </SwiperSlide>
        ))}

        {/* CUSTOM ARROWS */}
        <div className="custom-prev absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:left-6 sm:h-12 sm:w-12">
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </div>
        <div className="custom-next absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-6 sm:h-12 sm:w-12">
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </Swiper>

      {/* Swiper-generated nodes can only be styled globally */}
      <style jsx global>{`
        .hero-swiper .swiper-pagination {
          bottom: 14px !important;
          right: 16px !important;
          left: auto !important;
          width: auto !important;
        }
        .hero-swiper .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          margin: 0 4px !important;
          transition: all 0.2s ease;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          width: 18px;
          border-radius: 9999px;
          background: #ffffff;
        }
        .hero-swiper .swiper-button-prev,
        .hero-swiper .swiper-button-next {
          display: none;
        }
        @media (min-width: 640px) {
          .hero-swiper .swiper-pagination {
            bottom: 22px !important;
            right: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}