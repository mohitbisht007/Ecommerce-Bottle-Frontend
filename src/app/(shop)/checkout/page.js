"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import {
  Check,
  ShoppingBag,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  Lock,
  Truck,
  CreditCard,
} from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [newAddr, setNewAddr] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
    state: "",
  });

  useEffect(() => {
    document.title = "Checkout | BouncyBucket";
    const token = localStorage.getItem("token");
    if (!token) {
      setShowEmailModal(true); // Open the identification popup
    }
  }, []);

  const handleIdentify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout/check-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput }),
        }
      );
      const data = await res.json();

      setEmailInput(emailInput); // Set the global email state
      setIsAddingAddress(!data.exists); // If doesn't exist, show form
      if (data.exists) {
        setSavedAddresses(data.addresses);
        setSelectedAddressId(data.addresses[0]?._id);
      }
      setShowEmailModal(false); // Close popup and enter Step 2
    } catch (err) {
      console.error("Identification failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async (token) => {
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
  };

  const handlePincodeChange = async (e) => {
    const pin = e.target.value;
    setNewAddr({ ...newAddr, pincode: pin });

    if (pin.length === 6) {
      try {
        // Using the reliable India Post API (via api.postalpincode.in)
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();

        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setNewAddr((prev) => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State,
            pincode: pin,
          }));
        }
      } catch (err) {
        console.error("Pincode fetch failed", err);
      }
    }
  };

  // --- FIXED: Function now fully defined ---
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const payload = {
      name: newAddr.fullName,
      number: newAddr.phone,
      street: newAddr.addressLine,
      city: newAddr.city,
      zip: newAddr.pincode,
      state: newAddr.state,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/add-address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        await fetchAddresses(token);
        setIsAddingAddress(false);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to save address");
      }
    } catch (err) {
      alert("An error occurred while saving the address.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const address = savedAddresses.find((a) => a._id === selectedAddressId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({ items: cartItems, address }),
        }
      );
      const orderData = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "BouncyBucket",
        description: "Order Checkout",
        order_id: orderData.orderId,
        handler: async (resp) => {
          const vRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/orders/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${token}`,
              },
              body: JSON.stringify(resp),
            }
          );

          if (vRes.ok) {
            clearCart();
            router.push("/success");
          }
        },
        prefill: { contact: address.number, name: address.name },
        theme: { color: "#000000" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Payment failed", e);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0)
    return (
      <div className="empty-state-checkout">
        <ShoppingBag size={80} strokeWidth={0.5} />
        <h2>{"Your bag is empty"}</h2>
        <p>{"Quality hydration is just a few clicks away."}</p>
        <Link href="/shop" className="btn-primary">
          {"Return to Shop"}
        </Link>
      </div>
    );

  return (
    <div className="checkout-page-root">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="id-modal animate-up">
            {/* 1. TOP CLOSE BUTTON */}
            <button
              className="modal-close-btn"
              onClick={() => setShowEmailModal(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="modal-header">
              <div className="brand-dot"></div>
              <h2>{"Welcome to Checkout"}</h2>
              <p>
                {
                  "Enter your email to retrieve your details or proceed as a guest."
                }
              </p>
            </div>

            <form onSubmit={handleIdentify}>
              <div className="input-group">
                <label>{"Email Address"}</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-action" disabled={loading}>
                {loading ? (
                  <Loader2 className="spin" />
                ) : (
                  "Continue to Shipping"
                )}
              </button>
            </form>

            {/* 2. GUEST REDIRECT OPTION */}
            <div className="modal-alt-action">
              <button
                type="button"
                className="guest-link"
                onClick={() => {
                  setIsAddingAddress(true);
                  setShowEmailModal(false);
                }}
              >
                {"I'll enter my details manually"}
              </button>
            </div>

            <div className="modal-footer">
              <Shield size={14} />
              <span>{"Secure Checkout"}</span>
            </div>
          </div>
        </div>
      )}

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
        <div className="progress-bar-wrap">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`progress-step ${step === num ? "active" : ""} ${
                step > num ? "completed" : ""
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
                  <button
                    onClick={() =>
                      isAddingAddress ? setIsAddingAddress(false) : setStep(1)
                    }
                  >
                    <ChevronLeft />
                  </button>
                  <h2 className="card-title">
                    {isAddingAddress ? "New Address" : "Shipping Details"}
                  </h2>
                </div>

                {!isAddingAddress ? (
                  <div className="address-section">
                    <div className="address-grid">
                      <div
                        className="address-card add-btn"
                        onClick={() => setIsAddingAddress(true)}
                      >
                        <Plus size={32} />
                        <p>{"New Address"}</p>
                      </div>
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`address-card ${
                            selectedAddressId === addr._id ? "selected" : ""
                          }`}
                          onClick={() => setSelectedAddressId(addr._id)}
                        >
                          <div className="radio-circle"></div>
                          <strong>{addr.name}</strong>
                          <p>
                            {addr.street}, {addr.city}, {addr.state}
                          </p>
                          <small>{addr.number}</small>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn-action"
                      onClick={() => setStep(3)}
                      disabled={!selectedAddressId}
                    >
                      {"Continue to Payment"}
                    </button>
                  </div>
                ) : (
                  <form
                    className="modern-form animate-up"
                    onSubmit={handleAddNewAddress}
                  >
                    <div className="form-section-label">Contact Details</div>
                    <div className="input-row">
                      <div className="input-group">
                        <label>Full Name*</label>
                        <input
                          type="text"
                          placeholder="Receiver's name"
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, fullName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Phone Number*</label>
                        <input
                          type="tel"
                          placeholder="10-digit mobile number"
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-section-label">Address Details</div>
                    <div className="input-group">
                      <label>Street Address*</label>
                      <input
                        type="text"
                        placeholder="Flat, House no., Building, Company, Apartment"
                        onChange={(e) =>
                          setNewAddr({
                            ...newAddr,
                            addressLine: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label>Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Apollo Hospital"
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, landmark: e.target.value })
                        }
                      />
                    </div>

                    <div className="input-row triplet">
                      <div className="input-group">
                        <label>Pincode*</label>
                        <input
                          type="text"
                          maxLength="6"
                          placeholder="6-digit PIN"
                          value={newAddr.pincode}
                          onChange={handlePincodeChange}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>City*</label>
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddr.city}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, city: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>State*</label>
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddr.state}
                          onChange={(e) =>
                            setNewAddr({ ...newAddr, state: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-footer-actions">
                      <button
                        type="button"
                        className="btn-secondary-outline"
                        onClick={() => setIsAddingAddress(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-action"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="spin" />
                        ) : (
                          "Save & Deliver Here"
                        )}
                      </button>
                    </div>
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

          <aside className="summary-sidebar">
            <div className="sidebar-sticky">
              <h3>{"Order Summary"}</h3>
              <div className="mini-products">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="mini-item">
                    <div className="thumb">
                      <Image
                        src={item.variants?.[0]?.images?.[0] || item.image}
                        width={50}
                        height={50}
                        alt=""
                      />
                    </div>
                    <div className="txt">
                      <p>{item.title}</p>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <div className="pr">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="pricing">
                <div className="line">
                  <span>{"Subtotal"}</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="line">
                  <span>{"Shipping"}</span>
                  <span className="green">{"FREE"}</span>
                </div>
                <div className="line total">
                  <span>{"Total Amount"}</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>
              <div className="guarantee">
                <Shield size={16} />{" "}
                <p>{"Guaranteed safe & secure checkout"}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
