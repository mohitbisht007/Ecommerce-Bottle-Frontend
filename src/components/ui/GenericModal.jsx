"use client";
import React from "react";
import { X, ArrowRight, CheckCircle, AlertTriangle, Gift, Lock } from "lucide-react";

export default function GenericModal({ 
  isOpen, 
  onClose, 
  type = "offer", 
  title, 
  message, 
  primaryBtnText, 
  onPrimaryClick,
  secondaryBtnText 
}) {
  if (!isOpen) return null;

  // Icon mapping for the top circle
  const icons = {
    offer: <Gift size={22} />,
    success: <CheckCircle size={22} />,
    error: <AlertTriangle size={22} />,
  };

  return (
    <div className="modal-overlay">
      <div className="id-modal animate-slide-up">
        {/* Close Button with rotation effect */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          {/* Your signature brand dot, now with dynamic icons */}
          <div className="brand-dot-wrapper">
             <div className={`brand-dot-type ${type}`}>
                {icons[type]}
             </div>
          </div>
          
          <h2>{title}</h2>
          <p>{message}</p>
        </div>

        <div className="modal-body">
          {primaryBtnText && (
            <button onClick={onPrimaryClick} className="premium-submit-btn">
              {primaryBtnText} <ArrowRight size={18} />
            </button>
          )}

          {secondaryBtnText && (
            <div className="modal-alt-action">
              <button onClick={onClose} className="guest-link">
                {secondaryBtnText}
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Lock size={12} />
          SECURE ENCRYPTED CONNECTION
        </div>
      </div>
    </div>
  );
}