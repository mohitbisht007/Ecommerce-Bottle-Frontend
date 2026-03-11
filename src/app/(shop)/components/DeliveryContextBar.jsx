"use client";
import { useEffect, useState } from "react";
import { Zap, RefreshCw, Check, X, Loader2, MapPin } from "lucide-react";
import { calculateDistance } from "@/app/helpers/deliveryLogic";

export default function DeliveryContextBar() {
  const [context, setContext] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);

  const loadContext = () => {
    const saved = localStorage.getItem("delivery_context");
    if (saved) setContext(JSON.parse(saved));
    else setContext(null);
  };

  useEffect(() => {
    loadContext();
    window.addEventListener("storage", loadContext);
    window.addEventListener("delivery_context_updated", loadContext);
    return () => {
      window.removeEventListener("storage", loadContext);
      window.removeEventListener("delivery_context_updated", loadContext);
    };
  }, []);

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (newPin.length < 6) return;
    setLoading(true);

    try {
      const res = await fetch(`https://api.zippopotam.us/in/${newPin}`);
      const data = await res.json();
      if (data.places) {
        const { latitude, longitude, "place name": city } = data.places[0];
        const dist = calculateDistance(parseFloat(latitude), parseFloat(longitude));
        
        let status = dist <= 10 ? { time: '90 MINS', color: '#ec4899', type: 'EXPRESS' } : 
                     dist <= 50 ? { time: 'SAME DAY', color: '#3b82f6', type: 'NCR' } : 
                     { time: '2-4 DAYS', color: '#64748b', type: 'NATIONAL' };

        const updated = { pincode: newPin, result: { ...status, city }, coords: [latitude, longitude] };
        
        localStorage.setItem("delivery_context", JSON.stringify(updated));
        window.dispatchEvent(new Event("delivery_context_updated"));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!context && !isEditing) return null;

  return (
    <div className={`delivery-context-root ${context ? 'active' : ''}`}>
      <div className="delivery-bar-container" style={{ '--accent': isEditing ? '#111' : context?.result.color }}>
        <div className="bar-glass-effect"></div>
        
        <div className="bar-content-wrapper">
          {!isEditing ? (
            <>
              <div className="delivery-info-main">
                <div className="icon-badge" style={{ backgroundColor: `${context.result.color}15` }}>
                  <Zap size={14} className="zap-pulse" style={{ color: context.result.color }} />
                </div>
                <p className="delivery-text">
                  <span className="hide-mobile">Great news! </span>
                  <strong>{context.result.time} Delivery</strong> 
                  <span className="pincode-pill">to {context.pincode}</span>
                </p>
              </div>
              
              <button className="edit-trigger-btn" onClick={() => { setIsEditing(true); setNewPin(context.pincode); }}>
                <MapPin size={12} />
                <span>Change<span className="hide-mobile"> Location</span></span>
              </button>
            </>
          ) : (
            <form onSubmit={handleUpdatePin} className="inline-edit-form">
              <div className="input-with-icon">
                <MapPin size={14} className="input-inner-icon" />
                <input 
                  autoFocus
                  maxLength={6}
                  placeholder="Enter Pincode" 
                  value={newPin} 
                  onChange={(e) => setNewPin(e.target.value)} 
                />
              </div>
              <div className="form-action-buttons">
                <button type="submit" className="confirm-btn" disabled={loading || newPin.length < 6}>
                  {loading ? <Loader2 size={14} className="loading-spinner" /> : <Check size={16} />}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  <X size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}