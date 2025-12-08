import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const ThankYou = () => {
  const { state } = useLocation();
  const { name = "Customer", total = 0, order } = state || {};
  const [orderId, setOrderId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const formatPrice = (a) =>
    a.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  useEffect(() => {
    if (order?. _id) {
      setOrderId(order._id);
      const d = new Date(order.createdAt);
      d.setDate(d.getDate() + 4);
      setDeliveryDate(d.toDateString());
    } else {
      setOrderId("ORD-" + Math.floor(Math.random() * 1e6));
      const d = new Date();
      d.setDate(d.getDate() + 4);
      setDeliveryDate(d.toDateString());
    }
  }, [order]);

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center bg-gradient-to-b from-rose-50 via-white to-pink-50 text-center px-6 py-20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="bg-gradient-to-tr from-green-100 to-green-200 rounded-full p-6 mb-6 shadow-inner"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-semibold text-gray-800 mb-3 tracking-tight"
      >
        Thank You, <span className="text-pink-600">{name}</span>! 💖
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-gray-600 text-lg mb-8 max-w-xl leading-relaxed"
      >
        Your order has been placed successfully.
        <br />
        <span className="text-gray-700">
          Total Paid:{" "}
          <span className="font-semibold text-pink-600">{formatPrice(total)}</span>
        </span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white shadow-md rounded-xl px-6 py-4 mb-8 border border-pink-100 max-w-md"
      >
        <p className="text-gray-700 text-lg">
          <span className="font-semibold text-gray-800">Order ID:</span> {orderId}
        </p>
        <p className="text-gray-700 text-lg mt-2">
          <span className="font-semibold text-gray-800">Expected Delivery:</span>{" "}
          {deliveryDate}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Link
          to="/shop"
          className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-10 py-3 rounded-full text-lg font-medium hover:opacity-90 transition shadow-lg hover:shadow-pink-200"
        >
          Continue Shopping
        </Link>
      </motion.div>
    </div>
  );
};

export default ThankYou;
