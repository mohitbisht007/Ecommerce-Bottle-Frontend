"use client";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import Image from "next/image"; // Changed: Use Next.js Image
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function CartSidebar() {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
    
    const freeShippingThreshold = 500;
    const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
    const amountToFree = freeShippingThreshold - cartTotal;

    return (
        <>
            {/* Overlay */}
            <div 
                className={`cart-overlay ${isCartOpen ? "active" : ""}`} 
                onClick={() => setIsCartOpen(false)} 
            />

            <div 
                className={`cart-drawer ${isCartOpen ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
            >
                {/* 1. Header */}
                <div className="drawer-header">
                    <div className="header-left">
                        <ShoppingBag size={20} />
                        <h3>Your Bag <span className="item-count">({cartItems.length})</span></h3>
                    </div>
                    <button className="close-drawer-btn" onClick={() => setIsCartOpen(false)} aria-label="Close Cart">
                        <X size={24} />
                    </button>
                </div>

                {/* 2. Free Shipping Progress Bar */}
                <div className="shipping-promo">
                    <p className="promo-text">
                        {amountToFree > 0 
                            ? `You're ₹${amountToFree} away from FREE shipping!` 
                            : "Congrats! You've unlocked FREE shipping! 🚚"}
                    </p>
                    <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {/* 3. Items List */}
                <div className="drawer-body">
                    {cartItems.length === 0 ? (
                        <div className="empty-cart-view">
                            <div className="empty-icon">🛒</div>
                            <p>Your bag is feeling light...</p>
                            <button className="btn-shop-now" onClick={() => setIsCartOpen(false)}>Start Shopping</button>
                        </div>
                    ) : (
                        <div className="cart-items-list">
                            {cartItems.map((item, i) => (
                                <div key={`${item._id}-${item.color}-${item.capacity}`} className="cart-item-card">
                                    <div className="cart-item-img">
                                        {/* Updated: Next.js Optimized Image */}
                                        <Image 
                                            src={item.variants?.[0]?.images?.[0] || '/placeholder.png'} 
                                            alt={item.title} 
                                            width={80} 
                                            height={80} 
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="cart-item-info">
                                        <div className="info-top">
                                            <h4 className="line-clamp-1">{item.title}</h4>
                                            <button className="remove-item" onClick={() => removeFromCart(i)} title="Remove item">
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                        <p className="item-meta">{item.color} / {item.capacity}</p>
                                        <div className="info-bottom">
                                            <div className="quantity-ctrl">
                                                <button onClick={() => updateQuantity(i, -1)} disabled={item.quantity <= 1}>
                                                    <Minus size={14}/>
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(i, 1)}>
                                                    <Plus size={14}/>
                                                </button>
                                            </div>
                                            <span className="item-total-price">₹{item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 5. Sticky Footer */}
                {cartItems.length > 0 && (
                    <div className="drawer-footer">
                        <div className="footer-row">
                            <span>Subtotal</span>
                            <span className="total-val">₹{cartTotal}</span>
                        </div>
                        <p className="tax-note">Shipping & taxes calculated at checkout</p>
                        <Link href="/checkout" className="btn-main-checkout" onClick={() => setIsCartOpen(false)}>
                            Checkout Securely <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}