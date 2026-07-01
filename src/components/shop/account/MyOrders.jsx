"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, ArrowRight, CheckCircle2, AlertCircle, Clock, FileText } from "lucide-react";
import AccountSidebar from "@/components/shop/account/AccountSidebar";

export default function MyOrders() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    document.title = "My Orders | BouncyBucket";
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders`, {
          headers: { Authorization: `JWT ${token}` },
        });

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return { style: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} /> };
      case "Failed":
        return { style: "bg-rose-50 text-rose-700 border-rose-200", icon: <AlertCircle size={14} /> };
      default:
        return { style: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={14} /> };
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex max-w-7xl mx-auto px-4 py-12 gap-8 min-h-[60vh]">
        <AccountSidebar active="orders" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Fetching your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-10 gap-8 min-h-[70vh]">
      <AccountSidebar active="orders" />

      <div className="flex-1">
        <header className="mb-8 border-b border-slate-100 pb-5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Track details, verify statuses, and manage your premium collection history.</p>
        </header>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="p-4 bg-white rounded-full shadow-sm text-slate-400 mb-4">
              <Package size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No purchase history found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs mb-5">When you place an order, your transaction assets will appear safely here.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
              Explore Shop <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const badge = getStatusBadge(order.paymentStatus);
              const cleanId = (order.razorpayOrderId || order._id || "").replace(/^order_/, "").toUpperCase();

              return (
                <div key={order._id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                  {/* Card Meta Row Headers */}
                  <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-6 sm:gap-10 text-xs text-slate-500">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">ORDER PLACED</span>
                        <strong className="text-slate-800 font-semibold">{new Date(order.createdAt).toLocaleDateString("en-IN")}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">TOTAL PAID</span>
                        <strong className="text-slate-900 font-bold">₹{order.totalAmount}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-0.5">ORDER ID</span>
                        <strong className="text-slate-800 font-mono font-medium">#BB-{cleanId}</strong>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.style}`}>
                      {badge.icon} {order.paymentStatus}
                    </span>
                  </div>

                  {/* Card Body Core Items Listing loop */}
                  <div className="p-5 divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                        <div className="relative w-16 h-16 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || item.variants?.[0]?.images?.[0] || item.thumbnail || "/placeholder.jpg"}
                            alt={item.title || "Bottle Variant"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {item.colorName || item.color || "Default Edition"} &bull; {item.capacity || "Standard Size"} &bull; Qty: {item.quantity}
                          </p>
                        </div>
                        
                        <div className="text-sm font-bold text-slate-900 text-right flex-shrink-0">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Operational Footer Actions Block */}
                  <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                    <Link href={`/account/orders/${order._id}`} className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-800 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 transition">
                      Manage Order Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}