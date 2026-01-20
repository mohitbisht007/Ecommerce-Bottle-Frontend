"use client";
import Image from "next/image";

export default function PageLoader() {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="logo-container">
          <Image 
            src="/Loader.png" 
            alt="Bouncy Bucket Loader" 
            width={130} 
            height={130} 
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