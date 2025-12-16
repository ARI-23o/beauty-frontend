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

  // Decode token
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
      // ignore
    }
  }

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

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

  // COD ORDER
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      setIsLoading(true);

      await api.post("/api/orders/checkout", {
        userId: loggedInUser.id,
        email: loggedInUser.email,
        items: buildOrderItems(),
        totalAmount,
        shippingAddress: { ...formData },
        paymentMethod: "COD",
        paymentStatus: "Pending",
      });

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
      alert("Order placement failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // RAZORPAY
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
              await api.post("/api/orders/checkout", {
                userId: loggedInUser.id,
                email: loggedInUser.email,
                items: buildOrderItems(),
                totalAmount,
                shippingAddress: { ...formData },
                paymentMethod: "Razorpay",
                paymentStatus: "Paid",
              });

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
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Verify error:", err);
            alert("Payment verified but order failed.");
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
      console.error("Razorpay Error:", err);
      alert("Unable to initialize payment.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-semibold mb-4">Your cart is empty 🛒</h2>
        <Link to="/shop" className="bg-pink-500 text-white px-6 py-3 rounded-lg">
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-24 px-6 md:px-20">
      <h2 className="text-4xl font-semibold text-center mb-10">Checkout</h2>

      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        <form onSubmit={handlePlaceOrder} className="bg-white p-8 rounded-2xl shadow">
          <h3 className="text-2xl font-semibold mb-6">Billing Details</h3>

          {["fullName", "phone", "address", "city", "postalCode"].map((name) => (
            <div className="mb-4" key={name}>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={name}
                className="w-full border px-4 py-2 rounded"
              />
              {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
            </div>
          ))}

          <button disabled={isLoading} className="w-full bg-pink-500 text-white py-3 rounded-full">
            Place Order (COD)
          </button>

          <button
            type="button"
            onClick={handleRazorpayPayment}
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-3 rounded-full mt-3"
          >
            Pay with Razorpay
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
