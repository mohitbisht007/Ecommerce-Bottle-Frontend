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

  const getDynamicStatus = (dist) => {
    const hour = new Date().getHours();
    const isWorkingHours = hour >= 10 && hour < 18; // 10 AM to 6 PM

    if (dist <= 10) {
      if (isWorkingHours) {
        return { time: '90 MINS', color: '#ec4899', type: 'EXPRESS' };
      } else if (hour >= 18) {
        return { time: 'TOMORROW', color: '#ec4899', type: 'EXPRESS' };
      } else {
        return { time: 'TODAY', color: '#ec4899', type: 'EXPRESS' };
      }
    } else if (dist <= 50) {
      // NCR Logic: Usually same day if ordered early, else tomorrow
      return hour < 14 
        ? { time: 'SAME DAY', color: '#3b82f6', type: 'NCR' } 
        : { time: 'TOMORROW', color: '#3b82f6', type: 'NCR' };
    } else {
      return { time: '2-4 DAYS', color: '#64748b', type: 'NATIONAL' };
    }
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
      if (!res.ok) throw new Error("Pincode API failed");

      const data = await res.json();

      if (data && data.places && data.places.length > 0) {
        const { latitude, longitude, "place name": city } = data.places[0];
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const dist = calculateDistance(lat, lng);
        saveAndExit(newPin, dist, city, [lat, lng]);
      } else {
        throw new Error("Invalid Format");
      }
    } catch (err) {
      console.warn("API Failed, using local fallback logic");
      // Fallback logic matching your DeliveryRadar.js
      const isDelhi = newPin.startsWith("11");
      const demoDistance = isDelhi ? 8.4 : 45.2;
      const demoCity = isDelhi ? "South Delhi" : "NCR Region";
      const demoCoords = isDelhi ? [28.6139, 77.2090] : [28.4595, 77.0266];

      saveAndExit(newPin, demoDistance, demoCity, demoCoords);
    } finally {
      setLoading(false);
    }
  };

  const saveAndExit = (pincode, dist, city, coords) => {
    const status = getDynamicStatus(dist); // Use the helper here

    const updated = {
      pincode,
      result: { ...status, city, distance: dist.toFixed(1) },
      coords
    };

    localStorage.setItem("delivery_context", JSON.stringify(updated));
    setContext(updated);
    window.dispatchEvent(new Event("delivery_context_updated"));
    setIsEditing(false);
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
              <div className="form-action-buttons" style={{ position: 'relative', zIndex: 50, display: 'flex', gap: '8px' }}>
                <button type="submit" className="confirm-btn" disabled={loading}>
                  {loading ? <Loader2 size={16} className="spin" /> : <Check size={18} color="#22c55e" />}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <X size={18} color="#ef4444" /> {/* Explicitly setting color to Red */}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}