"use client";

import { useEffect, useState } from "react";

export default function WhatsAppButton({ product, currentVariant }) {
  const phoneNumber = "917303189499";

  const [showButton, setShowButton] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const productUrl =
    typeof window !== "undefined" ? window.location.href : "";

  /* =========================
     INITIAL POPUP
  ========================= */

  useEffect(() => {
    // Button + tooltip appear after 3 seconds
    const showTimer = setTimeout(() => {
      setShowButton(true);
      setShowTooltip(true);
    }, 3000);

    // Tooltip disappears after 6 seconds
    // 3 sec delay + 6 sec visible = 9 sec
    const hideTooltipTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 9000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTooltipTimer);
    };
  }, []);

  /* =========================
     PRODUCT MESSAGE
  ========================= */

  const isProductPage = product && currentVariant;

  const message = isProductPage
    ? `Hi Bouncy Bucket! 👋%0A%0AI am interested in this bottle:%0A*Product:* ${product.title}%0A*Color:* ${currentVariant.colorName}%0A*Capacity:* ${currentVariant.capacity}%0A*Price:* ₹${currentVariant.price}%0A%0ACheck it out here: ${productUrl}`
    : `Hi Bouncy Bucket! 👋%0A%0AI have a general query about your products and services. Could you please assist me?`;

  const tooltipText = isProductPage
    ? "Need Help?"
    : "Have a question? Chat with us!";

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;

  /*
   * Tooltip should be visible when:
   * 1. Automatic popup is active
   * OR
   * 2. User is hovering
   */
  const tooltipVisible = showTooltip || isHovered;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        whatsapp-float
        relative
        flex
        items-center
        justify-center

        transition-all
        duration-700
        ease-out

        ${
          showButton
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-24 opacity-0 scale-90"
        }
      `}
    >
      {/* ================= TOOLTIP ================= */}

      <span
        className={`
          absolute
          right-full
          mr-3
          top-1/2
          -translate-y-1/2

          whitespace-nowrap

          bg-slate-900
          text-white

          text-xs
          font-semibold
          tracking-wide

          px-4
          py-2.5

          rounded-xl

          border
          border-slate-700

          shadow-[0_10px_30px_rgba(15,23,42,0.25)]

          pointer-events-none

          transition-all
          duration-300
          ease-out

          ${
            tooltipVisible
              ? "opacity-100 visible translate-x-0 scale-100"
              : "opacity-0 invisible translate-x-2 scale-95"
          }

          after:content-['']
          after:absolute
          after:top-1/2
          after:-right-2
          after:-translate-y-1/2

          after:border-y-[6px]
          after:border-y-transparent
          after:border-l-[8px]
          after:border-l-slate-900
        `}
      >
        {tooltipText}
      </span>

      {/* ================= WHATSAPP BUTTON ================= */}

      <span
        className="
          flex
          items-center
          justify-center

          w-[58px]
          h-[58px]

          rounded-full

          bg-[#25D366]
          text-white

          shadow-[0_8px_25px_rgba(37,211,102,0.35)]

          transition-all
          duration-300

          hover:scale-110
          hover:shadow-[0_10px_35px_rgba(37,211,102,0.5)]
        "
      >
        <svg
          viewBox="0 0 448 512"
          width="30"
          height="30"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.1 0-65.6-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.4 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.4-29.8-17-40.7-4.5-10.7-9-9.2-12.4-9.4-3.2-.1-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 34.9 2.1 10.6-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </span>
    </a>
  );
}