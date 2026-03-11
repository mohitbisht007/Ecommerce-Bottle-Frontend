"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GenericModal from "./GenericModal";

export default function ModalManager() {
  const [showOffer, setShowOffer] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Check if user already dismissed it this session
    const isDismissed = sessionStorage.getItem("offer_dismissed");
    // 2. Check if user is already logged in (no need to offer sign-up discount)
    const isUserLoggedIn = localStorage.getItem("token");

    if (!isDismissed && !isUserLoggedIn) {
      const timer = setTimeout(() => {
        setShowOffer(true);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowOffer(false);
    sessionStorage.setItem("offer_dismissed", "true");
  };

  return (
    <GenericModal
      isOpen={showOffer}
      onClose={handleClose}
      type="offer"
      title="Unlock 10% Off"
      message="Join the Bouncy Bucket circle today and experience the peak of hydration luxury."
      primaryBtnText="Claim My Discount"
      onPrimaryClick={() => {
        handleClose();
        router.push('/signup');
      }}
      secondaryBtnText="No thanks, I'll pay full price"
    />
  );
}