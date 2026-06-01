"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Edit3, ShoppingBag, Truck, ShieldCheck, Leaf, RotateCcw } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Truck, label: "Free Express Shipping", accent: "text-sky-600", bg: "bg-sky-500/10" },
  { icon: ShieldCheck, label: "1 Year Warranty", accent: "text-violet-600", bg: "bg-violet-500/10" },
  { icon: Leaf, label: "BPA Free Steel", accent: "text-emerald-600", bg: "bg-emerald-500/10" },
  { icon: RotateCcw, label: "7-Day Returns", accent: "text-rose-600", bg: "bg-rose-500/10" },
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

  const [selectedColor, setSelectedColor] = useState(initialProduct.variants[0]?.colorName || "");
  const [selectedCapacity, setSelectedCapacity] = useState(
    initialProduct.variants[0]?.sizes?.[0]?.capacity || ""
  );

  const { addToCart, cartItems, setIsCartOpen } = useCart();

  const router = useRouter()

  useEffect(() => {
    if (isCustomizing) {
      setActiveImgIdx(0);
    }
  }, [isCustomizing]);

  if (!product) return <div className="page-loader">Loading...</div>;

  const currentVariant = product.variants[selectedVarIdx];


  const handleAddToBag = () => {
    addToCart(
      product,
      quantity,
      currentVariant.colorName,
      selectedCapacity,
      isCustomizing ? { text: customText, font: selectedFont } : null);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, currentVariant.colorName, selectedCapacity);
    router.push("/checkout");
  };

  const isInBag = cartItems.some(
    (item) => item._id === product._id && item.color === currentVariant.colorName && item.capacity === selectedCapacity
  );

  const activeVariant =
    product.variants.find(
      (v) => v.colorName === selectedColor
    ) || currentVariant;

  const selectedSize =
    activeVariant?.sizes?.find(
      (s) => s.capacity === selectedCapacity
    ) || activeVariant?.sizes?.[0];

  const variantStock = selectedSize?.stock || 0;


  return (
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
            orientation={orientation} // Important
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

          {product.isCustomizable && (
            <div className="customization-selector">
              <button
                className={`mode-btn ${!isCustomizing ? 'active' : ''}`}
                onClick={() => setIsCustomizing(false)}
              >
                <ShoppingBag size={18} />
                Standard
              </button>
              <button
                className={`mode-btn ${isCustomizing ? 'active' : ''}`}
                onClick={() => setIsCustomizing(true)}
              >
                <Edit3 size={18} />
                Personalize (+₹{product.customizationOptions?.price || 299})
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

          <PurchaseControls
            quantity={quantity}
            setQuantity={setQuantity}
            handleAddToBag={handleAddToBag}
            handleBuyNow={handleBuyNow}
            isInBag={isInBag}
            variantStock={variantStock}
            setIsCartOpen={setIsCartOpen}
          />

          {/* Trust highlights */}
          <section className="mt-7" aria-label="Purchase guarantees">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Included with every order
            </p>

            <div className="rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 p-[1.5px] shadow-lg shadow-violet-500/20">
              <ul className="grid grid-cols-2 divide-x divide-y divide-slate-100 overflow-hidden rounded-[14px] bg-white lg:grid-cols-4 lg:divide-y-0">
                {TRUST_ITEMS.map(({ icon: Icon, label, accent, bg }) => (
                  <li
                    key={label}
                    className="group flex flex-col items-center px-3 py-5 text-center transition-colors hover:bg-slate-50 sm:py-6"
                  >
                    <span
                      className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${bg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={accent} size={22} strokeWidth={2} aria-hidden />
                    </span>
                    <span className="text-[13px] font-bold leading-snug text-slate-800">
                      {label}
                    </span>
                  </li>
                ))}
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
  );
}