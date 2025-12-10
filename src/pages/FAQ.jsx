// src/pages/FAQ.jsx
import React from "react";

const FAQ = () => {
  const faqs = [
    {
      q: "How long does delivery take?",
      a: "Orders are usually delivered within 3–7 business days depending on your location and the courier.",
    },
    {
      q: "Are your products authentic?",
      a: "Yes, we source directly from brands and authorized distributors only. All products are 100% genuine.",
    },
    {
      q: "Can I return a product?",
      a: "Yes, eligible products can be returned within 7 days of delivery. Please visit the Returns & Exchanges page for full details.",
    },
    {
      q: "Do you ship across India?",
      a: "We currently ship to most pincodes across India. Shipping charges may vary by location.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Find quick answers to common questions about orders, shipping and
          returns. If you don&apos;t see your question here, contact our support
          team anytime.
        </p>

        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <details
              key={idx}
              className="bg-white rounded-2xl shadow-sm border border-pink-50 p-4"
            >
              <summary className="cursor-pointer font-semibold text-gray-900">
                {item.q}
              </summary>
              <p className="mt-2 text-sm text-gray-700">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
