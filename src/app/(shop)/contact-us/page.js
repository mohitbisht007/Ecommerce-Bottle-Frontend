import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-slate-50 py-24 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">

        {/* LEFT - CONTACT INFO */}
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
            Get in Touch
          </h2>

          <p className="text-slate-600 mb-6">
            Need help with your order or have a question? 
            Our team usually responds within <span className="font-semibold">24 hours</span>.
          </p>

          <p className="text-slate-500 mb-10 text-sm">
            Legal Entity: <strong>Prakash Chander (Keen Services)</strong>
          </p>

          <div className="space-y-8">

            <div className="flex items-start gap-4">
              <MapPin className="text-pink-600 mt-1" />
              <div>
                <p className="font-bold text-slate-900">Registered Office</p>
                <p className="text-slate-600 text-sm">
                  Cabin No. 8, B-135, Sector-2, Noida, Uttar Pradesh, 201301
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="text-pink-600" />
              <div>
                <p className="font-bold text-slate-900">Email</p>
                <p className="text-slate-600 text-sm">
                  support@bouncybucket.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-pink-600" />
              <div>
                <p className="font-bold text-slate-900">Phone</p>
                <p className="text-slate-600 text-sm">
                  +91 9876543210
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Clock className="text-pink-600" />
              <div>
                <p className="font-bold text-slate-900">Working Hours</p>
                <p className="text-slate-600 text-sm">
                  Mon - Sat: 10:00 AM – 7:00 PM
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT - FORM CARD */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200">

          <h4 className="text-xl font-bold text-slate-900 mb-2">
            Send a Message
          </h4>

          <p className="text-slate-500 text-sm mb-6">
            Fill the form and we’ll get back to you shortly.
          </p>

          <input
            className="w-full border border-slate-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Full Name"
          />

          <input
            type="email"
            className="w-full border border-slate-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Email Address"
          />

          <input
            type="tel"
            className="w-full border border-slate-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Phone Number (Optional)"
          />

          <select
            className="w-full border border-slate-200 rounded-xl p-4 mb-4 text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option>Select Subject</option>
            <option>Order Issue</option>
            <option>Shipping Query</option>
            <option>Return / Refund</option>
            <option>Product Inquiry</option>
            <option>Other</option>
          </select>

          <textarea
            className="w-full border border-slate-200 rounded-xl p-4 mb-6 h-32 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Write your message..."
          ></textarea>

          <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold transition">
            SEND MESSAGE
          </button>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Your information is safe with us.
          </p>
        </div>

      </div>
    </div>
  );
}