"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, FileText, Download, ShieldCheck, MapPin, CreditCard } from "lucide-react";
import AccountSidebar from "@/components/shop/account/AccountSidebar";

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
          headers: { Authorization: `JWT ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setOrder(data.order);
          document.title = `Order Details #BB-${data.order.razorpayOrderId?.replace(/^order_/, "").toUpperCase()} | BouncyBucket`;
        }
      } catch (err) {
        console.error("Error fetching explicit transaction log details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [mounted, id, router]);

  // Handler to stream the dynamic PDF from Render and save it to native user memory
  const downloadInvoiceHandler = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/invoice/${order._id}`, {
        method: "GET",
        headers: { Authorization: `JWT ${token}` },
      });

      if (!res.ok) throw new Error("Invoice streaming pipeline failed.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_BB-${(order.razorpayOrderId || order._id).replace(/^order_/, "").toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not load invoice data. Please contact support.");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex max-w-7xl mx-auto px-4 py-12 gap-8 min-h-[60vh]">
        <AccountSidebar active="orders" />
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 text-sm">Order information record not found.</p>
        <Link href="/account/orders" className="text-xs font-semibold text-slate-900 underline mt-2 inline-block">Back to orders list</Link>
      </div>
    );
  }

  const cleanId = (order.razorpayOrderId || order._id).replace(/^order_/, "").toUpperCase();
  const basePrice = order.totalAmount / 1.18;
  const totalGst = order.totalAmount - basePrice;

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-10 gap-8 min-h-[70vh]">
      <AccountSidebar active="orders" />

      <div className="flex-1">
        {/* Navigation Breadcrumb Context */}
        <Link href="/account/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-6">
          <ChevronLeft size={14} /> Back to My Orders
        </Link>

        {/* Dynamic Context Headers Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 font-mono tracking-tight">Order #BB-{cleanId}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                {order.paymentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")} at {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <button
            onClick={downloadInvoiceHandler}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition shadow-sm"
          >
            {downloading ? (
              <>Generating...</>
            ) : (
              <>
                <FileText size={14} /> Download Tax Invoice <Download size={14} />
              </>
            )}
          </button>
        </header>

        {/* 2-Column Split Details Architecture */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Items Card Frame (Left 2-Span Block) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  Ordered Collection Items
                </h3>
              </div>
              <div className="p-5 divide-y divide-slate-100">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                    <div className="relative w-16 h-16 border border-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.thumbnail || "/placeholder.jpg"}
                        alt={item.title || "Product item"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Size: {item.capacity || "Standard"} &bull; Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Structured Cost Valuation Ledger Grid Summary */}
            <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Taxable Base Value</span>
                <span>₹{basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Goods & Services Tax (GST 18% Inc.)</span>
                <span>₹{totalGst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Shipping & Handling Fees</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-bold text-slate-900">
                <span>Total Amount Paid</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Sidebar Metadata Block columns (Right 1-Span Block) */}
          <div className="space-y-6">
            {/* Logistics Node */}
            <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-500" /> Delivery Target Address
              </h3>
              <div className="text-sm text-slate-800 space-y-1 font-medium">
                <p className="font-bold text-slate-900">{order.shippingAddress?.name}</p>
                <p className="text-slate-600 line-clamp-3">{order.shippingAddress?.street}</p>
                <p className="text-slate-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}</p>
                <p className="text-slate-500 text-xs mt-2">Contact Link: +91 {order.shippingAddress?.number}</p>
              </div>
            </div>

            {/* Financial Status Ledger Card */}
            <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCard size={14} className="text-slate-500" /> Payment Architecture
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Gateway Provider:</span>
                  <span className="font-semibold text-slate-800">Razorpay API Layer</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Settlement Status:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <ShieldCheck size={12} /> Cryptographic Success
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}