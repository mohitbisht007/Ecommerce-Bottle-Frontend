"use client";

import { useEffect, useState } from "react";

import { useCart, getCartItemImage } from "@/app/context/CartContext";

import Link from "next/link";
import Image from "next/image";

import {
    X,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
    ArrowRight,
    Truck,
    ShieldCheck,
    ChevronRight,
    CheckCircle2,
    PartyPopper,
    Tag,
} from "lucide-react";

export default function CartSidebar() {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        cartTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        availableCoupons,
        loadingCoupons,
        fetchAvailableCoupons,
        couponDiscount,
        finalTotal,
        freeShippingThreshold,
    } = useCart();

    const [applyingCoupon, setApplyingCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");
    const [manualCode, setManualCode] = useState("");
    const [showCouponSuccess, setShowCouponSuccess] = useState(false);
    const [popupAnimated, setPopupAnimated] = useState(false);
    const [successCoupon, setSuccessCoupon] = useState(null);

    useEffect(() => {
        if (isCartOpen) {
            fetchAvailableCoupons();
        }
    }, [isCartOpen, fetchAvailableCoupons]);

    // Animate the success popup after it has mounted. This avoids styled-jsx
    // generated-class differences during server/client hydration.
    useEffect(() => {
        if (!showCouponSuccess) {
            setPopupAnimated(false);
            return;
        }

        const timer = setTimeout(() => setPopupAnimated(true), 20);
        return () => clearTimeout(timer);
    }, [showCouponSuccess]);

    // =========================================================
    // TOTAL QUANTITY
    // =========================================================

    const totalQuantity = cartItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    // =========================================================
    // FREE SHIPPING
    // =========================================================

    const progress = Math.min(
        (cartTotal / freeShippingThreshold) * 100,
        100
    );

    const amountToFree = Math.max(
        freeShippingThreshold - cartTotal,
        0
    );

    // =========================================================
    // CHECK COUPON ELIGIBILITY
    // =========================================================

    const getCouponEligibility = (coupon) => {
        const minimumItems = Number(coupon.minimumItems || 1);
        const minimumCartValue = Number(coupon.minimumCartValue || 0);

        const itemsMissing = Math.max(
            minimumItems - totalQuantity,
            0
        );

        const amountMissing = Math.max(
            minimumCartValue - Number(cartTotal || 0),
            0
        );

        const itemsEligible = totalQuantity >= minimumItems;
        const cartEligible = cartTotal >= minimumCartValue;

        const eligible = itemsEligible && cartEligible;

        let message = "";

        if (!itemsEligible) {
            if (itemsMissing === 1) {
                message = "Add 1 more bottle to apply";
            } else {
                message = `Add ${itemsMissing} more bottles to apply`;
            }
        } else if (!cartEligible) {
            message = `Add ₹${amountMissing} more to apply`;
        } else {
            message = "Ready to apply";
        }

        return {
            eligible,
            itemsMissing,
            amountMissing,
            message,
        };
    };

    // =========================================================
    // FORMAT DISCOUNT
    // =========================================================

    const formatMoney = (amount) => {
        return `₹${Math.round(Number(amount || 0))}`;
    };

    // =========================================================
    // VALIDATE / APPLY COUPON
    // =========================================================

    const validateAndApplyCoupon = async (couponOrCode) => {
        const code =
            typeof couponOrCode === "string"
                ? couponOrCode
                : couponOrCode?.code;

        const listed =
            typeof couponOrCode === "object" ? couponOrCode : null;

        if (listed) {
            const eligibility = getCouponEligibility(listed);
            if (!eligibility.eligible) return;
        }

        try {
            setApplyingCoupon(code);
            setCouponError("");

            const result = await applyCoupon(code);

            if (!result.success) {
                throw new Error(result.message);
            }

            setSuccessCoupon(result.coupon);
            setShowCouponSuccess(true);
            setManualCode("");

            setTimeout(() => {
                setShowCouponSuccess(false);
            }, 2800);
        } catch (error) {
            setCouponError(error.message || "Unable to apply coupon");
        } finally {
            setApplyingCoupon(null);
        }
    };

    // =========================================================
    // CLOSE SUCCESS POPUP
    // =========================================================

    const closeSuccessPopup = () => {
        setShowCouponSuccess(false);
    };

    // =========================================================
    // CALCULATE FINAL TOTAL
    // =========================================================

    return (
        <>
            {/* =====================================================
                COUPON SUCCESS POPUP
            ====================================================== */}

            {showCouponSuccess && successCoupon && (
                <div
                    className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/20 px-5 backdrop-blur-[2px]"
                    onClick={closeSuccessPopup}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-full max-w-[340px] overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-[0_25px_80px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out ${
                            popupAnimated ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-3 opacity-0"
                        }`}
                    >
                        {/* Decorative circles */}
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/60" />

                        <div className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-emerald-50" />

                        {/* Close */}
                        <button
                            type="button"
                            onClick={closeSuccessPopup}
                            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X size={14} />
                        </button>

                        {/* Icon */}
                        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
                                <CheckCircle2
                                    size={28}
                                    strokeWidth={2.5}
                                    className="text-white"
                                />
                            </div>

                            <span className="absolute -right-1 -top-1">
                                <PartyPopper
                                    size={20}
                                    className="text-amber-500"
                                />
                            </span>
                        </div>

                        {/* Content */}
                        <div className="relative mt-4">
                            <p className="text-[10px] font-bold uppercase tracking-[2px] text-emerald-500">
                                Coupon Applied
                            </p>

                            <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900">
                                Congratulations! 🎉
                            </h3>

                            <p className="mt-2 text-xs text-slate-500">
                                You saved
                            </p>

                            <p className="mt-1 text-3xl font-black tracking-tight text-emerald-600">
                                {formatMoney(
                                    successCoupon.discount
                                )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                on this order
                            </p>

                            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5">
                                <Tag
                                    size={12}
                                    className="text-slate-500"
                                />

                                <span className="text-[10px] font-extrabold tracking-wider text-slate-800">
                                    {successCoupon.code}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                OVERLAY
            ====================================================== */}

            <div
                className={`fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[2px] transition-all duration-300 ${
                    isCartOpen
                        ? "visible opacity-100"
                        : "invisible opacity-0"
                }`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* =====================================================
                CART DRAWER
            ====================================================== */}

            <aside
                className={`fixed right-0 top-0 z-[9999] flex h-dvh w-full max-w-[430px] flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.14)] transition-transform duration-300 ease-out ${
                    isCartOpen
                        ? "translate-x-0"
                        : "translate-x-full"
                }`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!isCartOpen}
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                            <ShoppingBag
                                size={19}
                                strokeWidth={1.8}
                                className="text-slate-900"
                            />
                        </div>

                        <div>
                            <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
                                Your Bag
                            </h2>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                                {totalQuantity}{" "}
                                {totalQuantity === 1
                                    ? "item"
                                    : "items"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setIsCartOpen(false)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Close cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* =================================================
                    FREE SHIPPING
                ================================================= */}

                {cartItems.length > 0 && (
                    <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                                    <Truck
                                        size={14}
                                        className="text-slate-700"
                                    />
                                </div>

                                <span className="text-[11px] font-semibold text-slate-700">
                                    {amountToFree > 0
                                        ? `₹${amountToFree} away from free shipping`
                                        : "You've unlocked free shipping"}
                                </span>
                            </div>

                            {amountToFree <= 0 && (
                                <span className="text-[10px] font-bold text-emerald-600">
                                    UNLOCKED
                                </span>
                            )}
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-slate-900 transition-all duration-500"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>

                        {amountToFree > 0 && (
                            <p className="mt-2 text-[10px] text-slate-400">
                                Add ₹{amountToFree} more to
                                unlock FREE shipping.
                            </p>
                        )}
                    </div>
                )}

                {/* =================================================
                    BODY
                ================================================= */}

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {cartItems.length === 0 ? (
                        /* =================================================
                            EMPTY CART
                        ================================================= */

                        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                                <ShoppingBag
                                    size={32}
                                    strokeWidth={1.3}
                                    className="text-slate-400"
                                />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                Your bag is empty
                            </h3>

                            <p className="mt-2 max-w-[270px] text-xs leading-5 text-slate-500">
                                Discover premium bottles
                                designed for everyday
                                hydration.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsCartOpen(false)
                                }
                                className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-6 text-xs font-bold text-white transition hover:bg-black"
                            >
                                Start Shopping
                                <ArrowRight size={15} />
                            </button>
                        </div>
                    ) : (
                        <div className="px-5 py-4">
                            {/* =================================================
                                ITEM COUNT
                            ================================================= */}

                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-400">
                                    Your items
                                </span>

                                <span className="text-[10px] text-slate-400">
                                    {cartItems.length}{" "}
                                    {cartItems.length === 1
                                        ? "product"
                                        : "products"}
                                </span>
                            </div>

                            {/* =================================================
                                PRODUCTS
                            ================================================= */}

                            <div className="space-y-3">
                                {cartItems.map(
                                    (item, index) => {
                                        const lineTotal =
                                            Number(
                                                item.price || 0
                                            ) *
                                            Number(
                                                item.quantity ||
                                                    0
                                            );

                                        return (
                                            <div
                                                key={`${item._id}-${item.color}-${item.capacity}`}
                                                className="group relative rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-slate-200 hover:shadow-sm"
                                            >
                                                <div className="flex gap-3">
                                                    {/* IMAGE */}

                                                    <div className="relative flex h-[82px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                                                        <Image
                                                            src={getCartItemImage(
                                                                item
                                                            )}
                                                            alt={
                                                                item.title
                                                            }
                                                            width={
                                                                82
                                                            }
                                                            height={
                                                                82
                                                            }
                                                            className="h-full w-full object-contain"
                                                        />

                                                        <span className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[9px] font-bold text-white">
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* DETAILS */}

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h3 className="line-clamp-2 pr-1 text-[12px] font-bold leading-[1.35] text-slate-900">
                                                                {
                                                                    item.title
                                                                }
                                                            </h3>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeFromCart(
                                                                        index
                                                                    )
                                                                }
                                                                className="shrink-0 rounded-md p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                                                                aria-label={`Remove ${item.title}`}
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>
                                                        </div>

                                                        {/* VARIANT */}

                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                            {
                                                                item.color
                                                            }

                                                            {item.capacity
                                                                ? ` • ${item.capacity}`
                                                                : ""}
                                                            {item.customization?.text
                                                                ? ` • ${item.customization.text}`
                                                                : ""}
                                                        </p>

                                                        {/* PRICE + QTY */}

                                                        <div className="mt-3 flex items-center justify-between">
                                                            <div className="flex h-7 items-center overflow-hidden rounded-lg border border-slate-200">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            index,
                                                                            -1
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item.quantity <=
                                                                        1
                                                                    }
                                                                    className="flex h-full w-7 items-center justify-center text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                                >
                                                                    <Minus
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                </button>

                                                                <span className="flex h-full min-w-7 items-center justify-center border-x border-slate-200 text-[10px] font-bold text-slate-800">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateQuantity(
                                                                            index,
                                                                            1
                                                                        )
                                                                    }
                                                                    className="flex h-full w-7 items-center justify-center text-slate-500 transition hover:bg-slate-50"
                                                                >
                                                                    <Plus
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>

                                                            <span className="text-[13px] font-bold text-slate-900">
                                                                ₹
                                                                {
                                                                    lineTotal
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            {/* =================================================
                                SAVINGS BAR
                            ================================================= */}

                            {appliedCoupon &&
                                couponDiscount > 0 && (
                                    <div className="mt-5 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50">
                                        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                                                <CheckCircle2
                                                    size={15}
                                                    strokeWidth={
                                                        2.5
                                                    }
                                                    className="text-white"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-bold text-emerald-800">
                                                    You saved{" "}
                                                    {formatMoney(
                                                        couponDiscount
                                                    )}{" "}
                                                    on this order
                                                </p>

                                                <p className="mt-0.5 truncate text-[9px] text-emerald-600">
                                                    Coupon{" "}
                                                    {
                                                        appliedCoupon.code
                                                    }{" "}
                                                    applied
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    removeCoupon();
                                                    setCouponError("");
                                                }}
                                                className="shrink-0 text-[9px] font-bold text-emerald-700 underline underline-offset-2 transition hover:text-emerald-900"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}

                            {/* =================================================
                                AVAILABLE COUPONS
                            ================================================= */}

                            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                    {/* HEADER */}

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[12px] font-bold text-slate-900">
                                                Available
                                                offers
                                            </p>

                                            <p className="mt-0.5 text-[9px] text-slate-400">
                                                Save more on
                                                your order
                                            </p>
                                        </div>

                                        {!loadingCoupons &&
                                            availableCoupons.length >
                                                0 && (
                                                <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-slate-500 shadow-sm">
                                                    {
                                                        availableCoupons.length
                                                    }
                                                </span>
                                            )}
                                    </div>

                                    {/* ERROR */}

                                    <form
                                        className="mt-3 flex gap-2"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            validateAndApplyCoupon(
                                                manualCode
                                            );
                                        }}
                                    >
                                        <input
                                            type="text"
                                            value={manualCode}
                                            onChange={(e) => {
                                                setManualCode(
                                                    e.target.value.toUpperCase()
                                                );
                                                setCouponError("");
                                            }}
                                            placeholder="Enter coupon code"
                                            maxLength={30}
                                            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold tracking-wide text-slate-800 outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400"
                                        />
                                        <button
                                            type="submit"
                                            disabled={
                                                !manualCode.trim() ||
                                                applyingCoupon ===
                                                    manualCode.trim().toUpperCase()
                                            }
                                            className="h-9 shrink-0 rounded-lg bg-slate-900 px-3 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Apply
                                        </button>
                                    </form>

                                    {couponError && (
                                        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                                            <p className="text-[9px] font-medium text-red-600">
                                                {
                                                    couponError
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {/* LOADING */}

                                    {loadingCoupons ? (
                                        <div className="mt-3 space-y-2">
                                            <div className="h-14 animate-pulse rounded-xl bg-slate-200/70" />
                                            <div className="h-14 animate-pulse rounded-xl bg-slate-200/70" />
                                        </div>
                                    ) : (
                                        <div className="mt-3 space-y-2">
                                            {availableCoupons.map(
                                                (
                                                    coupon
                                                ) => {
                                                    const eligibility =
                                                        getCouponEligibility(
                                                            coupon
                                                        );

                                                    const isApplied =
                                                        appliedCoupon?.code ===
                                                        coupon.code;

                                                    const isApplying =
                                                        applyingCoupon ===
                                                        coupon.code;

                                                    return (
                                                        <div
                                                            key={
                                                                coupon.code
                                                            }
                                                            className="rounded-xl border border-slate-200 bg-white p-3"
                                                        >
                                                            <div className="flex items-center justify-between gap-3">
                                                                {/* DETAILS */}

                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-1 text-[10px] font-extrabold tracking-wide text-slate-800">
                                                                            {
                                                                                coupon.code
                                                                            }
                                                                        </span>

                                                                        {coupon.discountType ===
                                                                        "percentage" ? (
                                                                            <span className="text-[10px] font-bold text-emerald-600">
                                                                                {
                                                                                    coupon.discountValue
                                                                                }
                                                                                %
                                                                                OFF
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-bold text-emerald-600">
                                                                                ₹
                                                                                {
                                                                                    coupon.discountValue
                                                                                }{" "}
                                                                                OFF
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {coupon.description && (
                                                                        <p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-slate-500">
                                                                            {
                                                                                coupon.description
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    {/* TERMS */}

                                                                    {(Number(
                                                                        coupon.minimumCartValue ||
                                                                            0
                                                                    ) >
                                                                        0 ||
                                                                        Number(
                                                                            coupon.minimumItems ||
                                                                                1
                                                                        ) >
                                                                            1) && (
                                                                        <p className="mt-1 text-[8px] text-slate-400">
                                                                            {Number(
                                                                                coupon.minimumCartValue ||
                                                                                    0
                                                                            ) >
                                                                                0 &&
                                                                                `Min. order ₹${coupon.minimumCartValue}`}

                                                                            {Number(
                                                                                coupon.minimumCartValue ||
                                                                                    0
                                                                            ) >
                                                                                0 &&
                                                                                Number(
                                                                                    coupon.minimumItems ||
                                                                                        1
                                                                                ) >
                                                                                    1 &&
                                                                                " • "}

                                                                            {Number(
                                                                                coupon.minimumItems ||
                                                                                    1
                                                                            ) >
                                                                                1 &&
                                                                                `Min. ${coupon.minimumItems} items`}
                                                                        </p>
                                                                    )}

                                                                    {/* ELIGIBILITY MESSAGE */}

                                                                    {!isApplied &&
                                                                        !eligibility.eligible && (
                                                                            <p className="mt-1.5 text-[9px] font-medium text-amber-600">
                                                                                {
                                                                                    eligibility.message
                                                                                }
                                                                            </p>
                                                                        )}

                                                                    {isApplied && (
                                                                        <p className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                                                                            <CheckCircle2
                                                                                size={
                                                                                    11
                                                                                }
                                                                            />
                                                                            Coupon
                                                                            applied
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* APPLY BUTTON */}

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        !eligibility.eligible ||
                                                                        isApplied ||
                                                                        isApplying
                                                                    }
                                                                    onClick={() =>
                                                                        validateAndApplyCoupon(
                                                                            coupon
                                                                        )
                                                                    }
                                                                    className={`shrink-0 rounded-lg px-3 py-2 text-[9px] font-bold transition-all ${
                                                                        isApplied
                                                                            ? "cursor-default bg-emerald-100 text-emerald-700"
                                                                            : !eligibility.eligible
                                                                              ? "cursor-not-allowed bg-slate-200 text-slate-400"
                                                                              : "bg-slate-900 text-white hover:bg-black active:scale-95"
                                                                    }`}
                                                                >
                                                                    {isApplying
                                                                        ? "Applying..."
                                                                        : isApplied
                                                                          ? "Applied"
                                                                          : "Apply"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}

                                    {!loadingCoupons &&
                                        availableCoupons.length ===
                                            0 && (
                                            <p className="mt-3 text-[10px] text-slate-400">
                                                No listed offers right now. You can still apply a private code above.
                                            </p>
                                        )}
                                </div>

                            {/* =================================================
                                CONTINUE SHOPPING
                            ================================================= */}

                            <button
                                type="button"
                                onClick={() =>
                                    setIsCartOpen(false)
                                }
                                className="mt-5 flex items-center gap-1 text-[11px] font-semibold text-slate-500 transition hover:text-slate-900"
                            >
                                Continue shopping
                                <ChevronRight size={13} />
                            </button>
                        </div>
                    )}
                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                {cartItems.length > 0 && (
                    <div className="shrink-0 border-t border-slate-100 bg-white px-5 pb-5 pt-4">
                        {/* SUBTOTAL */}

                        <div className="flex items-center justify-between">
                            <span className="text-[12px] text-slate-500">
                                Subtotal
                            </span>

                            <span className="text-[18px] font-extrabold tracking-tight text-slate-900">
                                ₹{cartTotal}
                            </span>
                        </div>

                        {/* COUPON DISCOUNT */}

                        {couponDiscount > 0 && (
                            <div className="mt-2 flex items-center justify-between">
                                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                    <Tag size={11} />
                                    Coupon discount
                                </span>

                                <span className="text-[12px] font-bold text-emerald-600">
                                    -₹{couponDiscount}
                                </span>
                            </div>
                        )}

                        {/* FINAL TOTAL */}

                        {couponDiscount > 0 && (
                            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                                <span className="text-[12px] font-semibold text-slate-700">
                                    Total
                                </span>

                                <span className="text-[18px] font-extrabold tracking-tight text-slate-900">
                                    ₹{finalTotal}
                                </span>
                            </div>
                        )}

                        <p className="mt-1 text-[9px] text-slate-400">
                            Taxes and final shipping
                            calculated at checkout.
                        </p>

                        {/* CHECKOUT */}

                        <Link
                            href="/checkout"
                            onClick={() =>
                                setIsCartOpen(false)
                            }
                            className="mt-4 flex h-12 w-full items-center justify-between rounded-xl bg-slate-900 pl-5 pr-1.5 text-[12px] font-bold text-white transition hover:bg-black"
                        >
                            <span className="flex-1 text-center">
                                Proceed to Checkout
                            </span>

                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-900">
                                <ArrowRight size={16} />
                            </span>
                        </Link>

                        {/* TRUST */}

                        <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-slate-400">
                            <ShieldCheck size={12} />
                            Secure checkout • Easy
                            payments
                        </div>
                    </div>
                )}
            </aside>

        </>
    );
}