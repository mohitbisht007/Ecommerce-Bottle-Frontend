"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const CART_KEY = "cart";
const LEGACY_CART_KEY = "bottle_cart";
const COUPON_KEY = "bottle_applied_coupon";
const FREE_SHIPPING_THRESHOLD = 500;

export function getCartItemImage(item) {
  if (!item) return "/placeholder.png";

  const color = String(item.color || "").toLowerCase().trim();
  const variants = item.variants || [];
  const matched = color
    ? variants.find((v) => {
        const names = [v.colorName, v.baseColorName]
          .filter(Boolean)
          .map((n) => String(n).toLowerCase().trim());
        return names.includes(color);
      })
    : null;

  return (
    matched?.images?.[0] ||
    matched?.image ||
    item.image ||
    item.thumbnail ||
    variants[0]?.images?.[0] ||
    "/placeholder.png"
  );
}

function sameCartLine(a, b) {
  const customA = a?.customization?.text || "";
  const customB = b?.customization?.text || "";
  return (
    String(a._id) === String(b._id) &&
    String(a.color || "") === String(b.color || "") &&
    String(a.capacity || "") === String(b.capacity || "") &&
    customA === customB
  );
}

function resolveLine(product, quantity, color, capacity, customization) {
  const variants = product.variants || [];
  const colorKey = String(color || "").toLowerCase().trim();
  const variant =
    variants.find((v) => {
      const names = [v.colorName, v.baseColorName]
        .filter(Boolean)
        .map((n) => String(n).toLowerCase().trim());
      return names.includes(colorKey);
    }) || variants[0];

  const size =
    variant?.sizes?.find((s) => s.capacity === capacity) ||
    variant?.sizes?.[0];

  const customText = customization?.text?.trim();
  const customFee = customText
    ? Number(
        customization.price ?? product.customizationOptions?.price ?? 0
      )
    : 0;

  const unitPrice =
    Number(size?.price ?? product.price ?? 0) + customFee;

  return {
    _id: product._id,
    title: product.title,
    slug: product.slug,
    price: unitPrice,
    compareAtPrice: size?.compareAtPrice ?? product.compareAtPrice,
    quantity: Number(quantity || 1),
    color: color || variant?.colorName || "",
    capacity: capacity || size?.capacity || "",
    image: getCartItemImage({ ...product, color, variants }),
    variants: variants.map((v) => ({
      colorName: v.colorName,
      baseColorName: v.baseColorName,
      images: v.images,
    })),
    stock: Number(size?.stock ?? product.stock ?? 99),
    customization: customText
      ? {
          text: customText,
          font: customization.font,
          orientation: customization.orientation,
          engravingSize: customization.engravingSize,
          price: customFee,
        }
      : null,
  };
}

function cartMetrics(items) {
  const list = Array.isArray(items) ? items : [];
  const cartCount = list.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0
  );
  const cartTotal = list.reduce(
    (acc, item) =>
      acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  return { cartCount, cartTotal };
}

function computeDiscount(coupon, cartTotal) {
  if (!coupon) return 0;
  const total = Number(cartTotal || 0);
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (total * Number(coupon.discountValue || 0)) / 100;
    if (
      coupon.maximumDiscount !== null &&
      coupon.maximumDiscount !== undefined &&
      discount > Number(coupon.maximumDiscount)
    ) {
      discount = Number(coupon.maximumDiscount);
    }
  } else {
    discount = Number(coupon.discountValue || coupon.discount || 0);
  }

  return Math.min(Math.round(discount), Math.round(total));
}

function couponStillValid(coupon, items) {
  if (!coupon?.code) return false;
  const { cartCount, cartTotal } = cartMetrics(items);
  if (cartCount < Number(coupon.minimumItems || 1)) return false;
  if (cartTotal < Number(coupon.minimumCartValue || 0)) return false;
  return true;
}

