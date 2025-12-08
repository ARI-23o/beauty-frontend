import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function OrderDetailAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state for tracking actions
  const [creating, setCreating] = useState(false);
  const [createCourier, setCreateCourier] = useState("");
  const [createTrackingNumber, setCreateTrackingNumber] = useState("");
  const [createAuto, setCreateAuto] = useState(true);

  const [polling, setPolling] = useState(false);

  // manual update modal
  const [showManual, setShowManual] = useState(false);
  const [manualStatus, setManualStatus] = useState("");
  const [manualMessage, setManualMessage] = useState("");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${adminToken}` },
  };

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders/${id}`, axiosConfig);
      setOrder(res.data);
    } catch (err) {
      console.error("Failed to load order (admin):", err?.response?.data || err.message || err);
      toast.error("Failed to load order");
    }
  };

  const fetchTracking = async () => {
    try {
      // get latest tracking for this order
      const res = await axios.get(`${API_BASE}/api/tracking/order/${id}`, axiosConfig);
      setTracking(res.data);
    } catch (err) {
      // if 404 - no tracking yet
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ======= Actions =======
  const handleCreateTracking = async () => {
    if (!createCourier && !createTrackingNumber) {
      toast.error("Enter courier or leave empty to use MockCourier");
      return;
    }

    setCreating(true);
    try {
      // admin endpoint: POST /api/tracking/:orderId/create
      // send { courier, auto, useAftership } - admin may choose to use AfterShip later
      const body = {
        courier: createCourier || "MockCourier",
        auto: !!createAuto,
        // don't enable useAftership by default unless you want it
        useAftership: false,
      };

      const res = await axios.post(`${API_BASE}/api/tracking/${order._id}/create`, body, axiosConfig);
      toast.success("Tracking created");
      await fetchTracking();
      await fetchOrder();
    } catch (err) {
      console.error("Create tracking failed:", err?.response?.data || err.message || err);
      toast.error("Failed to create tracking");
    } finally {
      setCreating(false);
    }
  };

  const handlePollTracking = async () => {
    if (!tracking?._id) return toast.error("No tracking to poll");
    setPolling(true);
    try {
      await axios.post(`${API_BASE}/api/tracking/${tracking._id}/poll`, {}, axiosConfig);
      toast.success("Polled tracking (check timeline)");
      await fetchTracking();
      await fetchOrder();
    } catch (err) {
      console.error("Poll tracking failed:", err?.response?.data || err.message || err);
      toast.error("Failed to poll tracking");
    } finally {
      setPolling(false);
    }
  };

  const handleOpenManual = () => {
    setManualStatus("");
    setManualMessage("");
    setShowManual(true);
  };

  const handleManualUpdate = async () => {
    if (!tracking?._id) return toast.error("No tracking to update");
    if (!manualStatus) return toast.error("Please pick a status");

    try {
      const body = { status: manualStatus, message: manualMessage };
      await axios.patch(`${API_BASE}/api/tracking/${tracking._id}/status`, body, axiosConfig);
      toast.success("Tracking status updated");
      setShowManual(false);
      await fetchTracking();
      await fetchOrder();
    } catch (err) {
      console.error("Manual update failed:", err?.response?.data || err.message || err);
      toast.error("Failed to update tracking status");
    }
  };

  const statusBadge = (s) => {
    if (!s) return "bg-gray-100 text-gray-800";
    const sl = s.toLowerCase();
    if (sl.includes("delivered")) return "bg-green-100 text-green-800";
    if (sl.includes("shipped") || sl.includes("out for delivery") || sl.includes("out_for_delivery")) return "bg-yellow-100 text-yellow-800";
    if (sl.includes("in transit") || sl.includes("in_transit")) return "bg-blue-100 text-blue-800";
    if (sl.includes("exception") || sl.includes("failed") || sl.includes("cancel")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="p-10 text-center text-gray-600">Loading...</div>;
  if (!order) return <div className="p-10 text-center text-red-500">Order not found</div>;

  const timeline = (tracking?.history || []).slice().reverse();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="bg-gray-700 text-white px-3 py-1 rounded">← Back</button>
        <div className="text-sm text-gray-600">Order Admin View</div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT — Order summary */}
        <div className="md:col-span-2 bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Order #{order._id}</h2>

          <div className="mb-3">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <div className="font-medium">{order.userId?.name || order.shippingAddress?.fullName}</div>
                <div className="text-sm text-gray-500">{order.userId?.email || order.shippingAddress?.email}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <div className="font-semibold">₹{order.totalAmount}</div>
                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Shipping Address</h3>
            <div className="text-sm text-gray-700">
              {order.shippingAddress?.fullName}<br />
              {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
              {order.shippingAddress?.postalCode} • {order.shippingAddress?.country}<br />
              Phone: {order.shippingAddress?.phone}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Items</h3>
            <div className="space-y-2 mt-2">
              {order.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                  </div>
                  <div className="font-semibold">₹{it.quantity * it.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin: Change order status quickly */}
          <div className="mt-6">
            <label className="font-semibold">Quick Order Status</label>
            <div className="flex gap-3 items-center mt-2">
              <select
                value={order.status}
                onChange={async (e) => {
                  try {
                    const newS = e.target.value;
                    await axios.put(`${API_BASE}/api/orders/${order._id}/status`, { status: newS }, axiosConfig);
                    toast.success("Order status updated");
                    await fetchOrder();
                  } catch (err) {
                    console.error("Order status update failed", err?.response?.data || err.message || err);
                    toast.error("Failed to update order status");
                  }
                }}
                className="border px-3 py-2 rounded"
              >
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>

              <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="bg-blue-500 text-white px-3 py-2 rounded">Open Admin Order</button>

              <button onClick={async () => { await handlePollTracking(); }} disabled={!tracking} className="bg-yellow-500 text-white px-3 py-2 rounded">
                {polling ? 'Polling...' : 'Poll Tracking'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Tracking panel */}
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Tracking</h3>

          {tracking ? (
            <div>
              <div className="mb-3">
                <div className="text-sm text-gray-600">Courier</div>
                <div className="font-medium">{tracking.courier}</div>
                <div className="text-sm text-gray-500">Tracking #: {tracking.trackingNumber}</div>
                <div className={`inline-block mt-2 px-3 py-1 rounded text-sm ${statusBadge(tracking.status)}`}>{tracking.status}</div>
              </div>

              <div className="mb-3">
                <button onClick={() => { setCreateCourier(tracking.courier || ''); setCreateTrackingNumber(tracking.trackingNumber || ''); }} className="mr-2 bg-gray-100 px-2 py-1 rounded">Edit</button>
                <button onClick={handleOpenManual} className="mr-2 bg-pink-500 text-white px-2 py-1 rounded">Manual Update</button>
                <button onClick={handlePollTracking} disabled={polling} className="bg-indigo-500 text-white px-2 py-1 rounded">Poll Now</button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Timeline</h4>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {timeline.length ? timeline.map((h, i) => (
                    <div key={i} className="p-2 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{h.status}</div>
                          <div className="text-xs text-gray-600">{h.message}</div>
                          {h.location && <div className="text-xs text-gray-500">{h.location}</div>}
                        </div>
                        <div className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString()}</div>
                      </div>
                      {h.proof_url && (
                        <div className="mt-2">
                          <a
                            href={`${API_BASE}${h.proof_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-pink-600 underline"
                          >
                            View proof
                          </a>
                        </div>
                      )}
                    </div>
                  )) : <div className="text-sm text-gray-500">No timeline entries yet.</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              No tracking exists for this order.
              <div className="mt-3">
                <input value={createCourier} onChange={(e) => setCreateCourier(e.target.value)} placeholder="Courier (eg: Delhivery)" className="border px-2 py-1 rounded w-full mb-2" />
                <div className="flex gap-2">
                  <input value={createTrackingNumber} onChange={(e) => setCreateTrackingNumber(e.target.value)} placeholder="Tracking number (optional)" className="border px-2 py-1 rounded flex-1" />
                  <button onClick={handleCreateTracking} disabled={creating} className="bg-pink-500 text-white px-3 py-1 rounded">{creating ? 'Creating...' : 'Create'}</button>
                </div>
                <label className="text-xs text-gray-500 mt-2 block"><input type="checkbox" checked={createAuto} onChange={(e) => setCreateAuto(e.target.checked)} /> Auto-update</label>
              </div>
            </div>
          )}

          {/* Manual update modal (simple inline) */}
          {showManual && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowManual(false)} />
              <div className="bg-white rounded p-4 z-50 w-full max-w-md shadow">
                <h4 className="font-semibold mb-2">Manual Tracking Update</h4>
                <select value={manualStatus} onChange={(e) => setManualStatus(e.target.value)} className="w-full border px-3 py-2 rounded mb-2">
                  <option value="">Select status</option>
                  <option>Created</option>
                  <option>Processing</option>
                  <option>In Transit</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Exception</option>
                </select>
                <textarea value={manualMessage} onChange={(e) => setManualMessage(e.target.value)} placeholder="Optional message" className="w-full border px-3 py-2 rounded mb-2" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowManual(false)} className="px-3 py-1 border rounded">Cancel</button>
                  <button onClick={handleManualUpdate} className="px-3 py-1 bg-pink-600 text-white rounded">Update</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
