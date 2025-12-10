// src/pages/Privacy.jsx
import React from "react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-pink-50">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-4">
          Your privacy matters to us. This policy explains how BeautyE collects,
          uses and protects your personal information.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          Information We Collect
        </h2>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
          <li>Basic contact details such as name, email, phone and address.</li>
          <li>Order history, wishlist and cart information.</li>
          <li>
            Technical information like browser type, device and approximate
            location to improve your experience.
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          How We Use Your Data
        </h2>
        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
          <li>To process and deliver your orders.</li>
          <li>To send order updates, offers and important account information.</li>
          <li>To improve our website, services and customer support.</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          Third-party Sharing
        </h2>
        <p className="text-gray-600 text-sm">
          We may share necessary information with trusted partners such as
          payment gateways and courier services strictly for order processing.
          We do not sell your personal data.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
          Your Rights
        </h2>
        <p className="text-gray-600 text-sm">
          You can request to update or delete your personal information, or opt
          out of marketing emails at any time using the unsubscribe link or by
          contacting our support team.
        </p>

        <p className="text-xs text-gray-400 mt-6">
          This is a general template. You can adjust the text to match your
          final legal policy later.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
