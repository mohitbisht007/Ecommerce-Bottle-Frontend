"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

export default function HeroCarousel({ banners }) {
  if (!banners || banners.length === 0) {
    return <div className="hero-section hero-skeleton"></div>;
  }

  return (
    <section className="hero-section">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        loop={banners.length > 1}
        speed={1000}
        autoplay={{ delay: 2000, disableOnInteraction: true }}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        className="mySwiper"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner._id || index}>
            <Link href={banner.link || "/shop"}>
              <div className="hero-slide-wrapper">
                {/* We use a standard <picture> tag wrapper to handle 
                  switching the source without adding extra styled divs.
                */}
                <picture style={{ width: '100%', height: '100%' }}>
                  {/* If screen is mobile, use mobileImageUrl */}
                  <source 
                    media="(max-width: 768px)" 
                    srcSet={banner.mobileImageUrl || banner.imageUrl} 
                  />
                  {/* Default (PC) uses imageUrl */}
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    fill
                    priority={index === 0}
                    className="hero-img"
                    sizes="100vw"
                    quality={90}
                  />
                </picture>
              </div>
            </Link>
          </SwiperSlide>
        ))}

        {/* CUSTOM MODERN ARROWS */}
        <div className="swiper-button-prev custom-prev">
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </div>
        <div className="swiper-button-next custom-next">
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </Swiper>
    </section>
  );
}