"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import AccountSidebar from "@/app/components/AccountSidebar";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders`, {
                    headers: { "Authorization": `JWT ${localStorage.getItem("token")}` }
                });
                const data = await res.json();
                if (data.success) setOrders(data.orders);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case "Paid": return "status-paid";
            case "Pending": return "status-pending";
            case "Failed": return "status-failed";
            default: return "";
        }
    };

    if (loading) return <div className="loader-container">Loading your orders...</div>;

    return (
        <div className="profile-container">
            <AccountSidebar/>

            <div className="container">
                <header className="orders-header">
                    <h1>My Orders</h1>
                    <p>Track, manage and review your previous purchases.</p>
                </header>

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <Package size={48} strokeWidth={1} />
                        <h3>No orders yet</h3>
                        <p>When you buy something, it will appear here.</p>
                        <Link href="/" className="btn-black">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-meta">
                                        <div className="meta-col">
                                            <span>ORDER PLACED</span>
                                            <strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                                        </div>
                                        <div className="meta-col">
                                            <span>TOTAL</span>
                                            <strong>₹{order.totalAmount}</strong>
                                        </div>
                                        <div className="meta-col desktop-only">
                                            <span>SHIP TO</span>
                                            <strong>{order.shippingAddress.name}</strong>
                                        </div>
                                    </div>
                                    <div className="order-id-status">
                                        <span className="order-id-label">ID: #{order.razorpayOrderId.split('_')[1]}</span>
                                        <span className={`status-badge ${getStatusStyle(order.paymentStatus)}`}>
                                            {order.paymentStatus === 'Paid' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item-row">
                                                <div className="item-thumb">
                                                    {/* If your item object has an image, use it, else fallback */}
                                                    <img src={item.variants?.[0]?.images?.[0] || item.image || "/placeholder.jpg"} alt="" />
                                                </div>
                                                <div className="item-details">
                                                    <h4>{item.title}</h4>
                                                    <p>{item.color} | {item.capacity} | Qty: {item.quantity}</p>
                                                    <span className="item-price-tag">₹{item.price}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-actions">
                                        <button className="btn-outline-sm">Track Order</button>
                                        <Link href={`/account/orders/${order._id}`} className="btn-outline-sm">
                                            Order Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}