// src/pages/Contact.jsx
import React, { useState } from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../api";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const faqs = [
    {
      q: "How long does delivery take?",
      a: "Most orders are delivered within 3–7 business days depending on your location.",
    },
    {
      q: "Are your products cruelty-free?",
      a: "Yes, we carefully curate brands that are cruelty-free and dermatologically tested.",
    },
    {
      q: "Can I return a product?",
      a: "Unopened, unused products can be returned within 7 days of delivery as per our return policy.",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // Adjust this endpoint if your backend route is different
      await api.post("/api/contact", {
        name: form.name,
        email: form.email,
        message: form.message,
      });

      toast.success("Thank you! We’ll get back to you shortly.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-amber-50 pt-28 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-pink-50">
        <div className="grid md:grid-cols-2">
          {/* LEFT: Image / visual side */}
          <div className="relative h-72 md:h-full">
            {/* Replace src with your own beauty/contact image */}
            <img
              src="/images/contact-hero.jpg"
              alt="Customer applying makeup"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.pexels.com/photos/3760852/pexels-photo-3760852.jpeg?auto=compress&cs=tinysrgb&w=800";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="uppercase tracking-[0.2em] text-xs mb-1">we’re listening</p>
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">Let’s Talk Beauty</h2>
              <p className="text-sm text-white/80">
                Questions about shades, skin type, or orders?  
                Our beauty support team is just a message away.
              </p>
            </div>
          </div>

          {/* RIGHT: Form + FAQs */}
          <div className="p-6 md:p-10 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-pink-400">
                  contact
                </p>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-1">
                  Let’s Talk Beauty
                </h1>
              </div>
              <div className="hidden md:flex flex-col items-end text-xs text-gray-400">
                <span>Need instant help?</span>
                <span className="font-medium text-pink-500">support@beautyecom.com</span>
              </div>
            </div>

            <p className="text-sm md:text-[15px] text-gray-600 mb-6">
              We’re here to help with product questions, orders, or anything in between.
              Drop us a note and our team will respond within 24–48 hours.
            </p>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-300 transition"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-300 transition"
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-300 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-10 py-2.5 rounded-full bg-pink-500 text-white text-sm font-semibold tracking-wide hover:bg-pink-600 active:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Sending..." : "SEND"}
              </button>
            </form>

            {/* Icons row */}
            <div className="flex items-center gap-4 text-pink-500 text-lg mb-5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-50">
                <FaEnvelope />
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-50">
                <FaPhoneAlt />
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-50">
                <FaInstagram />
              </span>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-50">
                <FaWhatsapp />
              </span>
            </div>

            {/* Quick FAQs */}
            <div className="mt-auto border-t pt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">
                quick faqs
              </p>
              <div className="space-y-2">
                {faqs.map((f, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-100 rounded-xl px-3 py-2 text-sm bg-gray-50/60"
                  >
                    <button
                      type="button"
                      className="w-full flex items-center justify-between text-left"
                      onClick={() =>
                        setOpenFaqIndex((prev) => (prev === idx ? -1 : idx))
                      }
                    >
                      <span className="font-medium text-gray-800">{f.q}</span>
                      <span className="ml-3 text-gray-400 text-lg">
                        {openFaqIndex === idx ? "−" : "+"}
                      </span>
                    </button>
                    {openFaqIndex === idx && (
                      <p className="mt-1 text-gray-600 text-xs md:text-[13px]">
                        {f.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
