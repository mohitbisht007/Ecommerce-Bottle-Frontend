"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import AccountSidebar from "@/app/components/AccountSidebar";

export default function MyOrders() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mount + title
  useEffect(() => {
    setMounted(true);
    document.title = "My Orders | BouncyBucket";
  }, []);

  // Fetch orders (CLIENT ONLY)
  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders`,
          {
            headers: { Authorization: `JWT ${token}` },
          }
        );

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) return;

        const data = await res.json();
        if (data?.success) setOrders(data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [mounted]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "status-paid";
      case "Pending":
        return "status-pending";
      case "Failed":
        return "status-failed";
      default:
        return "status-default";
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="profile-container">
        <AccountSidebar active="orders" />
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Fetching your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <AccountSidebar active="orders" />

      <div className="orders-wrapper">
        <header className="orders-header">
          <h1>My Orders</h1>
          <p>Track, manage and review your previous purchases.</p>
        </header>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <Package size={64} strokeWidth={1} />
            <h3>No orders yet</h3>
            <p>When you buy something, it will appear here.</p>
            <Link href="/shop" className="btn-black">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta">
                    <div className="meta-col">
                      <span>ORDER PLACED</span>
                      <strong>
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </strong>
                    </div>
                    <div className="meta-col">
                      <span>TOTAL</span>
                      <strong>₹{order.totalAmount}</strong>
                    </div>
                  </div>

                  <span
                    className={`status-badge ${getStatusStyle(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus === "Paid" ? (
                      <CheckCircle2 size={12} />
                    ) : order.paymentStatus === "Failed" ? (
                      <XCircle size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="order-card-body">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div
                        style={{
                          position: "relative",
                          width: 80,
                          height: 80,
                        }}
                      >
                        <Image
                          src={
                            item.image ||
                            item.variants?.[0]?.images?.[0] ||
                            item.thumbnail ||
                            "/placeholder.jpg"
                          }
                          alt={item.title || "Product"}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover", borderRadius: 8 }}
                        />
                      </div>

                      <div className="item-details">
                        <h4>{item.title}</h4>
                        <p>
                          {item.color || ""} {item.capacity || ""} ×{" "}
                          {item.quantity}
                        </p>
                        <span>₹{item.price}</span>
                      </div>
                    </div>
                  ))}

                  <div className="order-actions">
                    <Link
                      href={`/account/orders/${order._id}`}
                      className="btn-outline-sm"
                    >
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
