"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import Script from "next/script";
import Link from "next/link";
import {
    Check, MapPin, CreditCard, ShoppingBag, Plus,
    Trash2, ChevronLeft, ChevronRight, Loader2, Shield
} from "lucide-react";

export default function CheckoutPage() {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const [step, setStep] = useState(1); // 1: Bag, 2: Address, 3: Payment
    const [loading, setLoading] = useState(false);

    // Address Management
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddr, setNewAddr] = useState({ fullName: "", phone: "", addressLine: "", city: "", pincode: "", state: "" });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
                headers: { "Authorization": `JWT ${localStorage.getItem("token")}` }
            });
            const data = await res.json();

            // Correct the mapping here based on your Profile Page logic
            const userAddresses = data.user?.addresses || [];

            if (userAddresses.length > 0) {
                setSavedAddresses(userAddresses);
                setSelectedAddressId(userAddresses[0]._id);
            }
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
        }
    };

    const handleAddNewAddress = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name: newAddr.fullName,
            number: newAddr.phone,
            street: newAddr.addressLine,
            city: newAddr.city,
            zip: newAddr.pincode,
            state: newAddr.state
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-address`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `JWT ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            console.log("Server Response:", result); // FIX: Use 'result', not 'data'

            if (res.ok) {
                await fetchAddresses(); // Refresh the list
                setIsAddingAddress(false); // Go back to selection
            } else {
                alert(result.message || "Failed to save address");
            }
        } catch (err) {
            console.error("Error saving address:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpay = async () => {
        setLoading(true);
        const address = savedAddresses.find(a => a._id === selectedAddressId);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `JWT ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ items: cartItems, address })
            });
            const orderData = await res.json();

            const options = {
                key: "rzp_test_Ryaep6Nvd3HagI",
                amount: orderData.amount,
                currency: "INR",
                name: "BottleShop",
                order_id: orderData.orderId,
                handler: async (resp) => {
                    const vRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/verify`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `JWT ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify(resp),
                    });

                    const data = await vRes.json();
                    console.log("VERIFY RESPONSE:", data);

                    if (vRes.ok) {
                        clearCart()
                        window.location.href = "/success";
                    } 
                },
                theme: { color: "#000000" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (cartItems.length === 0) return <div className="empty-checkout"><h2>Your bag is empty</h2><Link href="/">Shop Now</Link></div>;

    return (
        <div className="modern-checkout">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Header / Stepper */}
            <header className="checkout-header">
                <div className="container stepper-flex">
                    <div className={`step-chip ${step >= 1 ? 'active' : ''}`}>Review Bag</div>
                    <div className="step-sep"></div>
                    <div className={`step-chip ${step >= 2 ? 'active' : ''}`}>Shipping</div>
                    <div className="step-sep"></div>
                    <div className={`step-chip ${step >= 3 ? 'active' : ''}`}>Payment</div>
                </div>
            </header>

            <main className="container checkout-grid">
                <div className="checkout-main">

                    {/* STEP 1: BAG */}
                    {step === 1 && (
                        <div className="view-card animate-slide-in">
                            <h2 className="view-title">Bag Summary</h2>
                            <div className="bag-list">
                                {cartItems.map((item, i) => (
                                    <div key={i} className="bag-row">
                                        <div className="bag-img-box">
                                            <img src={item.variants[0].images[0]} alt="" />
                                        </div>
                                        <div className="bag-info">
                                            <h4>{item.title}</h4>
                                            <p>{item.color} • {item.capacity}</p>
                                            <div className="qty-pills">
                                                <button onClick={() => updateQuantity(i, -1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(i, 1)}>+</button>
                                            </div>
                                        </div>
                                        <div className="bag-price">
                                            ₹{item.price * item.quantity}
                                            <button onClick={() => removeFromCart(i)} className="trash-btn"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-black-full" onClick={() => setStep(2)}>Continue to Shipping <ChevronRight size={18} /></button>
                        </div>
                    )}

                    {/* STEP 2: ADDRESS */}
                    {/* STEP 2: ADDRESS */}
                    {/* STEP 2: ADDRESS */}
                    {step === 2 && (
                        <div className="view-card animate-slide-in">
                            <div className="view-header-flex">
                                <button className="btn-icon" onClick={() => isAddingAddress ? setIsAddingAddress(false) : setStep(1)}>
                                    <ChevronLeft />
                                </button>
                                <h2 className="view-title">
                                    {isAddingAddress ? "Add New Address" : "Shipping Address"}
                                </h2>
                            </div>

                            {!isAddingAddress ? (
                                /* --- ADDRESS LIST VIEW --- */
                                <div className="address-grid">
                                    <button className="add-address-card" onClick={() => setIsAddingAddress(true)}>
                                        <span className="plus-icon">+</span>
                                        <span>Add New Address</span>
                                    </button>

                                    {loading ? (
                                        <div className="loader">Loading addresses...</div>
                                    ) : (
                                        savedAddresses.map((addr, index) => (
                                            <div
                                                key={addr._id}
                                                className={`address-card ${selectedAddressId === addr._id ? 'selected' : ''}`}
                                                onClick={() => setSelectedAddressId(addr._id)}
                                            >
                                                <div className="selection-indicator">
                                                    {selectedAddressId === addr._id && <Check size={12} strokeWidth={3} />}
                                                </div>
                                                <div className="address-details">
                                                    <p className="address-name"><strong>{addr.name}</strong></p>
                                                    <p className="address-text">{addr.street}, {addr.city}</p>
                                                    <p className="address-text">{addr.state} - {addr.zip}</p>
                                                    <p className="address-phone">Phone: {addr.number}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    <button
                                        className="btn-black-full"
                                        disabled={!selectedAddressId}
                                        onClick={() => setStep(3)}
                                        style={{ marginTop: '20px' }}
                                    >
                                        Continue to Payment <ChevronRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                /* --- ADD NEW ADDRESS FORM VIEW --- */
                                <form className="modern-addr-form fade-in" onSubmit={handleAddNewAddress}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" placeholder="e.g. Mohit Sharma" required
                                            onChange={e => setNewAddr({ ...newAddr, fullName: e.target.value })} />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" placeholder="10-digit mobile number" required
                                            onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} />
                                    </div>

                                    <div className="form-group">
                                        <label>Street Address</label>
                                        <textarea placeholder="Flat, House no., Building, Company, Apartment" required
                                            onChange={e => setNewAddr({ ...newAddr, addressLine: e.target.value })} />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City</label>
                                            <input type="text" placeholder="City" required
                                                onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Pincode</label>
                                            <input type="text" placeholder="6-digit PIN" required
                                                onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>State</label>
                                        <input type="text" placeholder="State" required
                                            onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} />
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setIsAddingAddress(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-black-sm">
                                            Save & Use Address
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* STEP 3: PAYMENT */}
                    {step === 3 && (
                        <div className="view-card animate-slide-in">
                            <div className="view-header-flex">
                                <button className="btn-icon" onClick={() => setStep(2)}><ChevronLeft /></button>
                                <h2 className="view-title">Review & Pay</h2>
                            </div>
                            <div className="payment-summary">
                                <div className="ps-row"><span>Order Value</span><span>₹{cartTotal}</span></div>
                                <div className="ps-row"><span>Shipping</span><span className="success-text">FREE</span></div>
                                <div className="ps-row grand-total"><span>Amount to Pay</span><span>₹{cartTotal}</span></div>
                            </div>
                            <div className="security-badge">
                                <Shield size={16} /> Secure encrypted payment via Razorpay
                            </div>
                            <button className="btn-black-full" onClick={handleRazorpay} disabled={loading}>
                                {loading ? <Loader2 className="spinner" /> : `Pay ₹${cartTotal}`}
                            </button>
                        </div>
                    )}
                </div>

                <aside className="checkout-sidebar">
                    <div className="sticky-box">
                        <h3>Summary</h3>
                        <div className="side-row"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                        <div className="side-row"><span>Shipping</span><span>Free</span></div>
                        <hr />
                        <div className="side-row total"><span>Total</span><span>₹{cartTotal}</span></div>
                    </div>
                </aside>
            </main>
        </div>
    );
}