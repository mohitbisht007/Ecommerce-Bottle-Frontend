"use client";
import React from "react";

export default function AnnouncementBar() {
  const messages = [
    "Free shipping on orders above Rs 999",
    "7 Day easy return",
    "10% Off On Orders Above Rs 1999",
  ];

  const MessageGroup = () => (
    <div className="flex shrink-0 items-center">
      {messages.map((msg, index) => (
        <div key={index} className="flex shrink-0 items-center">
          <span className="mx-6 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-white sm:text-xs">
            {msg}
          </span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-white/40" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden bg-slate-900">
      <div className="flex w-max animate-marquee py-2.5">
        <MessageGroup />
        <MessageGroup />
        <MessageGroup />
        <MessageGroup />
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}