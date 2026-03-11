"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import { calculateDistance } from "@/app/helpers/deliveryLogic";
import { MapPin, Zap, Truck, Globe, Loader2, Navigation } from "lucide-react";

const MapComponent = dynamic(() => import("./MapVisual"), {
  ssr: false,
  loading: () => <div className="map-loading-placeholder">Syncing Satellites...</div>
});

const HUB_COORDS = [28.5355, 77.2739];

export default function DeliveryRadar() {
  const router = useRouter();
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const renderIcon = (iconName) => {
    switch (iconName) {
      case "zap": return <Zap size={22} />;
      case "truck": return <Truck size={22} />;
      case "globe": return <Globe size={22} />;
      default: return <Navigation size={22} />;
    }
  };

  // Persistence: Load saved pincode/result on mount
  useEffect(() => {
    const savedContext = localStorage.getItem("delivery_context");
    if (savedContext) {
      const { pincode: savedPin, result: savedRes, coords } = JSON.parse(savedContext);
      setPincode(savedPin);
      setResult(savedRes);
      setUserCoords(coords);
    }
  }, []);

  const checkDelivery = async (e) => {
    e.preventDefault();
    if (pincode.length < 6) return;
    setLoading(true);

    try {
      const res = await fetch(`https://api.zippopotam.us/in/${pincode}`);
      const data = await res.json();

      if (data.places && data.places.length > 0) {
        const { latitude, longitude, "place name": city } = data.places[0];
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const distance = calculateDistance(lat, lng);

        const coords = [lat, lng];
        setUserCoords(coords);
        processResult(distance, city, coords);

      } else {
        throw new Error("Invalid Pincode");
      }
    } catch (err) {
      const isDelhi = pincode.startsWith("11");
      const demoDistance = isDelhi ? 8.4 : 45.2;
      const demoCity = isDelhi ? "South Delhi" : "NCR Region";
      const demoCoords = isDelhi ? [28.6139, 77.2090] : [28.4595, 77.0266];

      setUserCoords(demoCoords);
      processResult(demoDistance, demoCity, demoCoords);
    } finally {
      setLoading(false);
    }
  };

  const processResult = (distance, city, coords) => {
    let status = {};
    if (distance <= 10) {
      // Change icon: <Zap /> to icon: "zap"
      status = { type: 'EXPRESS', time: '90 MINS', desc: 'Priority Crafting', icon: "zap", color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' };
    } else if (distance <= 50) {
      status = { type: 'NCR', time: 'SAME DAY', desc: 'City Wide Sprint', icon: "truck", color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
    } else {
      status = { type: 'NATIONAL', time: '2-4 DAYS', desc: 'Premium Freight', icon: "globe", color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
    }

    const finalResult = { ...status, city, distance: distance.toFixed(1) };
    setResult(finalResult);

    localStorage.setItem("delivery_context", JSON.stringify({
      pincode,
      result: finalResult,
      coords
    }));
    window.dispatchEvent(new Event("delivery_context_updated"));
    router.push("/shop?check=success")
  };

  return (
    <section className="velocity-root">
      <div className="speed-line sl-1"></div>
      <div className="speed-line sl-2"></div>

      <div className="priority-hero-header">
        <div className="status-badge">
          <span className="pulse-dot"></span>
          <span className="badge-txt">LIVE LOGISTICS ACTIVE</span>
        </div>
        <h2 className="hero-title">
          Customized Luxury <br />
          In <span className="speed-text">90 Minutes.</span>
        </h2>
        <div className="velocity-loader-bar"></div>
      </div>

      <div className="velocity-grid">
        <div className="v-content">
          <div className="hub-tag">
            <Navigation size={14} className="icon-pink" />
            <span>CENTRAL HUB: OKHLA, NEW DELHI</span>
          </div>
          <h3 className="v-headline">Is your zone <span>Express Ready?</span></h3>
          <p className="v-sub">Every bottle is hand-finished and dispatched instantly from our Okhla facility.</p>

          <form onSubmit={checkDelivery} className="v-input-box">
            <div className="input-flex">
              <MapPin size={20} className="icon-pink" />
              <input
                type="text"
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
              />
            </div>
            <button type="submit" className="v-submit" disabled={loading}>
              {loading ? <Loader2 className="spin" /> : "ENGAGE ROUTE"}
            </button>
          </form>

          {/* THE WORKING RESULT CARD */}
          {result && (
            <div className={`v-result-card ${result ? 'active' : ''}`} style={{ '--accent': result.color }}>
              <div className="v-res-top">
                <div className="v-res-icon" style={{ backgroundColor: result.bg, color: result.color }}>
                  {renderIcon(result.icon)}
                </div>
                <div className="v-res-txt">
                  <span className="v-res-label" style={{ color: result.color }}>{result.time} DELIVERY</span>
                  <h4>{result.city} Eligible</h4>
                </div>
                <div className="v-dist">{result.distance}km</div>
              </div>
              <div className="v-res-footer">
                <div className="v-progress-bg">
                  <div className="v-progress-fill" style={{ background: result.color }}></div>
                </div>
                <p>{result.desc} available for your location</p>
              </div>
            </div>
          )}
        </div>

        <div className="v-visual">
          <div className="v-map-frame">
            <MapComponent hubCoords={HUB_COORDS} userCoords={userCoords} resultColor={result?.color} />
            <div className="v-map-overlay"></div>
          </div>
        </div>
      </div>
    </section>
  );
}