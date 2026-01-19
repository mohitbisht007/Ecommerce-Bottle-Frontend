"use client";
import Image from "next/image";

export default function PageLoader() {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="logo-container">
          <Image 
            src="/logo3.png" 
            alt="Bouncy Bucket Loader" 
            width={200} 
            height={200} 
            priority
            className="spinning-logo"
          />
        </div>
        <div className="loader-footer">
          <span className="loader-text">Loading</span>
          <span className="dot-flashing"></span>
        </div>
      </div>
    </div>
  );
}