import React from 'react';

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-[40px] shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 mb-8 border-b pb-6">
          Terms & Conditions
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">

          {/* 1 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">1. Legal Entity</h4>
            <p className="text-slate-600">
              This website is operated by <strong>Bouncy Bucket</strong>. 
              Throughout the site, the terms “we”, “us” and “our” refer to Bouncy Bucket. 
              By accessing or purchasing from our store, you agree to be bound by these Terms & Conditions.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">2. Eligibility</h4>
            <p className="text-slate-600">
              By using this website, you confirm that you are at least 18 years old or using the site under supervision of a parent or legal guardian.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">3. Products & Accuracy</h4>
            <p className="text-slate-600">
              We specialize in selling bottles and related accessories. We strive to display accurate product information, 
              but we do not guarantee that product descriptions, images, or pricing are error-free. 
              Colors may vary slightly due to screen differences.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">4. Pricing & Payments</h4>
            <p className="text-slate-600">
              All prices are listed in INR and are subject to change without prior notice. 
              We reserve the right to cancel any order in case of pricing errors. 
              Payments must be made through approved payment methods available on the website.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">5. Orders & Cancellation</h4>
            <p className="text-slate-600">
              We reserve the right to refuse or cancel any order at our discretion. 
              Orders once placed may only be canceled within a limited time frame before dispatch.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">6. Shipping & Delivery</h4>
            <p className="text-slate-600">
              We aim to deliver products within the estimated time; however, delays may occur due to unforeseen circumstances. 
              We are not liable for delays caused by courier services or external factors.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">7. Returns & Refunds</h4>
            <p className="text-slate-600">
              Returns are accepted only for damaged or defective products within 7 days of delivery. 
              The product must be unused and in original packaging. 
              Refunds will be processed after inspection and may take 5–7 business days.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">8. User Responsibilities</h4>
            <p className="text-slate-600">
              You agree not to misuse the website, attempt unauthorized access, or engage in fraudulent activities. 
              Any violation may result in termination of access.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">9. Intellectual Property</h4>
            <p className="text-slate-600">
              All content on this website including logos, images, and text is the property of Bouncy Bucket 
              and may not be used without permission.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">10. Limitation of Liability</h4>
            <p className="text-slate-600">
              We shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our products or website.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">11. Privacy Policy</h4>
            <p className="text-slate-600">
              Your use of this website is also governed by our Privacy Policy. 
              We ensure reasonable protection of your personal data.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">12. Changes to Terms</h4>
            <p className="text-slate-600">
              We reserve the right to update or modify these Terms at any time without prior notice. 
              Continued use of the website constitutes acceptance of those changes.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">13. Governing Law</h4>
            <p className="text-slate-600">
              These Terms shall be governed by the laws of India. 
              Any disputes shall fall under the jurisdiction of Delhi.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h4 className="text-lg font-bold text-slate-900 mb-2">14. Contact Information</h4>
            <p className="text-slate-600">
              For any questions regarding these Terms, you can contact us at: 
              <br />
              Email: sales@bouncybucket.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}