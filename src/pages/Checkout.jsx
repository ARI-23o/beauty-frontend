// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
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

  // ---------------- AUTH ----------------
  const token = localStorage.getItem("token");
  let loggedInUser = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      loggedInUser = {
        id: payload.id || payload._id || payload.userId,
        email: payload.email,
        name: payload.name || payload.fullName || "",
      };
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // ---------------- FORM ----------------
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

  useEffect(() => {
    setEarnedPoints(calculateEarnedPoints(totalAmount));
  }, [totalAmount, calculateEarnedPoints]);

  const formatPrice = (amt) =>
    amt.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  // ---------------- VALIDATION ----------------
  const validators = {
    fullName: (v) =>
      /^[A-Za-z ]+$/.test(v) ? "" : "Only alphabets allowed",
    phone: (v) =>
      /^\d{10}$/.test(v) ? "" : "Phone must be 10 digits",
    address: (v) => (v.length >= 5 ? "" : "Min 5 characters"),
    city: (v) =>
      /^[A-Za-z ]+$/.test(v) ? "" : "Only alphabets allowed",
    postalCode: (v) =>
      /^\d{6}$/.test(v) ? "" : "Postal code must be 6 digits",
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(validators).forEach((f) => {
      const err = validators[f](formData[f]);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (validators[name]) {
      setErrors((p) => ({ ...p, [name]: validators[name](value) }));
    }
  };

  const buildOrderItems = () =>
    cartItems.map((item) => ({
      productId: item.productId || item._id || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

  // ---------------- COD CHECKOUT (FIXED) ----------------
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

      // 🔥 INCREASED TIMEOUT ONLY HERE
      await api.post("/api/orders/checkout", orderData, {
        timeout: 60000,
      });

      // ✅ Order already saved even if email fails
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
      alert("Order saved but confirmation email may be delayed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- RAZORPAY ----------------
  const handleRazorpayPayment = async () => {
    if (!validateAll()) return;

    try {
      setIsLoading(true);

      const { data } = await api.post(
        "/api/payments/create-order",
        {
          amount: totalAmount,
          receipt: "rcpt_" + Date.now(),
          notes: { userId: loggedInUser.id },
        },
        { timeout: 60000 }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "BeautyE Store",
        description: "Order Payment",

        handler: async (response) => {
          try {
            await api.post(
              "/api/payments/verify-payment",
              response,
              { timeout: 60000 }
            );

            await api.post(
              "/api/orders/checkout",
              {
                ...orderData,
                paymentMethod: "Razorpay",
                paymentStatus: "Paid",
              },
              { timeout: 60000 }
            );

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
            alert("Payment verified but order confirmation delayed.");
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
      razor.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      alert("Unable to start payment.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- EMPTY CART ----------------
  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-semibold mb-4">Your cart is empty 🛒</h2>
        <Link to="/shop" className="bg-pink-500 text-white px-6 py-3 rounded">
          Go Shopping
        </Link>
      </div>
    );
  }

  // ---------------- UI (UNCHANGED STRUCTURE) ----------------
  return (
    <div className="bg-gray-50 py-24 px-6 md:px-20">
      <h2 className="text-4xl font-semibold text-center mb-10">Checkout</h2>

      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* Billing Form */}
        <form onSubmit={handlePlaceOrder} className="bg-white p-8 rounded-2xl shadow">
          <h3 className="text-2xl font-semibold mb-6">Billing Details</h3>

          {["fullName", "phone", "address", "city", "postalCode"].map((name) => (
            <div key={name} className="mb-4">
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={name}
                className="w-full border px-4 py-2 rounded"
              />
              {errors[name] && (
                <p className="text-red-500 text-sm">{errors[name]}</p>
              )}
            </div>
          ))}

          <button
            disabled={isLoading}
            className="w-full bg-pink-500 text-white py-3 rounded-full"
          >
            {isLoading ? "Processing..." : "Place Order (COD)"}
          </button>

          <button
            type="button"
            onClick={handleRazorpayPayment}
            disabled={isLoading}
            className="w-full mt-3 bg-green-500 text-white py-3 rounded-full"
          >
            Pay with Razorpay
          </button>
        </form>

        {/* Summary */}
        <div className="bg-white p-8 rounded-2xl shadow">
          <h3 className="text-2xl font-semibold mb-6">Order Summary</h3>

          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between mb-2">
              <span>{item.name}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}

          <div className="mt-4 text-pink-600 font-medium">
            Earned Points: {earnedPoints}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
