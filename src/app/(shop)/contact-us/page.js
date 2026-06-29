"use client";

import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useState } from "react";
import PageLoader from '@/components/ui/PageLoader';

export default function ContactPage() {

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      console.log(process.env.NEXT_PUBLIC_API_URL);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setSubmitted(true);

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

    } catch (err) {
      console.error(err);

      alert(
        err.message || "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {loading && <PageLoader />}
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
              Legal Entity: <strong>Tarun Chander (Bouncy Bucket)</strong>
            </p>

            <div className="space-y-8">

              <div className="flex items-start gap-4">
                <MapPin className="text-pink-600 mt-1" />
                <div>
                  <p className="font-bold text-slate-900">Registered Office</p>
                  <p className="text-slate-600 text-sm">
                    📍 UGF, Flat No. 2, Plot E-4, Hanuman Vihar, Barola, Noida, UP, 201301
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="text-pink-600" />
                <div>
                  <p className="font-bold text-slate-900">Email</p>
                  <p className="text-slate-600 text-sm">
                    sales@bouncybucket.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="text-pink-600" />
                <div>
                  <p className="font-bold text-slate-900">Phone</p>
                  <p className="text-slate-600 text-sm">
                    +91 7303189499
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
          {submitted ? (

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center animate-fade-in">

              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>

              </div>

              <h2 className="text-3xl font-bold text-slate-900 mt-8">

                Message Sent Successfully

              </h2>

              <p className="text-slate-600 mt-4 leading-7">

                Thank you for contacting
                <strong> BouncyBucket.</strong>

                <br /><br />

                We've successfully received your enquiry.

                <br />

                A confirmation email has also been sent to your inbox.

                <br /><br />

                Our support team will get back to you
                within 24 business hours.

              </p>

              <button
                onClick={() => setSubmitted(false)}
                className="mt-10 w-full bg-black hover:bg-slate-800 text-white rounded-xl py-4 font-semibold transition"
              >
                Send Another Message
              </button>

            </div>

          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200"
            >

              <h4 className="text-xl font-bold text-slate-900 mb-2">
                Send a Message
              </h4>

              <p className="text-slate-500 text-sm mb-6">
                Fill the form and we'll get back to you shortly.
              </p>

              {/* Full Name */}

              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Full Name"
              />

              {/* Email */}

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Email Address"
              />

              {/* Phone */}

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Phone Number (Optional)"
              />

              {/* Subject */}

              <select
                required
                value={form.subject}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subject: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-4 mb-4 text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Subject</option>

                <option value="Order Issue">
                  Order Issue
                </option>

                <option value="Shipping Query">
                  Shipping Query
                </option>

                <option value="Return / Refund">
                  Return / Refund
                </option>

                <option value="Product Inquiry">
                  Product Inquiry
                </option>

                <option value="Bulk Order">
                  Bulk Order
                </option>

                <option value="Customization">
                  Customization
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

              {/* Message */}

              <textarea
                required
                value={form.message}
                onChange={(e) =>
                  setForm({
                    ...form,
                    message: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-xl p-4 mb-6 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Write your message..."
              />

              {/* Button */}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${loading
                    ? "bg-pink-300 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-700 text-white"
                  }`}
              >
                {loading ? "Sending Message..." : "SEND MESSAGE"}
              </button>

              <p className="text-xs text-slate-400 mt-4 text-center">
                Your information is safe with us.
              </p>

            </form>)
          }
        </div>
      </div> </>

  );
}