"use client";
import Image from "next/image";

export default function PageLoader() {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        {/* Replace /logo.png with your actual logo path */}
        <div className="logo-wrapper">
          <Image 
            src="/logo.png" 
            alt="Logo Loader" 
            width={100} 
            height={100} 
            priority
            className="spinning-logo"
          />
        </div>
        <div className="loader-ring"></div>
        <p className="loader-text">Loading Excellence...</p>
      </div>
    </div>
  );
}