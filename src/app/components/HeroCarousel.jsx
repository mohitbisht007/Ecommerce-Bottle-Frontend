"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

export default function HeroCarousel({ banners }) {
  // Safety check for SSR and empty data
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
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="mySwiper"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner._id || index}>
            <div className="hero-slide-wrapper">
              {/* NEXT.JS OPTIMIZED IMAGE - Replaces CSS Background */}
              <Image
                src={banner.imageUrl}
                alt={banner.title || "Premium Water Bottles"}
                fill
                priority={index === 0} // Highest priority for the first slide (LCP Fix)
                className="hero-img"
                sizes="100vw"
                quality={90}
              />
              
              {/* Gradient Overlay maintained from your previous style */}
              <div className="hero-overlay-gradient"></div>

              <div className="container hero-content-container">
                <div className="hero-text-box">
                  <span className="hero-subtitle">{banner.subtitle}</span>
                  {/* SEO: Only the first slide gets an H1 */}
                  {index === 0 ? (
                    <h1 className="hero-title">{banner.title}</h1>
                  ) : (
                    <h2 className="hero-title">{banner.title}</h2>
                  )}
                  <Link href={banner.link || "/shop"} className="hero-cta-btn">
                    Shop Collection
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}