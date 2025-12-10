// src/pages/TrackOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import api from "../api";

const statusColor = (s) => {
  if (!s) return "bg-gray-100 text-gray-800";
  if (/delivered/i.test(s)) return "bg-green-100 text-green-800";
  if (/out for delivery/i.test(s) || /out_for_delivery/i.test(s)) return "bg-yellow-100 text-yellow-800";
  if (/in transit/i.test(s) || /in_transit/i.test(s)) return "bg-blue-100 text-blue-800";
  if (/exception|failed/i.test(s)) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

export default function TrackOrder() {
  const { orderId } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ FIXED: removed API_BASE, use relative path with api
        const res = await api.get(`/api/tracking/order/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setTracking(res.data);
      } catch (e) {
        setErr("No tracking information found for this order.");
        setTracking(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [orderId]);

  if (loading) return <p className="text-center py-8 text-gray-600">Loading tracking...</p>;
  if (err) return <p className="text-center py-8 text-gray-600">{err}</p>;
  if (!tracking) return <p className="text-center py-8 text-gray-600">No tracking information found for this order.</p>;

  const timeline = (tracking.history || []).slice().reverse();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Track Order</h2>
      <div className="bg-white p-4 rounded shadow">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Courier</p>
            <div className="font-medium">{tracking.courier || "MockCourier"}</div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tracking No</p>
            <div className="font-medium">{tracking.trackingNumber}</div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current</p>
            <div className={`inline-block px-3 py-1 rounded ${statusColor(tracking.status)}`}>{tracking.status}</div>
          </div>
        </div>

        <div className="timeline space-y-4">
          {timeline.length > 0 ? (
            timeline.map((h, idx) => (
              <div key={idx} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{h.status}</div>
                    <div className="text-sm text-gray-600">{h.message}</div>
                    {h.location && <div className="text-xs text-gray-500">Location: {h.location}</div>}
                  </div>
                  <div className="text-xs text-gray-500">
                    {h.timestamp ? new Date(h.timestamp).toLocaleString() : ""}
                  </div>
                </div>
                {h.proof_url && (
                  <div className="mt-2">
                    <a
                      href={h.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-600 underline"
                    >
                      View proof / media
                    </a>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-600">No history yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
