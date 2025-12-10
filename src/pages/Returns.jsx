// src/pages/Returns.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

const Returns = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    productName: "",
    reason: "wrong-item",
    condition: "unopened",
    details: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.orderId.trim()) {
      toast.error("Please fill your name, email and order ID.");
      return;
    }

    if (!formData.details.trim()) {
      toast.error("Please describe your issue in the details box.");
      return;
    }

    setSubmitting(true);
    try {
      // Build a single message string and send through existing /api/contact
      const message = `
RETURN / EXCHANGE REQUEST

Name: ${formData.name}
Email: ${formData.email}

Order ID: ${formData.orderId}
Product Name: ${formData.productName || "-"}
Reason: ${formData.reason}
Product Condition: ${formData.condition}

Details:
${formData.details}
      `;

      await api.post("/api/contact", {
        name: formData.name,
        email: formData.email,
        message,
      });

      toast.success("Your return / exchange request has been submitted.");
      setFormData({
        name: "",
        email: "",
        orderId: "",
        productName: "",
        reason: "wrong-item",
        condition: "unopened",
        details: "",
      });
    } catch (err) {
      console.error("Return request failed:", err?.response?.data || err.message);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        {/* LEFT: Terms & Conditions */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-pink-50">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Returns & Exchanges
          </h1>
          <p className="text-gray-600 mb-4">
            We want you to absolutely love your BeautyE products. If something
            isn&apos;t quite right, you can request a return or exchange within{" "}
            <span className="font-semibold text-gray-800">7 days</span> of
            delivery for eligible items.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            Eligibility
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
            <li>Product must be unused, unopened and in original packaging.</li>
            <li>Return request must be raised within 7 days of delivery.</li>
            <li>Hygiene-sensitive items (like lip products, mascaras, etc.) are not returnable once opened.</li>
            <li>In case of damaged / wrong item, please raise a request within 48 hours.</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            Non-returnable items
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
            <li>Products purchased during final sale / clearance.</li>
            <li>Items with tampered or missing original tags and seals.</li>
            <li>
              Products showing signs of use, swatching or physical damage not
              reported at delivery time.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            Refund & Exchange
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
            <li>Refunds are processed to the original payment method.</li>
            <li>
              Exchanges are subject to stock availability. If unavailable, we will
              process a refund instead.
            </li>
            <li>
              Once approved, refunds usually reflect within 5–7 working days.
            </li>
          </ul>

          <p className="text-xs text-gray-400 mt-6">
            Note: These policies may be updated from time to time. For any urgent
            help, please contact our support team via the Contact page.
          </p>
        </div>

        {/* RIGHT: Request Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-pink-50">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Request a Return or Exchange
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Fill in the details below and our support team will get back to you
            within 24–48 hours with the next steps.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name<span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                placeholder="Your Name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email<span className="text-pink-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                placeholder="you@example.com"
              />
            </div>

            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Order ID<span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                placeholder="e.g. 64f9c1ab1234..."
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find this in your order confirmation email or My Orders
                section.
              </p>
            </div>

            {/* Product Name (optional) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name (optional)
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                placeholder="Which product is this about?"
              />
            </div>

            {/* Reason + Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Reason<span className="text-pink-500">*</span>
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                >
                  <option value="wrong-item">Received wrong item</option>
                  <option value="damaged">Product arrived damaged</option>
                  <option value="not-as-expected">Not as expected</option>
                  <option value="size-shade-issue">Shade / size issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Condition<span className="text-pink-500">*</span>
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                >
                  <option value="unopened">Unopened / seal intact</option>
                  <option value="opened-unused">Opened but unused</option>
                  <option value="lightly-used">Lightly used</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Details<span className="text-pink-500">*</span>
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none"
                placeholder="Tell us a bit more about the issue..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-pink-500 text-white py-2.5 rounded-full text-sm font-semibold hover:bg-pink-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              By submitting this form, you agree to our Returns Policy and Terms
              &amp; Conditions.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Returns;
