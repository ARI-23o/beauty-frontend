// src/pages/Shipping.jsx
import React from "react";

const Shipping = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-pink-50">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Shipping Information
        </h1>
        <p className="text-gray-600 mb-6">
          We partner with trusted courier services to deliver your BeautyE
          orders safely and on time.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          Delivery Time
        </h2>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
          <li>Metro cities: 2–4 business days</li>
          <li>Other cities: 3–7 business days</li>
          <li>Remote locations: 5–10 business days</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          Shipping Charges
        </h2>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
          <li>Free shipping for orders above a threshold (if you decide later).</li>
          <li>Below that, a standard shipping fee may apply based on pincode.</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          Order Tracking
        </h2>
        <p className="text-gray-600 text-sm mb-2">
          Once your order is shipped, you will receive an email and SMS with the
          tracking link. You can also track your order from the{" "}
          <span className="font-semibold">My Orders</span> section when logged
          in.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          Delivery Attempts
        </h2>
        <p className="text-gray-600 text-sm">
          Couriers usually make up to 2–3 delivery attempts. If they are unable
          to reach you, the package may be returned to us and a re-shipping fee
          might apply.
        </p>
      </div>
    </div>
  );
};

export default Shipping;
