"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import GallerySection from "@/components/shop/product/GallarySection";
import ProductInfoHeader from "@/components/shop/product/ProductInfoHeader";
import ProductOptions from "@/components/shop/product/ProductOptions";
import ProductTabs from "@/components/shop/product/ProductTabs";
import PurchaseControls from "@/components/shop/product/PurchaseControls";
import ReviewSection from "@/components/shop/product/ReviewSection";
import ProductSlider from "@/components/shop/catalog/ProductSlider";
import ProductCustomizer from "@/components/shop/product/ProductCustomizer";
import WhatsAppButton from "@/components/shop/home/WhatsAppButton";

import { useCart } from "@/app/context/CartContext";

import {
  Edit3,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Leaf,
  RotateCcw,
  X,
  Bell,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Truck,
    label: "Free Express Shipping",
    accent: "text-sky-600",
    bg: "bg-sky-500/10",
  },
  {
    icon: ShieldCheck,
    label: "1 Year Warranty",
    accent: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    icon: Leaf,
    label: "BPA Free Steel",
    accent: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: RotateCcw,
    label: "7-Day Returns",
    accent: "text-rose-600",
    bg: "bg-rose-500/10",
  },
];

export default function ProductClient({ initialProduct }) {
  const [product, setProduct] = useState(initialProduct);
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Customization States
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customText, setCustomText] = useState("");
  const [selectedFont, setSelectedFont] = useState("'Inter', sans-serif");
  const [orientation, setOrientation] = useState("horizontal");
  const [engravingSize, setEngravingSize] = useState("2inch");

  const [selectedColor, setSelectedColor] = useState(
    initialProduct.variants[0]?.colorName || ""
  );

  const [selectedCapacity, setSelectedCapacity] = useState(
    initialProduct.variants[0]?.sizes?.[0]?.capacity || ""
  );

  // Notify Me states
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState("");

  const { addToCart, cartItems, setIsCartOpen } = useCart();

  const router = useRouter();

  useEffect(() => {
    if (isCustomizing) {
      setActiveImgIdx(0);
    }
  }, [isCustomizing]);

  if (!product) {
    return <div className="page-loader">Loading...</div>;
  }

  const currentVariant = product.variants[selectedVarIdx];

  /*
   * -----------------------------------------
   * CURRENT SELECTED SIZE / STOCK
   * -----------------------------------------
   */

  const selectedSize =
    currentVariant?.sizes?.find(
      (size) => size.capacity === selectedCapacity
    ) || currentVariant?.sizes?.[0];

  const variantStock = Number(selectedSize?.stock || 0);

  /*
   * -----------------------------------------
   * ADD TO BAG
   * -----------------------------------------
   */

  const handleAddToBag = () => {
    addToCart(
      product,
      quantity,
      currentVariant.colorName,
      selectedCapacity,
      isCustomizing && customText?.trim()
        ? {
            text: customText,
            font: selectedFont,
            orientation,
            engravingSize,
            price: product.customizationOptions?.price || 299,
          }
        : null
    );
  };

  /*
   * -----------------------------------------
   * BUY NOW
   * -----------------------------------------
   */

  const handleBuyNow = () => {
    addToCart(
      product,
      quantity,
      currentVariant.colorName,
      selectedCapacity,
      isCustomizing && customText?.trim()
        ? {
            text: customText,
            font: selectedFont,
            orientation,
            engravingSize,
            price: product.customizationOptions?.price || 299,
          }
        : null
    );

    router.push("/checkout");
  };

  /*
   * -----------------------------------------
   * BAG CHECK
   * -----------------------------------------
   */

  const isInBag = cartItems.some(
    (item) =>
      item._id === product._id &&
      item.color === currentVariant.colorName &&
      item.capacity === selectedCapacity
  );

  /*
   * -----------------------------------------
   * NOTIFY ME
   * -----------------------------------------
   */

  const handleNotifyMe = () => {
  setNotifyError("");
  setNotifySuccess(false);

  let loggedInUser = null;

  try {
    const storedUser = localStorage.getItem("bottle_user");

    if (storedUser) {
      loggedInUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Unable to read logged-in user:", error);
  }

  /*
   * Logged-in customer
   *
   * We still open the modal so the customer gets
   * immediate visual feedback while the request
   * is being registered.
   */
  if (loggedInUser?.email) {
    setNotifyEmail(loggedInUser.email);
    setNotifyPhone(loggedInUser.phone || "");
    setShowNotifyModal(true);

    registerStockNotification({
      email: loggedInUser.email,
      phone: loggedInUser.phone || "",
    });

    return;
  }

  /*
   * Guest customer
   */
  setNotifyEmail("");
  setNotifyPhone("");
  setShowNotifyModal(true);
};

  /*
   * -----------------------------------------
   * REGISTER STOCK NOTIFICATION
   * -----------------------------------------
   */

  const registerStockNotification = async ({
    email,
    phone,
  }) => {
    try {
      setNotifyLoading(true);
      setNotifyError("");
      setNotifySuccess(false);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stock-notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            productId: product._id,
            color: currentVariant?.colorName || "",
            capacity: selectedCapacity,
            email: email.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to register stock notification"
        );
      }

      setNotifySuccess(true);

      /*
       * If the guest used the form,
       * keep the modal open briefly so they can
       * see the success message.
       */

      setTimeout(() => {
        setShowNotifyModal(false);
        setNotifySuccess(false);
      }, 2200);
    } catch (error) {
      console.error("NOTIFY ME ERROR:", error);

      setNotifyError(
        error.message ||
          "Unable to register. Please try again."
      );
    } finally {
      setNotifyLoading(false);
    }
  };

  /*
   * -----------------------------------------
   * SUBMIT GUEST NOTIFICATION FORM
   * -----------------------------------------
   */

  const handleNotifySubmit = async (e) => {
    e.preventDefault();

    setNotifyError("");

    const email = notifyEmail.trim();
    const phone = notifyPhone.trim();

    if (!email) {
      setNotifyError("Please enter your email address.");
      return;
    }

    if (!phone) {
      setNotifyError("Please enter your phone number.");
      return;
    }

    await registerStockNotification({
      email,
      phone,
    });
  };

  return (
    <>
      <div className="product-page-root">
        <div className="product-grid-wrapper container">

          {/* --- LEFT COLUMN: STICKY GALLERY --- */}

          <aside className="gallery-aside">
            <GallerySection
              product={product}
              currentVariant={currentVariant}
              selectedSize={selectedSize}
              activeImgIdx={activeImgIdx}
              setActiveImgIdx={setActiveImgIdx}
              isCustomizing={isCustomizing}
              customText={customText}
              selectedFont={selectedFont}
              orientation={orientation}
              engravingSize={engravingSize}
            />
          </aside>

          {/* --- RIGHT COLUMN: SCROLLABLE DETAILS --- */}

          <main className="details-main">

            <ProductInfoHeader
              product={product}
              variantStock={variantStock}
              selectedSize={selectedSize}
            />

            <ProductOptions
              product={product}
              currentVariant={currentVariant}
              selectedVarIdx={selectedVarIdx}
              setSelectedVarIdx={setSelectedVarIdx}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedCapacity={selectedCapacity}
              setSelectedCapacity={setSelectedCapacity}
              setActiveImgIdx={setActiveImgIdx}
            />

            {/* CUSTOMIZATION */}

            {product.isCustomizable && (
              <div className="customization-selector">

                <button
                  className={`mode-btn ${
                    !isCustomizing ? "active" : ""
                  }`}
                  onClick={() => setIsCustomizing(false)}
                >
                  <ShoppingBag size={18} />
                  Standard
                </button>

                <button
                  className={`mode-btn ${
                    isCustomizing ? "active" : ""
                  }`}
                  onClick={() => setIsCustomizing(true)}
                >
                  <Edit3 size={18} />
                  Personalize (+₹
                  {product.customizationOptions?.price || 299})
                </button>

              </div>
            )}

            {isCustomizing && (
              <ProductCustomizer
                customText={customText}
                setCustomText={setCustomText}
                selectedFont={selectedFont}
                setSelectedFont={setSelectedFont}
                maxChars={product.customizationOptions?.maxChars}
                orientation={orientation}
                setOrientation={setOrientation}
                engravingSize={engravingSize}
                setEngravingSize={setEngravingSize}
                currentCapacity={selectedCapacity}
              />
            )}

            {/* PURCHASE CONTROLS */}

            <PurchaseControls
              quantity={quantity}
              setQuantity={setQuantity}
              handleAddToBag={handleAddToBag}
              handleBuyNow={handleBuyNow}
              handleNotifyMe={handleNotifyMe}
              isInBag={isInBag}
              variantStock={variantStock}
              setIsCartOpen={setIsCartOpen}
            />

            {/* TRUST HIGHLIGHTS */}

            <section
              className="mt-7"
              aria-label="Purchase guarantees"
            >
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Included with every order
              </p>

              <div className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-500/20">

                <ul className="grid grid-cols-2 divide-x divide-y divide-slate-100 overflow-hidden rounded-[14px] bg-white lg:grid-cols-4 lg:divide-y-0">

                  {TRUST_ITEMS.map(
                    ({
                      icon: Icon,
                      label,
                      accent,
                      bg,
                    }) => (
                      <li
                        key={label}
                        className="group flex flex-col items-center px-3 py-5 text-center transition-colors hover:bg-slate-50 sm:py-6"
                      >
                        <span
                          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${bg} transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon
                            className={accent}
                            size={22}
                            strokeWidth={2}
                            aria-hidden
                          />
                        </span>

                        <span className="text-[13px] font-bold leading-snug text-slate-800">
                          {label}
                        </span>
                      </li>
                    )
                  )}

                </ul>
              </div>

              <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-slate-500">

                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Secure payment
                </span>

                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Authentic products
                </span>

                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Fast support
                </span>

              </p>
            </section>

            <ProductTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              product={product}
            />

          </main>
        </div>

        <div className="bottom-sections container">

          <ProductSlider
            title="Similar Styles"
            subtitle="More from our collection"
            fetchUrl={`${process.env.NEXT_PUBLIC_API_URL}/recommend?type=similar&category=${product.category}&productId=${product._id}`}
          />

          <ReviewSection
            productId={product._id}
            productRating={product.rating}
            totalReviews={product.reviewsCount}
          />

          <WhatsAppButton
            product={product}
            currentVariant={product.variants[selectedVarIdx]}
          />

        </div>
      </div>

      {/* =====================================================
          NOTIFY ME MODAL
      ===================================================== */}

      {showNotifyModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!notifyLoading) {
              setShowNotifyModal(false);
              setNotifyError("");
            }
          }}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => {
                if (!notifyLoading) {
                  setShowNotifyModal(false);
                  setNotifyError("");
                }
              }}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              aria-label="Close"
              disabled={notifyLoading}
            >
              <X size={18} />
            </button>

            {notifySuccess ? (
              /* SUCCESS STATE */
              <div className="px-6 py-10 text-center sm:px-8">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2
                    size={34}
                    className="text-emerald-600"
                  />
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  You’re on the list!
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  We’ll notify you when{" "}
                  <span className="font-semibold text-slate-700">
                    {product.title}
                  </span>{" "}
                  is back in stock.
                </p>

              </div>
            ) : (
              /* FORM STATE */
              <form
                onSubmit={handleNotifySubmit}
                className="p-6 sm:p-8"
              >

                <div className="mb-6">

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
                    <Bell
                      size={23}
                      className="text-violet-600"
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    Notify Me
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your details and we’ll let you know when this
                    product is back in stock.
                  </p>

                </div>

                {/* PRODUCT INFO */}

                <div className="mb-5 rounded-2xl bg-slate-50 p-4">

                  <p className="text-sm font-semibold text-slate-800">
                    {product.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {currentVariant?.colorName}
                    {selectedCapacity
                      ? ` • ${selectedCapacity}`
                      : ""}
                  </p>

                </div>

                {/* EMAIL */}

                <div className="mb-4">

                  <label
                    htmlFor="notify-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="notify-email"
                    type="email"
                    value={notifyEmail}
                    onChange={(e) =>
                      setNotifyEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={notifyLoading}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
                  />

                </div>

                {/* PHONE */}

                <div className="mb-5">

                  <label
                    htmlFor="notify-phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="notify-phone"
                    type="tel"
                    value={notifyPhone}
                    onChange={(e) =>
                      setNotifyPhone(e.target.value)
                    }
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    disabled={notifyLoading}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-slate-50"
                  />

                </div>

                {/* ERROR */}

                {notifyError && (
                  <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {notifyError}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={notifyLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {notifyLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Bell size={18} />
                      Notify Me When Available
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                  We’ll only use your details to notify you about this
                  product becoming available.
                </p>

              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}