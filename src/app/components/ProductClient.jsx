"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import GallerySection from "../(shop)/components/productpage_components/GallarySection";
import ProductInfoHeader from "../(shop)/components/productpage_components/ProductInfoHeader";
import ProductOptions from "../(shop)/components/productpage_components/ProductOptions";
import ProductTabs from "../(shop)/components/productpage_components/ProductTabs";
import PurchaseControls from "../(shop)/components/productpage_components/PurchaseControls";
import ReviewSection from "@/app/components/ReviewSection";
import ProductSlider from "@/app/components/ProductSlider";
import { useCart } from "@/app/context/CartContext";


export default function ProductClient({ initialProduct }) {
  // Use initialProduct directly to avoid "Loading..." flicker
  const [product, setProduct] = useState(initialProduct);
  const { slug } = useParams();
  const [selectedVarIdx, setSelectedVarIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const router = useRouter()

  // Initialize strings based on the first variant for accurate stock checking
  const [selectedColor, setSelectedColor] = useState(
    initialProduct.variants[0]?.colorName || ""
  );
  const [selectedCapacity, setSelectedCapacity] = useState(
    initialProduct.variants[0]?.capacity || ""
  );

  const { addToCart, cartItems, setIsCartOpen } = useCart();

  // Auto-Play Logic for Gallery
  useEffect(() => {
    if (!product) return;
    const currentImages = product.variants[selectedVarIdx]?.images || [];
    if (currentImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImgIdx((prev) =>
        prev === currentImages.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [product, selectedVarIdx]);

  if (!product) return <div className="page-loader">Loading...</div>;

  const currentVariant = product.variants[selectedVarIdx];
  const activeImg = currentVariant.images[activeImgIdx];

  const discount = product.compareAtPrice
    ? Math.round(
      ((product.compareAtPrice - product.price) / product.compareAtPrice) *
      100
    )
    : 0;

  const handleAddToBag = () => {
    addToCart(product, quantity, currentVariant.colorName, selectedCapacity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, currentVariant.colorName, selectedCapacity);
    router.push("/checkout");
  };

  const isInBag = cartItems.some(
    (item) =>
      item._id === product._id &&
      item.color === currentVariant.colorName &&
      item.capacity === selectedCapacity
  );

  const availableCapacities = [
    ...new Set(product.variants.map((v) => v.capacity)),
  ];

  const activeVariant =
    product.variants.find(
      (v) => v.colorName === selectedColor && v.capacity === selectedCapacity
    ) || currentVariant;

  const variantStock = activeVariant.stock;

  return (
    <div className="product-page-root">
      <div className="product-grid-wrapper container">
        {/* --- LEFT: GALLERY --- */}

        <GallerySection
          product={product}
          discount={discount}
          activeImg={activeImg}
          currentVariant={currentVariant}
          activeImgIdx={activeImgIdx}
          setActiveImgIdx={setActiveImgIdx}
        />

        {/* --- RIGHT: CONTENT --- */}
        <ProductInfoHeader
          product={product}
          variantStock={variantStock}
          discount={discount}
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

        <PurchaseControls
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddToBag={handleAddToBag}
          handleBuyNow={handleBuyNow}
          isInBag={isInBag}
          variantStock={variantStock}
          setIsCartOpen={setIsCartOpen}
        />

        <ProductTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          product={product}
        />
      </div>

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
    </div>
  );
}
