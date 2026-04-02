import React from 'react';

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* HERO */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Built for Everyday Life. <br />
            <span className="text-pink-600">Designed to Stand Out.</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            At <strong className="text-slate-900">Bouncy Bucket</strong>, we create bottles that are not just functional — 
            but personal. Whether you're at the gym, office, or on the move, your bottle should match your lifestyle.
          </p>
        </div>

        {/* STORY */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-2xl font-bold mb-4 text-slate-900">
              Why We Started
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We noticed a gap — most bottles in the market were either boring, low quality, or overpriced. 
              So we decided to build something better: high-quality bottles that look good, feel premium, 
              and are made for daily use.
            </p>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-2xl font-bold mb-4 text-slate-900">
              What Makes Us Different
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We focus on clean design, durable materials, and fast delivery. 
              Every product is carefully checked before dispatch to ensure you receive exactly what you expect.
            </p>
          </div>

        </div>

        {/* PRODUCT QUALITY */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">

          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-slate-900">
              Premium Materials
            </h3>
            <p className="text-slate-600">
              We use high-quality stainless steel and durable glass to ensure long-lasting performance. 
              Our bottles are designed to be safe, reusable, and environmentally responsible.
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-slate-900">
              Quality First
            </h3>
            <p className="text-slate-600">
              Each order goes through a strict quality check before shipping. 
              We don’t compromise on what reaches you — because your experience matters.
            </p>
          </div>

        </div>

        {/* TRUST SECTION */}
        <div className="bg-slate-900 text-white rounded-3xl p-12 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Built on Trust & Transparency
          </h3>

          <p className="text-slate-300 max-w-2xl mx-auto mb-6">
            Bouncy Bucket is owned and operated by <strong>Prakash Chander (Keen Services)</strong>, 
            based in Noida, India. We are committed to providing a reliable and transparent shopping experience.
          </p>

          <p className="text-sm text-slate-400">
            From secure payments to fast shipping and responsive support — we’ve got you covered.
          </p>
        </div>

      </div>
    </div>
  );
}