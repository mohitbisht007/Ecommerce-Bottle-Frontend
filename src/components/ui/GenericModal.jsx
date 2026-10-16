"use client";

import React, { useState } from "react";
import {
  X,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

export default function GenericModal({
  isOpen,
  onClose,
  title,
  message,
  couponCode,
  primaryBtnText,
  onPrimaryClick,
  secondaryBtnText,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!couponCode) return;

    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">

      {/* MODAL */}
      <div className="relative w-full max-w-[365px] overflow-hidden rounded-[20px] bg-white shadow-[0_25px_70px_rgba(0,0,0,0.25)]">

        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20"
        >
          <X size={17} />
        </button>

        {/* =================================================
            OFFER HEADER
        ================================================= */}
        <div className="relative flex h-[155px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0c0c0c] via-[#171717] to-[#242424] text-white">

          {/* Decorative circles */}
          <div className="absolute -left-16 -top-24 h-48 w-48 rounded-full border border-white/[0.06]" />

          <div className="absolute -bottom-32 -right-28 h-56 w-56 rounded-full border border-white/[0.05]" />

          {/* Glow */}
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

          {/* Sparkles */}
          <Sparkles
            size={13}
            className="absolute left-10 top-10 rotate-[-12deg] text-yellow-300/80"
          />

          <Sparkles
            size={10}
            className="absolute bottom-8 right-12 rotate-[12deg] text-yellow-300/80"
          />

          {/* Eyebrow */}
          <span className="relative z-10 mb-1 text-[9px] font-bold tracking-[2px] text-white/55">
            SPECIAL DROP
          </span>

          {/* Discount */}
          <div className="relative z-10 flex h-[64px] items-start leading-none">
            <span className="bg-gradient-to-b from-white to-[#f5d56b] bg-clip-text text-[64px] font-black tracking-[-5px] text-transparent">
              10
            </span>

            <span className="mt-2 text-[24px] font-extrabold text-[#f5d56b]">
              %
            </span>
          </div>

          {/* OFF */}
          <span className="relative z-10 mt-0 text-[10px] font-extrabold tracking-[3px] text-[#f5d56b]">
            OFF
          </span>

          {/* Rule */}
          <div className="relative z-10 mt-2 flex w-[76%] items-center gap-2">
            <span className="h-px flex-1 bg-white/15" />

            <span className="whitespace-nowrap text-[8px] font-bold tracking-[1.3px] text-white/60">
              BUY ANY 2 BOTTLES
            </span>

            <span className="h-px flex-1 bg-white/15" />
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}
        <div className="px-5 pb-4 pt-5 text-center">

          {/* Heading */}
          <h2 className="text-[21px] font-extrabold leading-tight tracking-[-0.5px] text-[#151515]">
            {title || "Two bottles. One better deal."}
          </h2>

          {/* Description */}
          <p className="mt-2 text-[12.5px] leading-[1.55] text-[#777]">
            {message || (
              <>
                Pick any <strong className="font-bold text-[#171717]">2 bottles</strong>{" "}
                and unlock
                <br />
                <strong className="font-bold text-[#171717]">
                  10% OFF
                </strong>{" "}
                instantly.
              </>
            )}
          </p>

          {/* =================================================
              COUPON
          ================================================= */}
          {couponCode && (
            <div className="mt-4">

              <div className="relative flex min-h-[57px] w-full items-center overflow-hidden rounded-[10px] border border-dashed border-[#cfcfcf] bg-[#fafafa]">

                {/* Coupon left */}
                <div className="flex flex-1 flex-col items-start px-3.5 py-2.5">
                  <span className="text-[8px] font-bold tracking-[1.2px] text-[#999]">
                    USE CODE
                  </span>

                  <span className="mt-0.5 text-[17px] font-extrabold tracking-[1.2px] text-[#111]">
                    {couponCode}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-9 border-l border-dashed border-[#d1d1d1]" />

                {/* Copy */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-full w-[65px] flex-col items-center justify-center gap-0.5 bg-transparent text-[9px] font-bold text-[#333] transition hover:bg-[#f0f0f0]"
                >
                  {copied ? (
                    <>
                      <Check size={15} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-1.5 text-[9px] text-[#a0a0a0]">
                Valid on any 2 bottles • Limited time
              </p>
            </div>
          )}

          {/* =================================================
              CTA
          ================================================= */}
          <button
            type="button"
            onClick={onPrimaryClick}
            className="mt-4 flex h-[48px] w-full items-center justify-between rounded-[11px] bg-[#111] pl-5 pr-1.5 text-[13px] font-bold text-white transition hover:-translate-y-[1px] hover:bg-[#202020] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:translate-y-0"
          >
            <span className="flex-1">
              {primaryBtnText || "Shop & Save 10%"}
            </span>

            <span className="flex h-[35px] w-[35px] items-center justify-center rounded-[8px] bg-white text-[#111]">
              <ArrowRight size={17} />
            </span>
          </button>

          {/* Maybe later */}
          {secondaryBtnText && (
            <button
              type="button"
              onClick={onClose}
              className="mt-2.5 text-[10px] font-semibold text-[#999] transition hover:text-[#333]"
            >
              {secondaryBtnText}
            </button>
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}
        <div className="flex items-center justify-center gap-2 border-t border-[#f1f1f1] px-5 py-2.5 text-[8px] font-bold tracking-[1.2px] text-[#b0b0b0]">
          <span className="h-px w-6 bg-[#e7e7e7]" />
          BOUNCYBUCKET
          <span className="h-px w-6 bg-[#e7e7e7]" />
        </div>
      </div>
    </div>
  );
}