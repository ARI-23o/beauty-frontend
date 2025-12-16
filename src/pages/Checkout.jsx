// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api";

const Checkout = () => {
  const {
    cartItems,
    totalAmount,
    clearCart,
    loyaltyPoints,
    addLoyaltyPoints,
    calculateEarnedPoints,
  } = useCart();

  const navigate = useNavigate();

  // --- Decode JWT to get basic user info ---
  const token = localStorage.getItem("token");
  let loggedInUser = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      loggedInUser = {
        id: payload.id || payload._id,
        email: payload.email,
        name: payload.name || payload.fullName || "",
      };
    } catch {
      // ignore token decode errors
    }
  }

  // Redirect to login if no token
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // --- Form state ---
  const [formData, setFormData] = useState({
    fullName: loggedInUser?.name || "",
    email: loggedInUser?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "India",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Loyalty points preview
  useEffect(() => {
    setEarnedPoints(calculateEarnedPoints(totalAmount));
  }, [totalAmount, calculateEarnedPoints]);

  const formatPrice = (amount) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  // --- Validators ---
  const validators = {
    fullName: (v) =>
      /^[A-Za-z ]+$/.test(v) ? "" : "Full name should contain only alphabets",
    phone: (v) =>
      /^\d{10}$/.test(v) ? "" : "Phone number must be exactly 10 digits",
    address: (v) =>
      v.length >= 5 ? "" : "Address must be at least 5 characters",
    city: (v) =>
      /^[A-Za-z ]+$/.test(v) ? "" : "City should contain only alphabets",
    postalCode: (v) =>
      /^\d{6}$/.test(v) ? "" : "Postal code must be exactly 6 digits",
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const err = validators[field](formData[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (validators[name]) {
      const err = validators[name](value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // Build normalized order items with productId
  const buildOrderItems = () =>
    cartItems.map((item) => ({
      productId: item.productId || item._id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

  // --- COD ---
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const orderData = {
      userId: loggedInUser.id,
      email: loggedInUser.email,
      items: buildOrderItems(),
      totalAmount,
      shippingAddress: { ...formData },
      paymentMethod: "COD",
      paymentStatus: "Pending",
    };

    try {
      setIsLoading(true);

      await api.post("/api/orders/checkout", orderData);

      const pts = addLoyaltyPoints(totalAmount);
      clearCart();
      navigate("/thankyou", {
        state: {
          name: formData.fullName,
          total: totalAmount,
          earnedPoints: pts,
        },
      });
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("Something went wrong while placing your order.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Razorpay ---
  const handleRazorpayPayment = async () => {
    if (!validateAll()) return;

    try {
      setIsLoading(true);

      const { data } = await api.post("/api/payments/create-order", {
        amount: totalAmount,
        receipt: "rcpt_" + Date.now(),
        notes: { userId: loggedInUser.id },
      });

      const { order } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "BeautyE Store",
        description: "Order Payment",
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/api/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              const paidOrderData = {
                userId: loggedInUser.id,
                email: loggedInUser.email,
                items: buildOrderItems(),
                totalAmount,
                shippingAddress: { ...formData },
                paymentMethod: "Razorpay",
                paymentStatus: "Paid",
              };

              await api.post("/api/orders/checkout", paidOrderData);

              const pts = addLoyaltyPoints(totalAmount);
              clearCart();
              navigate("/thankyou", {
                state: {
                  name: formData.fullName,
                  total: totalAmount,
                  earnedPoints: pts,
                },
              });
            } else {
              alert("❌ Payment verification failed.");
            }
          } catch (err) {
            console.error("Razorpay verify error:", err);
            alert("Server verification error. Try again later.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: loggedInUser.email,
          contact: formData.phone,
        },
        theme: { color: "#F37254" },
      };

      const razor = new window.Razorpay(options);
      razor.on("payment.failed", (res) => {
        console.error("Payment Failed:", res.error);
        alert("Payment failed: " + res.error.description);
      });
      razor.open();
    } catch (err) {
      console.error("Razorpay init error:", err);
      alert("Unable to initialize payment.");
    } finally {
      setIsLoading(false);
    }
  };

  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 min-h-[80vh]">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
          Your cart is empty 🛒
        </h2>
        <Link
          to="/shop"
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-24 px-6 md:px-20">
      <h2 className="text-4xl font-semibold text-center mb-10 text-gray-800">
        Checkout
      </h2>

      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* Billing form */}
        <form onSubmit={handlePlaceOrder} className="bg-white shadow-lg rounded-2xl p-8 border">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Billing Details</h3>

          {[
            { label: "Full Name", name: "fullName" },
            { label: "Phone Number", name: "phone" },
            { label: "Address", name: "address", type: "textarea" },
            { label: "City", name: "city" },
            { label: "Postal Code", name: "postalCode" },
          ].map(({ label, name, type }) => (
            <div className="mb-5" key={name}>
              <label className="block text-gray-600 mb-1">{label}</label>

              {type === "textarea" ? (
                <textarea
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 resize-none ${
                    errors[name] ? "border-red-500" : "border-gray-300"
                  }`}
                  rows="3"
                />
              ) : (
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 ${
                    errors[name] ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}

              {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
            </div>
          ))}

          <div className="mb-5">
            <label className="block text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={formData.email}
              className="w-full border rounded-lg px-4 py-2 bg-gray-100"
            />
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-500 text-white py-3 rounded-full"
            >
              {isLoading ? "Processing..." : "Place Order (COD)"}
            </button>

            <button
              type="button"
              onClick={handleRazorpayPayment}
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-3 rounded-full"
            >
              {isLoading ? "Processing..." : "Pay with Razorpay"}
            </button>
          </div>
        </form>

        {/* Order summary */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Order Summary</h3>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {cartItems.map((item, idx) => (
              <div
                key={item.productId || item._id || item.id || idx}
                className="flex justify-between border-b pb-2"
              >
                <div>
                  <h4 className="text-gray-800 font-medium">{item.name}</h4>
                  <p className="text-gray-500 text-sm">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="font-medium text-gray-700">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-pink-50 p-4 rounded-lg border border-pink-200">
            <p className="text-pink-700 font-medium">
              You will earn{" "}
              <span className="font-bold text-pink-600">{earnedPoints}</span> loyalty
              points with this order.
            </p>
            <p className="text-gray-700 mt-2">
              Current Balance:{" "}
              <span className="font-semibold text-pink-600">{loyaltyPoints} points</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
