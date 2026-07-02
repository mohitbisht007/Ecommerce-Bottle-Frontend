"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { calculateDistance } from "@/app/helpers/deliveryLogic";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";

import {
  X, Check, ShoppingBag, Plus, Trash2, ChevronLeft,
  ChevronRight, Loader2, Shield, Lock, Truck, ArrowRight
} from "lucide-react";

export default function CheckoutPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);

  // Holds guest address locally until the "Pay" button is clicked
  const [temporaryGuestAddress, setTemporaryGuestAddress] = useState(null);

  const [userEmail, setUserEmail] = useState(""); // This tracks the email for the whole session
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
    state: "",
  });

  const [deliveryContext, setDeliveryContext] = useState(null);
  const syncDeliveryContext = () => {
    const saved = localStorage.getItem("delivery_context");
    if (saved) {
      setDeliveryContext(JSON.parse(saved));
    }
  };

  const [isEditingSidebar, setIsEditingSidebar] = useState(false);
  const [sidebarPin, setSidebarPin] = useState("");
  const [sidebarLoading, setSidebarLoading] = useState(false);

  const saveAndSync = (pincode, dist, city, coords) => {
    const hour = new Date().getHours();
    let status = {};

    if (dist <= 10) {
      const timeLabel = (hour >= 10 && hour < 18) ? '90 MINS' : (hour >= 18 ? 'TOMORROW' : 'TODAY');
      status = { time: timeLabel, color: '#ec4899', type: 'EXPRESS' }; // Added 'type'
    } else if (dist <= 50) {
      const timeLabel = hour < 14 ? 'SAME DAY' : 'TOMORROW';
      status = { time: timeLabel, color: '#3b82f6', type: 'NCR' }; // Added 'type'
    } else {
      status = { time: '2-4 DAYS', color: '#64748b', type: 'NATIONAL' }; // Added 'type'
    }

    const updated = { pincode, result: { ...status, city, distance: dist.toFixed(1) }, coords };

    localStorage.setItem("delivery_context", JSON.stringify(updated));
    window.dispatchEvent(new Event("delivery_context_updated"));
    setDeliveryContext(updated);
  };

  // This function mirrors your DeliveryContextBar logic to keep everything in sync
  const handleSidebarPinUpdate = async (e) => {
    e.preventDefault();
    if (sidebarPin.length < 6) return;
    setSidebarLoading(true);

    try {
      const res = await fetch(`https://api.zippopotam.us/in/${sidebarPin}`);

      if (!res.ok) throw new Error("Pincode API failed");

      const data = await res.json();

      if (data && data.places && data.places.length > 0) {
        const { latitude, longitude, "place name": city } = data.places[0];
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        // This requires calculateDistance to be imported
        const dist = calculateDistance(lat, lng);

        saveAndSync(sidebarPin, dist, city, [lat, lng]);
      } else {
        throw new Error("Invalid format from API");
      }
    } catch (err) {
      console.warn("Using fallback logic for pincode:", sidebarPin);

      // Mirroring your DeliveryContextBar's fallback logic
      const isDelhi = sidebarPin.startsWith("11");
      const demoDistance = isDelhi ? 8.4 : 45.2;
      const demoCity = isDelhi ? "South Delhi" : "NCR Region";
      const demoCoords = isDelhi ? [28.6139, 77.2090] : [28.4595, 77.0266];

      saveAndSync(sidebarPin, demoDistance, demoCity, demoCoords);
    } finally {
      setSidebarLoading(false);
      setIsEditingSidebar(false);
    }
  };

  useEffect(() => {
    syncDeliveryContext();
    // Listen for updates from the DeliveryContextBar
    window.addEventListener("delivery_context_updated", syncDeliveryContext);
    return () => window.removeEventListener("delivery_context_updated", syncDeliveryContext);
  }, []);

  // 2. Format the Delivery Date dynamically
  const getDeliveryEstimate = () => {
    if (!deliveryContext) return "Enter Pincode for estimate";

    const now = new Date();
    const currentHour = now.getHours();
    const result = deliveryContext.result;

    // Safety check for distance and type
    const distance = parseFloat(result.distance);
    const isExpress = result.type === 'EXPRESS' || distance <= 10;
    const isNCR = result.type === 'NCR' || (distance > 10 && distance <= 50);

    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { day: 'numeric', month: 'short' };

    // --- 1. EXPRESS LOGIC (South Delhi / < 10km) ---
    if (isExpress) {
      // If it's after 6 PM (18:00)
      if (currentHour >= 18) {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60000);
        return `Expected by: Tomorrow, ${tomorrow.toLocaleDateString('en-IN', dateOptions)} (10:30 AM - 12:00 PM)`;
      }
      // If it's before 10 AM
      if (currentHour < 10) {
        return "Expected by: Today, approx. 11:30 AM";
      }
      // During 10 AM - 6 PM
      const arrivalTime = new Date(now.getTime() + 90 * 60000);
      return `Expected by: Today, approx. ${arrivalTime.toLocaleTimeString('en-IN', timeOptions)}`;
    }

    // --- 2. NCR LOGIC (10km - 50km) ---
    if (isNCR) {
      if (currentHour >= 14) {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60000);
        return `Expected by: ${tomorrow.toLocaleDateString('en-IN', dateOptions)} Evening`;
      }
      const arrivalTime = new Date(now.getTime() + 6 * 60 * 60000);
      return `Expected by: Today, before ${arrivalTime.toLocaleTimeString('en-IN', timeOptions)}`;
    }

    // --- 3. NATIONAL LOGIC (Default) ---
    const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60000);
    return `Expected by: ${deliveryDate.toLocaleDateString('en-IN', dateOptions)}`;
  };

  const gstRate = 0.18;
  const finalTotal = cartTotal; // This is the 999 user sees
  const basePrice = Math.round(finalTotal / (1 + gstRate));
  const gstAmount = finalTotal - basePrice;


  useEffect(() => {
    setHasMounted(true);
    document.title = "Checkout | BouncyBucket";

    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("bottle_user") || "{}");

    if (token) {
      setUserEmail(storedUser.email || "");
      fetchAddresses(token);
    }
  }, []);

  useEffect(() => {
  if (!confirmingOrder) return;

  window.history.pushState(null, "", window.location.href);

  const handlePopState = () => {
    window.history.pushState(null, "", window.location.href);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [confirmingOrder]);


  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `JWT ${token}`;
    return headers;
  };

  const handleIdentify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();

      setUserEmail(emailInput); // Set global email from modal
      if (data.exists) {
        setSavedAddresses(data.addresses || []);
        setSelectedAddressId(data.addresses[0]?._id);
        setIsAddingAddress(false);
      } else {
        setIsAddingAddress(true);
      }
      setShowEmailModal(false);
    } catch (err) {
      console.error("Identification failed", err);
    } finally {
      setLoading(false);
    }
  };

  async function fetchAddresses(token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `JWT ${token}` },
      });
      const data = await res.json();
      const userAddresses = data.user?.addresses || [];
      setSavedAddresses(userAddresses);
      if (userAddresses.length > 0) {
        const def = userAddresses.find((a) => a.isDefault) || userAddresses[0];
        setSelectedAddressId(def._id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!isAddingAddress && selectedAddressId && savedAddresses.length > 0) {
      const selected = savedAddresses.find(a => a._id === selectedAddressId);

      if (selected && selected.zip && deliveryContext?.pincode !== selected.zip) {
        const pin = selected.zip;

        // Check if it's a known Express/NCR zone by pincode prefix
        // Delhi (11), Noida (201), Gurgaon (122), Ghaziabad (201)
        const isExpressZone = pin.startsWith("11");
        const isNCRZone = pin.startsWith("201") || pin.startsWith("122") || pin.startsWith("121");

        if (isExpressZone) {
          saveAndSync(pin, 8.4, selected.city || "Delhi", [28.6, 77.2]);
        } else if (isNCRZone) {
          saveAndSync(pin, 35.0, selected.city || "NCR", [28.4, 77.0]);
        } else {
          // NATIONAL: High distance to trigger the 2-4 days logic (e.g., 500km)
          saveAndSync(pin, 500.0, selected.city, [0, 0]);
        }
      }
    }
  }, [selectedAddressId, isAddingAddress, savedAddresses]);

  const handlePincodeChange = async (e) => {
    const pin = e.target.value.replace(/\D/g, ""); // Allow only numbers
    setNewAddr({ ...newAddr, pincode: pin });

    if (pin.length === 6) {
      setSidebarLoading(true);
      try {
        const res = await fetch(`https://api.zippopotam.us/in/${pin}`);
        const data = await res.json();

        if (data && data.places && data.places.length > 0) {
          const place = data.places[0];
          const city = place["place name"];
          const state = place["state"];
          const lat = parseFloat(place.latitude);
          const lng = parseFloat(place.longitude);
          const dist = calculateDistance(lat, lng);

          // UPDATE FORM STATE IMMEDIATELY
          setNewAddr(prev => ({
            ...prev,
            city: city,
            state: state,
            pincode: pin
          }));

          // SYNC SIDEBAR
          saveAndSync(pin, dist, city, [lat, lng]);
        }
      } catch (err) {
        // Fallback logic
        const isDelhi = pin.startsWith("11");
        const fallbackCity = isDelhi ? "South Delhi" : "National";
        const fallbackState = isDelhi ? "Delhi" : "";

        setNewAddr(prev => ({
          ...prev,
          city: fallbackCity,
          state: fallbackState
        }));

        saveAndSync(pin, isDelhi ? 8.4 : 45.2, fallbackCity, [0, 0]);
      } finally {
        setSidebarLoading(false);
      }
    }
  };

  const saveAddress = async () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/add-address`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        name: newAddr.fullName,
        email: userEmail,
        number: newAddr.phone,
        street: newAddr.addressLine,
        city: newAddr.city,
        state: newAddr.state,
        zip: newAddr.pincode,
        landmark: "",
        isDefault: false,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Unable to save address");
  }

  return await res.json();
};

  const handleContinueToPayment = async  (e) => {
    if (e) e.preventDefault();

    if (isAddingAddress) {

    const token = localStorage.getItem("token");

    // Logged in user
    if (token) {

        try {

            await saveAddress();

            await fetchAddresses(token);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/me`,
                {
                    headers: {
                        Authorization: `JWT ${token}`,
                    },
                }
            );

            const data = await res.json();

            const addresses = data.user.addresses;

            const latest = addresses[addresses.length - 1];

            setSavedAddresses(addresses);

            setSelectedAddressId(latest._id);

            setIsAddingAddress(false);

            setStep(3);

            return;

        } catch (err) {
            alert(err.message);
            return;
        }
    }

    // Guest Checkout

    const manualAddress = {
        name: newAddr.fullName,
        number: newAddr.phone,
        street: newAddr.addressLine,
        city: newAddr.city,
        zip: newAddr.pincode,
        state: newAddr.state,
    };

    setTemporaryGuestAddress(manualAddress);

    setStep(3);

    return;
} if (selectedAddressId) {
        setStep(3);
    } else {
        alert("Please select an address.");
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);

    // 1. Map the address correctly
    let addressToSend;
    if (isAddingAddress) {
      // Convert Frontend names (fullName, pincode) to Schema names (name, zip)
      addressToSend = {
        name: newAddr.fullName,
        number: newAddr.phone,
        street: newAddr.addressLine,
        city: newAddr.city,
        zip: newAddr.pincode,
        state: newAddr.state,
      };
    } else {
      addressToSend = savedAddresses.find((a) => a._id === selectedAddressId);
    }

    // 2. Validate before sending
    if (!addressToSend || !userEmail) {
      alert("Please complete address and email details.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          items: cartItems,
          address: addressToSend, // Now contains 'name' and 'zip'
          email: userEmail
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || orderData.message || "Checkout failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "BouncyBucket",
        order_id: orderData.order_id || orderData.orderId,
        handler: async (resp) => {
          setConfirmingOrder(true);
          try {
            const vRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/verify`, {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify(resp),
            });

            const verifyData = await vRes.json();
            if (vRes.ok) {
              clearCart();
              router.push(`/success?orderId=${resp.razorpay_order_id}`);
            } else {
              setConfirmingOrder(false);
              toast.error(verifyData.message || verifyData.error || "Payment verification failed");
            }
          } catch {
            setConfirmingOrder(false);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment cancelled");
          },
        },
        prefill: {
          contact: addressToSend.number,
          name: addressToSend.name,
          email: userEmail
        },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setConfirmingOrder(false);
        setLoading(false);
        toast.error(response.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (e) {
      setConfirmingOrder(false);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted) return null;

  if (confirmingOrder) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">

        <div className="mx-auto w-20 h-20 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>

        <h2 className="mt-10 text-3xl font-bold text-slate-900">
          Confirming Your Order
        </h2>

        <p className="mt-4 text-slate-600 leading-7">
          Please don't refresh, close this window or press the back button.
        </p>

        <div className="mt-10 space-y-3">

          <div className="flex items-center gap-3 text-left">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
            <span className="text-slate-700">
              Verifying secure payment...
            </span>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
            <span className="text-slate-700">
              Saving your order...
            </span>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
            <span className="text-slate-700">
              Generating invoice...
            </span>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
            <span className="text-slate-700">
              Sending confirmation email...
            </span>
          </div>

        </div>

        <div className="mt-10 text-sm text-slate-500">
          This usually takes 5–15 seconds.
        </div>

      </div>
    </div>
  );
}

 if (cartItems.length === 0)
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-10 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-cyan-200/30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-pink-200/20 blur-3xl rounded-full"></div>
      </div>

      <section className="relative w-full max-w-xl">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-[0_20px_80px_rgba(15,23,42,0.08)] overflow-hidden">

          {/* Top Banner */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 sm:px-10 pt-14 pb-20 text-center">

            <div className="mx-auto w-28 h-28 rounded-full bg-white flex items-center justify-center border-[6px] border-slate-100 shadow-2xl">
              <ShoppingBag
                size={56}
                strokeWidth={1.5}
                className="text-slate-900"
              />
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Your Cart is Empty
            </h1>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              Looks like you haven’t added anything yet. Explore our premium collection and discover hydration products crafted for modern lifestyles.
            </p>
          </div>

          {/* Bottom Content */}
          <div className="relative px-5 sm:px-8 pb-8 -mt-10 z-10">

            {/* Feature Box */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-6">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                    ✨
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm">
                    Premium Design
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Minimal, modern bottles crafted for style and performance.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                    🚚
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm">
                    Fast Delivery
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Express shipping available across India with secure packaging.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                    🛡️
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm">
                    Trusted Quality
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Durable stainless steel and leakproof craftsmanship.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">

                <Link
                  href="/shop"
                  className="flex-1 h-14 rounded-2xl bg-black hover:bg-slate-800 transition-all duration-300 text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-black/10"
                >
                  Explore Collection
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/"
                  className="flex-1 h-14 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 transition-all duration-300 text-slate-900 flex items-center justify-center font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Trusted by modern lifestyle enthusiasts across India.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="checkout-page-root">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <nav className="checkout-nav">
        <div className="container nav-wrap">
          <Link href="/" className="brand-logo">
            BOUNCYBUCKET
          </Link>
          <div className="secure-badge">
            <Lock size={14} /> {"SECURE CHECKOUT"}
          </div>
        </div>
      </nav>

      <main className="container checkout-container">
        {/* Progress Bar logic here */}
        <div className="progress-bar-wrap">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`progress-step ${step === num ? "active" : ""} ${step > num ? "completed" : ""
                }`}
            >
              <div className="step-circle">
                {step > num ? <Check size={16} /> : num}
              </div>
              <span>
                {num === 1 ? "Bag" : num === 2 ? "Shipping" : "Payment"}
              </span>
            </div>
          ))}
        </div>

        <div className="grid-layout">
          <div className="main-content">
            {step === 1 && (
              <div className="card-glass animate-up">
                <h2 className="card-title">
                  {"Review Bag"} <span>({cartItems.length})</span>
                </h2>
                <div className="item-list">
                  {cartItems.map((item, i) => (
                    <div key={i} className="checkout-item">
                      <div className="img-holder">
                        <Image
                          src={item.variants?.[0]?.images?.[0] || item.image}
                          width={100}
                          height={100}
                          alt={item.title}
                        />
                      </div>
                      <div className="details">
                        <h3>{item.title}</h3>
                        <p>
                          {item.color} / {item.capacity}
                        </p>
                        <div className="qty-wrap">
                          <button onClick={() => updateQuantity(i, -1)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(i, 1)}>
                            +
                          </button>
                        </div>
                      </div>
                      <div className="price-tag">
                        ₹{item.price * item.quantity}
                        <button onClick={() => removeFromCart(i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-action" onClick={() => setStep(2)}>
                  {"Continue to Shipping"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="card-glass animate-up">
                <div className="header-with-back">
                  <button onClick={() => isAddingAddress ? setIsAddingAddress(false) : setStep(1)}><ChevronLeft /></button>
                  <h2 className="card-title">Shipping Information</h2>
                </div>

                {!isAddingAddress ? (
                  <div className="address-section">
                    <div className="address-grid">
                      <div className="address-card add-btn" onClick={() => setIsAddingAddress(true)}>
                        <Plus size={32} />
                        <p>Add New Address</p>
                      </div>

                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`address-card ${selectedAddressId === addr._id ? "selected" : ""}`}
                          onClick={() => setSelectedAddressId(addr._id)}
                        >
                          <div className="card-selection-indicator">
                            {selectedAddressId === addr._id && <Check size={14} color="white" />}
                          </div>

                          <div className="addr-header">
                            <strong>{addr.name}</strong>
                            {addr.isDefault && <span className="default-tag">DEFAULT</span>}
                          </div>

                          <div className="addr-body">
                            <p className="addr-line">{addr.street}</p>
                            <p className="addr-location">{addr.city}, {addr.state} - {addr.zip}</p>
                          </div>

                          <div className="addr-footer">
                            <div className="contact-item">
                              <Lock size={12} className="text-slate-400" /> {/* Icon proxy for Phone */}
                              <span>{addr.number}</span>
                            </div>
                            <div className="contact-item">
                              <Shield size={12} className="text-slate-400" /> {/* Icon proxy for Email */}
                              <span>{userEmail}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn-action"
                      onClick={handleContinueToPayment}
                      disabled={!selectedAddressId}
                    >
                      Deliver to this Address
                    </button>
                  </div>
                ) : (
                  <form className="modern-form animate-up" onSubmit={handleContinueToPayment}>
                    <div className="input-row">
                      <div className="input-group">
                        <label>Full Name*</label>
                        <input
                          type="text"
                          value={newAddr.fullName} // PERSIST DATA
                          onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Email Address*</label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label>Phone Number*</label>
                        <input
                          type="tel"
                          value={newAddr.phone} // PERSIST DATA
                          onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Street Address*</label>
                        <input
                          type="text"
                          value={newAddr.addressLine} // PERSIST DATA
                          onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-row triplet">
                      <div className="input-group">
                        <label>Pincode*</label>
                        <input
                          type="text"
                          maxLength="6"
                          value={newAddr.pincode}
                          onChange={handlePincodeChange}
                          required
                          placeholder="6 Digit PIN"
                        />
                      </div>
                      <div className="input-group">
                        <label>City*</label>
                        <input
                          type="text"
                          value={newAddr.city}
                          onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} // Allow manual edit if needed
                          required
                          className={!newAddr.city ? "input-pending" : ""}
                          placeholder="City"
                        />
                      </div>
                      <div className="input-group">
                        <label>State*</label>
                        <input
                          type="text"
                          value={newAddr.state}
                          onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} // Allow manual edit
                          required
                          className={!newAddr.state ? "input-pending" : ""}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-action">Proceed to Payment</button>
                  </form>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="card-glass animate-up payment-card">
                <div className="header-with-back">
                  <button
                    className="back-btn-circle"
                    onClick={() => setStep(2)}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="header-text">
                    <h2 className="card-title">{"Finalize Payment"}</h2>
                    <p className="card-subtitle">
                      {"Secure transaction via Razorpay"}
                    </p>
                  </div>
                </div>

                <div className="payment-selection-box">
                  <div className="payment-method-item active">
                    <div className="method-info">
                      <div className="method-logo-wrap">
                        {/* Standard Image with better fallback */}
                        <Image
                          src="https://badges.razorpay.com/badge-dark.png"
                          alt="Razorpay Secure"
                          width={180} // Standard width for this badge
                          height={45} // Standard height for this badge
                          className="rzp-logo"
                          unoptimized={true} // Ensures the external badge renders without Next.js proxy issues
                        />
                      </div>
                      <div className="method-text">
                        <span className="method-label">
                          {"OFFICIAL PARTNER"}
                        </span>
                        <strong className="method-name">
                          {"Razorpay Secure"}
                        </strong>
                        <p className="method-desc">
                          {"UPI, Cards, Netbanking & Wallets"}
                        </p>
                      </div>
                    </div>
                    <div className="method-check-glow">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                </div>

                <div className="payment-hero-footer">
                  <div className="trust-pills-modern">
                    <div className="trust-pill">
                      <Shield size={14} className="icon-gold" />
                      <span>{"AES-256 Bit Encryption"}</span>
                    </div>
                    <div className="trust-pill">
                      <Truck size={14} className="icon-blue" />
                      <span>{"Express Insured Shipping"}</span>
                    </div>
                  </div>

                  <p className="payment-notice">
                    {"By proceeding, you agree to the "}
                    <span className="link-text">{"Terms of Service"}</span>
                  </p>
                </div>

                <button
                  className="btn-action pay-button-luxury"
                  onClick={handleRazorpay}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="spin" />
                  ) : (
                    <div className="btn-content-flex">
                      <Lock size={18} />
                      <span>{`Pay Securely ₹${cartTotal}`}</span>
                      <ChevronRight size={18} className="arrow-hide" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar logic */}

          <aside className="summary-sidebar">
            <div className="sidebar-sticky animate-up">
              <h3 className="sidebar-header">Order Summary</h3>

              {/* MINI PRODUCT LIST */}
              <div className="mini-products">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="mini-item">
                    <div className="thumb">
                      <Image
                        src={item.variants?.[0]?.images?.[0] || item.image}
                        width={60}
                        height={60}
                        alt={item.title}
                        className="rounded-img"
                      />
                      <span className="qty-badge">{item.quantity}</span>
                    </div>
                    <div className="txt">
                      <p className="item-name">{item.title}</p>
                      <span className="item-variant">{item.color} / {item.capacity}</span>
                    </div>
                    <div className="pr">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              {/* PRICING SECTION */}
              <div className="pricing-box">
                <div className="line">
                  <span>Price (Excl. GST)</span>
                  <span>₹{basePrice}</span>
                </div>

                <div className="line">
                  <span>Estimated GST (18%)</span>
                  <span>₹{gstAmount}</span>
                </div>

                <div className="line">
                  <span>Shipping</span>
                  <span className="green">FREE</span>
                </div>

                <div className="total-divider"></div>

                <div className="line total">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
                <p className="inclusive-tax-tag">Inclusive of all taxes</p>
              </div>

              {/* DYNAMIC DELIVERY INFO */}
              <div className="delivery-status-box">
                {sidebarLoading ? (
                  <div className="sidebar-loader-internal">
                    <Loader2 className="spin" size={20} color="#ec4899" />
                    <span>Recalculating route...</span>
                  </div>
                ) : !isEditingSidebar ? (
                  <div className="flex-row">
                    <div
                      className="icon-circle"
                      style={{
                        backgroundColor: deliveryContext ? `${deliveryContext.result.color}15` : '#f1f5f9'
                      }}
                    >
                      <Truck
                        size={18}
                        style={{ color: deliveryContext ? deliveryContext.result.color : '#94a3b8' }}
                      />
                    </div>

                    <div className="delivery-info">
                      <p className="delivery-title">
                        {deliveryContext
                          ? `${deliveryContext.result.time} Delivery`
                          : "Delivery Estimate"}
                      </p>

                      <p className="delivery-location">
                        {deliveryContext
                          ? `To ${deliveryContext.pincode} (${deliveryContext.result.city})`
                          : "Set location for speed"}
                      </p>

                      <button
                        className="change-pin-link"
                        onClick={() => {
                          setIsEditingSidebar(true);
                          setSidebarPin(deliveryContext?.pincode || "");
                        }}
                      >
                        {deliveryContext ? "Change Pincode" : "Enter Pincode"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* INLINE EDIT FORM */
                  <form onSubmit={handleSidebarPinUpdate} className="sidebar-pin-form animate-in">
                    <div className="input-wrap">
                      <MapPin size={14} className="pin-icon" />
                      <input
                        autoFocus
                        type="text"
                        maxLength={6}
                        value={sidebarPin}
                        onChange={(e) => setSidebarPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="Pincode"
                      />
                    </div>
                    <div className="form-btns">
                      <button type="submit" className="confirm-tick">
                        <Check size={18} color="#22c55e" />
                      </button>
                      <button type="button" className="cancel-x" onClick={() => setIsEditingSidebar(false)}>
                        <X size={18} color="#ef4444" />
                      </button>
                    </div>
                  </form>
                )}

                {/* DYNAMIC ETA BADGE */}
                {deliveryContext && !isEditingSidebar && !sidebarLoading && (
                  <div
                    className="eta-badge animate-up"
                    style={{
                      color: deliveryContext.result.color,
                      borderLeft: `3px solid ${deliveryContext.result.color}`,
                      backgroundColor: `${deliveryContext.result.color}08`
                    }}
                  >
                    {getDeliveryEstimate()}
                  </div>
                )}
              </div>

              {/* TRUST FEATURES */}
              <div className="trust-stack">
                <div className="info-line">
                  <Shield size={14} /> <span>100% Secure Checkout</span>
                </div>
                <div className="info-line">
                  <Truck size={14} /> <span>Fast Dispatch from Noida</span>
                </div>
              </div>

              <div className="urgency-tag">
                🔥 High demand: 4 people looking at these items
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}