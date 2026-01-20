"use client";
import { useState, useEffect } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OfferModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed it this session
    const isDismissed = sessionStorage.getItem("offer_dismissed");
    const isUserLoggedIn = localStorage.getItem("token");

    if (!isDismissed && !isUserLoggedIn) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // 5 second delay - feels more organic than instant
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("offer_dismissed", "true");
    setTimeout(() => setHasClosed(true), 500); // Wait for fade-out animation
  };

  if (hasClosed || (!isVisible && !hasClosed)) return null;

  return (
    <div className={`offer-overlay ${isVisible ? "active" : ""}`}>
      <div className="offer-card animate-slide-up">
        <button className="offer-close" onClick={handleClose}>
          <X size={20} />
        </button>
        
        <div className="offer-content">
          <div className="offer-badge">
            <Gift size={16} />
            <span>EXCLUSIVE OFFER</span>
          </div>
          
          <h2>Unlock 10% Off Your First Order</h2>
          <p>Join the Bouncy Bucket circle and experience the peak of hydration luxury.</p>

          <Link href="/signup" onClick={handleClose} className="offer-btn-primary">
            Claim My Discount <ArrowRight size={18} />
          </Link>

          <button onClick={handleClose} className="offer-btn-skip">
            No thanks, I'll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}