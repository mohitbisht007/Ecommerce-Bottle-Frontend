"use client";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";

export default function SuccessPage() {
    return (
        <div className="success-screen">
            <div className="success-card animate-pop-in">
                <div className="icon-badge">
                    <CheckCircle size={60} color="#10b981" />
                </div>
                <h1>Order Placed Successfully!</h1>
                <p>Thank you for your purchase. Your order has been confirmed and will be shipped within 24 hours.</p>
                
                <div className="order-info-box">
                    <div className="info-row">
                        <Package size={18} />
                        <span>Order status: <strong>Preparing to ship</strong></span>
                    </div>
                </div>

                <div className="success-footer-btns">
                    <Link href="/account/orders" className="btn-secondary-outline">
                        View My Orders
                    </Link>
                    <Link href="/" className="btn-black-flex">
                        Continue Shopping <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}