function persistCoupon(coupon) {
  if (coupon?.code) {
    localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
  } else {
    localStorage.removeItem(COUPON_KEY);
  }
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const isMounted = useRef(false);
  const skipNextRevalidate = useRef(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const legacyCart = localStorage.getItem(LEGACY_CART_KEY);

      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else if (legacyCart) {
        const parsed = JSON.parse(legacyCart);
        const items = Array.isArray(parsed)
          ? parsed
          : parsed?.items || [];
        const normalized = items.map((item) => ({
          ...item,
          quantity: Number(item.quantity || item.qty || 1),
        }));
        setCartItems(normalized);
      }

      const savedCoupon = localStorage.getItem(COUPON_KEY);
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        if (parsed?.code) setAppliedCoupon(parsed);
      }
    } catch (error) {
      console.error("Failed to parse cart:", error);
    }
    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    window.dispatchEvent(new Event("bottle_cart_updated"));
  }, [cartItems]);

  const { cartCount, cartTotal } = cartMetrics(cartItems);

  const couponDiscount = computeDiscount(appliedCoupon, cartTotal);
  const shippingFee = 0;
  const finalTotal = Math.max(Math.round(cartTotal) - couponDiscount, 0);

  const removeCoupon = useCallback((opts = {}) => {
    setAppliedCoupon(null);
    persistCoupon(null);
    if (opts.notify) {
      toast.error(opts.message || "Coupon removed");
    }
  }, []);

  const applyCouponRef = useRef(null);

  const applyCoupon = useCallback(
    async (code, { silent = false } = {}) => {
      const normalized = String(code || "").trim().toUpperCase();
      if (!normalized) {
        return { success: false, message: "Enter a coupon code" };
      }

      if (cartItems.length === 0) {
        return { success: false, message: "Add items to your bag first" };
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/coupons/validate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: normalized,
              items: cartItems,
              cartTotal: Number(cartTotal),
            }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Unable to apply coupon");
        }

        const applied = {
          code: data.coupon?.code || normalized,
          description: data.coupon?.description || "",
          discountType: data.coupon?.discountType,
          discountValue: data.coupon?.discountValue,
          discount: Number(data.discount || 0),
          finalAmount: Number(data.finalAmount ?? cartTotal),
          minimumItems: data.coupon?.minimumItems ?? 1,
          minimumCartValue: data.coupon?.minimumCartValue ?? 0,
          maximumDiscount: data.coupon?.maximumDiscount ?? null,
        };

        skipNextRevalidate.current = true;
        setAppliedCoupon(applied);
        persistCoupon(applied);

        if (!silent) {
          toast.success(`Saved ₹${Math.round(applied.discount)} with ${applied.code}`);
        }

        return { success: true, coupon: applied };
      } catch (error) {
        if (!silent) {
          return {
            success: false,
            message: error.message || "Unable to apply coupon",
          };
        }

        if (appliedCoupon?.code === normalized) {
          if (couponStillValid(appliedCoupon, cartItems)) {
            const discount = computeDiscount(appliedCoupon, cartTotal);
            const updated = {
              ...appliedCoupon,
              discount,
              finalAmount: Math.max(cartTotal - discount, 0),
            };
            setAppliedCoupon(updated);
            persistCoupon(updated);
          } else {
            removeCoupon({
              notify: true,
              message: "Coupon removed — cart no longer qualifies.",
            });
          }
        }

        return { success: false, message: error.message };
      }
    },
    [appliedCoupon, cartItems, cartTotal, removeCoupon]
  );

  applyCouponRef.current = applyCoupon;

  const fetchAvailableCoupons = useCallback(async () => {
    try {
      setLoadingCoupons(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupons/storefront`
      );
      const data = await res.json();
      if (data.success) {
        setAvailableCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("FETCH CART COUPONS ERROR:", error);
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableCoupons();
  }, [fetchAvailableCoupons]);

  useEffect(() => {
    if (!isMounted.current || !appliedCoupon?.code) return;
    if (skipNextRevalidate.current) {
      skipNextRevalidate.current = false;
      return;
    }

    if (cartItems.length === 0) {
      removeCoupon();
      return;
    }

    const code = appliedCoupon.code;
    const timer = setTimeout(() => {
      applyCouponRef.current?.(code, { silent: true });
    }, 280);

    return () => clearTimeout(timer);
  }, [cartTotal, cartCount, appliedCoupon?.code, cartItems.length, removeCoupon]);

  const addToCart = (product, quantity, color, capacity, customization) => {
    const incoming = resolveLine(
      product,
      quantity,
      color,
      capacity,
      customization
    );

    if (!incoming._id) {
      toast.error("Unable to add this product.");
      return;
    }

    if (incoming.stock <= 0) {
      toast.error("This variant is out of stock.");
      return;
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) =>
        sameCartLine(item, incoming)
      );

      if (existingIndex === -1) {
        const qty = Math.min(incoming.quantity, incoming.stock);
        return [...prev, { ...incoming, quantity: qty }];
      }

      return prev.map((item, index) => {
        if (index !== existingIndex) return item;
        const nextQty = Math.min(
          item.quantity + incoming.quantity,
          Number(item.stock || incoming.stock || 99)
        );
        if (nextQty === item.quantity) {
          toast.error("No more stock available for this variant.");
        }
        return { ...item, ...incoming, quantity: nextQty };
      });
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (index, delta) => {
    setCartItems((prev) =>
      prev
        .map((item, i) => {
          if (i !== index) return item;
          const max = Number(item.stock || 99);
          const next = item.quantity + delta;
          if (next > max) {
            toast.error("That’s all the stock we have.");
            return { ...item, quantity: max };
          }
          return { ...item, quantity: next };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_KEY);
    removeCoupon();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        clearCart,
        removeFromCart,
        updateQuantity,
        cartTotal: Math.round(cartTotal),
        cartCount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        availableCoupons,
        loadingCoupons,
        fetchAvailableCoupons,
        couponDiscount,
        shippingFee,
        finalTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
