import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";


const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Fetch user orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ No token found, please login first.");
        setLoading(false);
        return;
      }

      // ✅ Corrected endpoint and header
      const response = await api.get("http://localhost:5000/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
    
      setOrders(response.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch user orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch orders when page loads
  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Refresh orders if redirected from ThankYou page
  useEffect(() => {
    if (location.state?.refreshOrders) {
      fetchOrders();
    }
  }, [location.state]);

  // ✅ UI Loading
  if (loading)
    return (
      <p className="text-center text-gray-600 py-10 animate-pulse">
        Loading your orders...
      </p>
    );

  // ✅ UI No Orders
  if (orders.length === 0)
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          No orders found.
        </h2>
        <p className="text-gray-500 mb-6">
          Looks like you haven’t placed any orders yet.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="bg-pink-500 text-white px-6 py-2 rounded-full font-medium hover:bg-pink-600 transition"
        >
          Start Shopping
        </button>
      </div>
    );

  // ✅ UI Orders List
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        My Orders
      </h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="p-5 border border-gray-200 rounded-xl hover:shadow-lg transition cursor-pointer bg-white"
            onClick={() => navigate(`/order/${order._id}`)}
          >
            {/* Header Row */}
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-gray-800">
                Order ID: <span className="text-gray-600">{order._id}</span>
              </p>
              <span
                className={`px-2.5 py-1 text-sm rounded-full font-medium ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "Shipped"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "Processing"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status === "Pending"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex justify-between text-sm text-gray-600">
              <p>
                Date:{" "}
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </p>
              <p>
                Total:{" "}
                <span className="font-semibold text-gray-800">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </p>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-0.5">
                  {order.items.slice(0, 3).map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                  {order.items.length > 3 && (
                    <li className="text-gray-400">+ more...</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
