import React from 'react';
import { Timer, Truck, Globe } from 'lucide-react';

export default function ShippingPage() {
  const deliveryTiers = [
    {
      title: "Express Delivery",
      desc: "Available in select Delhi/NCR areas. Orders are delivered within a few hours depending on availability and distance.",
      icon: <Timer />,
      color: "text-pink-600"
    },
    {
      title: "Same Day Dispatch",
      desc: "Orders placed before 2:00 PM are processed and dispatched on the same day (excluding Sundays and holidays).",
      icon: <Truck />,
      color: "text-blue-600"
    },
    {
      title: "Pan India Shipping",
      desc: "Delivery across India typically takes 2–5 business days depending on your location.",
      icon: <Globe />,
      color: "text-slate-600"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">

        <h2 className="text-4xl font-black text-slate-900 mb-4">
          Shipping Policy
        </h2>

        <p className="text-slate-500 mb-16 uppercase tracking-widest font-bold text-sm">
          Fast. Reliable. Transparent.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {deliveryTiers.map((tier, index) => (
            <div key={index} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
              <div className={`mb-6 flex justify-center ${tier.color}`}>
                {tier.icon}
              </div>
              <h4 className="text-xl font-bold mb-3">{tier.title}</h4>
              <p className="text-slate-500 text-sm leading-loose">{tier.desc}</p>
            </div>
          ))}
        </div>

        {/* Policy Content */}
        <div className="text-left max-w-3xl mx-auto space-y-10">

          {/* Processing */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              1. Order Processing
            </h4>
            <p className="text-slate-600">
              Orders are processed within 24 hours of placement.
            </p>
          </div>

          {/* Shipping Charges */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              2. Shipping Charges
            </h4>
            <p className="text-slate-600">
              Shipping charges (if applicable) are calculated at checkout based on your location and order value. We may offer free shipping on selected orders or promotions.
            </p>
          </div>

          {/* Tracking */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              3. Order Tracking
            </h4>
            <p className="text-slate-600">
              Once your order is shipped, you will receive a tracking link via SMS or email to monitor delivery status in real time.
            </p>
          </div>

          {/* Delays */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              4. Delivery Delays
            </h4>
            <p className="text-slate-600">
              While we aim for timely delivery, delays may occur due to unforeseen factors such as weather conditions, logistics issues, or high demand periods. We are not liable for delays caused by third-party courier services.
            </p>
          </div>

          {/* Incorrect Address */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              5. Incorrect Address
            </h4>
            <p className="text-slate-600">
              Customers are responsible for providing accurate shipping details. We are not liable for failed deliveries due to incorrect or incomplete addresses. Re-delivery may incur additional charges.
            </p>
          </div>

          {/* Lost */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              6. Lost or Stolen Packages
            </h4>
            <p className="text-slate-600">
              Once the package is marked as delivered by the courier, we are not responsible for lost or stolen packages. Customers are advised to ensure someone is available to receive the order.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              7. Contact for Shipping Issues
            </h4>
            <p className="text-slate-600">
              For any shipping-related queries, contact us at: <br />
              <strong>sales@bouncybucket.com</strong>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}