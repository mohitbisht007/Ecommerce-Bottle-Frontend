import React from 'react';

export default function ReturnsPage() {
  return (
    <div className="bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        
        <h2 className="text-3xl font-bold text-slate-900 mb-10 border-b pb-6">
          Returns, Refunds & Cancellation Policy
        </h2>

        <section className="space-y-12">

          {/* Cancellation */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">
              1. Order Cancellation
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Orders can be cancelled within <strong>30 minutes</strong> of placement. 
              After this period, orders are processed immediately and cannot be cancelled.
            </p>
          </div>

          {/* Non-returnable */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">
              2. Non-Returnable Items
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Due to hygiene and product nature, bottles once delivered cannot be returned 
              unless they are damaged, defective, or incorrect. 
              Customized or personalized products are strictly non-returnable.
            </p>
          </div>

          {/* Damages */}
          <div className="p-8 bg-pink-50 rounded-2xl border border-pink-100">
            <h4 className="text-lg font-bold text-pink-900 mb-3">
              3. Damaged / Defective Products
            </h4>
            <p className="text-pink-800 leading-relaxed text-sm">
              If you receive a damaged or defective item, you must notify us within 
              <strong> 24 hours</strong> of delivery. 
              Please share clear images or an <strong>unboxing video</strong> for verification. 
              Once approved, a replacement will be issued at no additional cost.
            </p>
          </div>

          {/* Refunds */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">
              4. Refund Policy
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Refunds are processed only for approved cases such as damaged, defective, 
              or undelivered items. Once approved, the refund will be credited to the 
              original payment method within <strong>5–7 business days</strong>.
            </p>
          </div>

          {/* COD */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">
              5. Cash on Delivery (COD)
            </h4>
            <p className="text-slate-600 leading-relaxed">
              For COD orders, refunds (if applicable) will be processed via bank transfer 
              or store credit after verification. Customers may be required to provide 
              valid bank details.
            </p>
          </div>

          {/* Shipping issues */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">
              6. Delivery Issues
            </h4>
            <p className="text-slate-600 leading-relaxed">
              In case of failed delivery due to incorrect address or unavailability, 
              re-shipping charges may apply. We are not responsible for delays caused 
              by courier partners or unforeseen circumstances.
            </p>
          </div>

          {/* Abuse */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">
              7. Policy Misuse
            </h4>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to reject returns or refunds if fraudulent activity 
              or misuse of policy is detected.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">
              8. Contact for Support
            </h4>
            <p className="text-slate-600 leading-relaxed">
              For any return or refund requests, contact us at: <br />
              <strong>sales@bouncybucket.com</strong>
            </p>
          </div>

        </section>
      </div>
    </div>
  );
}