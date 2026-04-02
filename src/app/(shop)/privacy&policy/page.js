import React from 'react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Introduction",
      content: "At Bouncy Bucket, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit or make a purchase from our website."
    },
    {
      title: "2. Information We Collect",
      content: "We collect personal information such as your name, email address, phone number, shipping/billing address, and order details. We may also collect non-personal data like browser type, IP address, and device information for analytics purposes."
    },
    {
      title: "3. How We Use Your Information",
      content: "Your information is used to process orders, manage payments, deliver products, provide customer support, improve our services, and send updates related to your orders or promotional offers (only if opted in)."
    },
    {
      title: "4. Payment Security",
      content: "We do not store your credit/debit card or banking details. All transactions are securely processed through Razorpay, a PCI-DSS compliant payment gateway that ensures encrypted and secure transactions."
    },
    {
      title: "5. Cookies & Tracking Technologies",
      content: "We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose to disable cookies through your browser settings."
    },
    {
      title: "6. Data Sharing",
      content: "We do not sell your personal information. Your data may be shared with trusted third parties such as payment gateways, logistics partners, and analytics tools strictly for order fulfillment and service improvement."
    },
    {
      title: "7. Data Retention",
      content: "We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce agreements."
    },
    {
      title: "8. Data Protection",
      content: "We implement industry-standard security measures to protect your personal data from unauthorized access, misuse, or disclosure. However, no method of transmission over the internet is 100% secure."
    },
    {
      title: "9. Your Rights",
      content: "Under applicable laws such as the Digital Personal Data Protection Act (DPDPA), you have the right to access, update, or delete your personal data. You may also withdraw consent for marketing communications at any time."
    },
    {
      title: "10. Third-Party Links",
      content: "Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external sites."
    },
    {
      title: "11. Children’s Privacy",
      content: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children."
    },
    {
      title: "12. Policy Updates",
      content: "We reserve the right to update or modify this Privacy Policy at any time. Changes will be posted on this page with an updated revision date."
    },
    {
      title: "13. Legal Compliance",
      content: "We process your data in accordance with applicable Indian laws, including the Digital Personal Data Protection Act (DPDPA)."
    },
    {
      title: "14. Contact Us",
      content: "If you have any questions about this Privacy Policy or your data, you can contact us at: support@bouncybucket.com"
    }
  ];

  return (
    <div className="bg-white min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-slate-500 mb-12 italic">
          Last Updated: April 2026
        </p>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <div key={index} className="border-l-4 border-pink-600 pl-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {section.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}