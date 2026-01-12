"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

export default function HeroCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/banners`);
        const data = await res.json();
        // Only show active banners
        setBanners(data.filter((b) => b.active !== false));
      } catch (err) {
        console.error("Hero fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading || banners.length === 0) {
    return <div className="hero-skeleton"></div>; // Simple gray box while loading
  }

  return (
    <section className="hero-section">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        loop={true}
        speed={1000}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="mySwiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <div 
              className="hero-slide-content"
              style={{ 
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2)), url(${banner.imageUrl})` 
              }}
            >
              <div className="container">
                <div className="hero-text-box">
                  <span className="hero-subtitle">{banner.subtitle}</span>
                  <h1 className="hero-title">{banner.title}</h1>
                  <Link href={banner.link} className="hero-cta-btn">
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