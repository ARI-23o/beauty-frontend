import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import api from "../../api";

export default function AnalyticsAdmin() {
  const token = localStorage.getItem("adminToken");
  const [loading, setLoading] = useState(true);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [revenueByDay, setRevenueByDay] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        // We'll use a simple admin stats endpoint; if you don't want to add new backend,
        // we can compute client-side from /api/orders but for performance a backend endpoint is preferable.
        const res = await api.get(`${API_BASE}/api/admin/stats/orders-summary`, { headers });
        // expected res.data = { byStatus: { Pending: 5, Shipped: 10, Delivered: 20 }, byDay: [{date:'2025-11-01', revenue: 1200}, ...] }
        const data = res.data || {};
        const byStatus = Object.entries(data.byStatus || {}).map(([k, v]) => ({ status: k, count: v }));
        setOrdersByStatus(byStatus);
        setRevenueByDay(data.byDay || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Orders Analytics</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersByStatus}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Revenue by Day (last 14 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
