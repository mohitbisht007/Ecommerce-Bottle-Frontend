"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { calculateDistance } from "@/app/helpers/deliveryLogic";
import { MapPin, Zap, Truck, Globe, Loader2, Navigation } from "lucide-react";

// SAFER DYNAMIC IMPORT
const MapComponent = dynamic(() => import("./MapVisual"), {
  ssr: false,
  loading: () => <div className="map-loader">Initializing Satellite...</div>
});

const HUB_COORDS = [28.5355, 77.2739];

export default function DeliveryRadar() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  const checkDelivery = async (e) => {
    e.preventDefault();
    if (pincode.length < 6) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`https://api.zippopotam.us/in/${pincode}`);
      const data = await res.json();

      if (data.places && data.places.length > 0) {
        const { latitude, longitude, "place name": city } = data.places[0];
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const distance = calculateDistance(lat, lng);

        setUserCoords([lat, lng]);
        processResult(distance, city);
      } else {
        throw new Error("Pincode not found");
      }
    } catch (err) {
      // Demo Fallback
      const demoDistance = pincode.startsWith("11") ? 8 : 35;
      const demoCoords = pincode.startsWith("11") ? [28.6139, 77.2090] : [28.4595, 77.0266];
      setUserCoords(demoCoords);
      processResult(demoDistance, "Delhi NCR Area");
    } finally {
      setLoading(false);
    }
  };

  const processResult = (distance, city) => {
    let status = {};
    if (distance <= 10) {
      status = { type: 'EXPRESS', time: '90 MINS', desc: 'Instant Customization', icon: <Zap size={24} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' };
    } else if (distance <= 50) {
      status = { type: 'NCR', time: 'SAME DAY', desc: 'City Wide Priority', icon: <Truck size={24} />, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' };
    } else {
      status = { type: 'NATIONAL', time: '2-4 DAYS', desc: 'Premium Shipping', icon: <Globe size={24} />, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
    }
    setResult({ ...status, city, distance: distance.toFixed(1) });
  };

  return (
    <section className="velocity-radar-root">
      <div className="velocity-container">
        <div className="velocity-text-content">
          <div className="live-status-pill">
            <span className="live-dot"></span>
            HUB: OKHLA ACTIVE
          </div>
          <h2 className="velocity-title">The Speed of <br /><span>Hydration.</span></h2>
          <p className="velocity-desc">Enter your pincode to visualize your luxury delivery route.</p>

          <form onSubmit={checkDelivery} className="modern-pincode-box">
            <MapPin className="pin-icon" size={20} />
            <input
              type="text"
              placeholder="Enter Pincode..."
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
            />
            <button type="submit" className="check-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" /> : "Trace Route"}
            </button>
          </form>

          {result && (
            <div className="velocity-result-card active" style={{ '--accent': result.color }}>
              <div className="card-glass-glow"></div>

              <div className="result-main-flex">
                <div className="res-icon-wrapper" style={{ backgroundColor: result.bg, color: result.color }}>
                  {result.icon}
                  <div className="icon-pulse" style={{ backgroundColor: result.color }}></div>
                </div>

                <div className="res-info">
                  <div className="res-header">
                    <h4>{result.time} DELIVERY</h4>
                    <span className="distance-badge">{result.distance}km</span>
                  </div>
                  <p>{result.desc} to <span className="city-highlight">{result.city}</span></p>
                </div>
              </div>

              <div className="card-footer-progress">
                <div className="progress-track">
                  <div className="progress-fill" style={{ backgroundColor: result.color }}></div>
                </div>
                <span>Route Calculated Successfully</span>
              </div>
            </div>
          )}
        </div>

        <div className="velocity-visual-wrapper">
          <div className="radar-glass-circle">
            <MapComponent hubCoords={HUB_COORDS} userCoords={userCoords} resultColor={result?.color} />
            <div className="radar-scanner"></div>
          </div>
        </div>
      </div>
    </section>
  );
}