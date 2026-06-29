"use client";

import Link from "next/link";
import {
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-10 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-120px] left-[-80px] w-[300px] h-[300px] bg-emerald-200/30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[-120px] right-[-80px] w-[300px] h-[300px] bg-cyan-200/30 blur-3xl rounded-full"></div>
      </div>

      <section className="relative w-full max-w-2xl">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_20px_80px_rgba(15,23,42,0.08)] rounded-[32px] overflow-hidden">

          {/* Top Success Header */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 sm:px-10 pt-12 pb-20 text-center">
            
            <div className="absolute top-6 right-6 bg-white/15 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-xs font-medium">
              <Sparkles size={14} />
              PAYMENT VERIFIED
            </div>

            <div className="mx-auto w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl border-[6px] border-emerald-100">
              <CheckCircle2
                size={52}
                className="text-emerald-600"
                strokeWidth={2.5}
              />
            </div>

            <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Order Confirmed
            </h1>

            <p className="mt-4 text-emerald-50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Your payment has been successfully processed and your order is now being prepared for dispatch.
            </p>
          </div>

          {/* Main Content */}
          <div className="px-5 sm:px-10 pb-8 -mt-10 relative z-10">

            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-5 sm:p-6">

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <PackageCheck className="text-emerald-600" size={28} />
                </div>

                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Preparing Your Shipment
                  </h2>

                  <p className="text-slate-500 mt-1 text-sm sm:text-base leading-relaxed">
                    Our team has received your order and will dispatch it within the next 24 hours.
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-8">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-3">
                  <span>Order Placed</span>
                  <span>Processing</span>
                  <span>Shipping Soon</span>
                </div>

                <div className="relative w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-[45%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"></div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <Truck size={20} className="text-slate-700 mb-3" />
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Fast Dispatch
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Orders usually ship within 24 hours.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <ShieldCheck size={20} className="text-slate-700 mb-3" />
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Secure Payment
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Transaction completed with Razorpay security.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <ShoppingBag size={20} className="text-slate-700 mb-3" />
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Premium Packaging
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Carefully packed for safe delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">

              <Link
                href="/account/orders"
                className="flex-1 h-14 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium text-slate-900"
              >
                View My Orders
              </Link>

              <Link
                href="/"
                className="flex-1 h-14 rounded-2xl bg-black hover:bg-slate-800 transition-all duration-300 text-white flex items-center justify-center gap-2 font-medium shadow-lg shadow-black/10"
              >
                Continue Shopping
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Need help? Contact us anytime at{" "}
                <span className="font-medium text-slate-600">
                  sales@bouncybucket.com
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}