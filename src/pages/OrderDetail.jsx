// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/orders/my-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to fetch order", err);
    }
  };

  const fetchTracking = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/tracking/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTracking(res.data);
    } catch (err) {
      setTracking(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchOrder();
      await fetchTracking();
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <p className="text-center py-8 text-gray-600">Loading...</p>;
  if (!order) return <p className="text-center py-8 text-red-500">Order not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Order Details</h2>

      <div className="border rounded-lg p-6 bg-white shadow-lg">
        <div className="mb-4">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ₹{order.totalAmount}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Shipping</h3>
          <p>{order.shippingAddress?.fullName}</p>
          <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
          <p>{order.shippingAddress?.phone}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Items</h3>
          <ul>
            {order.items.map((it, i) => (
              <li key={i}>{it.name} × {it.quantity} — ₹{it.price}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Tracking</h3>
          {tracking ? (
            <div>
              <p><strong>Courier:</strong> {tracking.courier}</p>
              <p><strong>Tracking No:</strong> {tracking.trackingNumber}</p>
              <p><strong>Current Status:</strong> {tracking.status}</p>
              <p className="mt-3">
                <button
                  onClick={() => navigate(`/track-order/${order._id}`)}
                  className="bg-pink-500 text-white px-4 py-2 rounded"
                >
                  Track Order
                </button>
              </p>
            </div>
          ) : (
            <div className="text-gray-600">
              No tracking available yet. If your order is shipped, tracking will appear here.
            </div>
          )}
        </div>

        {order.status === "Delivered" && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate(`/order/${order._id}/invoice`)}
              className="bg-pink-600 text-white px-4 py-2 rounded"
            >
              Download Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
