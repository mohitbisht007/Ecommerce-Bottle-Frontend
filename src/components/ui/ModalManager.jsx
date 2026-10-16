"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GenericModal from "./GenericModal";

export default function ModalManager() {
  const router = useRouter();
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    const isDismissed =
      sessionStorage.getItem("offer_dismissed");

    if (!isDismissed) {
      const timer = setTimeout(() => {
        setShowOffer(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowOffer(false);

    sessionStorage.setItem(
      "offer_dismissed",
      "true"
    );
  };

  const handleShopNow = () => {
    handleClose();
    router.push("/shop");
  };

  return (
    <GenericModal
      isOpen={showOffer}
      onClose={handleClose}
      title="Two bottles. One better deal."
      message={
        <>
          Pick any <strong>2 bottles</strong> and unlock
          <br />
          <strong>15% OFF</strong> instantly.
        </>
      }
      couponCode="BOTTLE15"
      primaryBtnText="Shop & Save 15%"
      onPrimaryClick={handleShopNow}
      secondaryBtnText="Maybe later"
    />
  );
}