import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function ManageOrders() {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters + UI state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courierFilter, setCourierFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const axiosConfig = {
    headers: { Authorization: `Bearer ${adminToken}` },
    timeout: 20000,
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders`, axiosConfig);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load orders:", err?.response?.data || err.message);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // ---------- HELPERS ----------
  const statusBadgeClass = (s) => {
    if (!s) return "bg-gray-100 text-gray-800";
    const sl = s.toLowerCase();
    if (sl.includes("delivered")) return "bg-green-100 text-green-800";
    if (sl.includes("shipped") || sl.includes("out for delivery") || sl.includes("out_for_delivery")) return "bg-yellow-100 text-yellow-800";
    if (sl.includes("processing")) return "bg-blue-100 text-blue-800";
    if (sl.includes("pending")) return "bg-gray-100 text-gray-800";
    if (sl.includes("cancel")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // collect available couriers from orders for filter dropdown
  const couriers = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => {
      const c = o.trackingMetadata?.courier || (o.tracking && o.tracking[0]?.courier) || "";
      if (c) set.add(c);
    });
    return ["All", ...Array.from(set)];
  }, [orders]);

  // ---------- FILTER + SEARCH + SORT ----------
  const filteredOrders = useMemo(() => {
    let data = [...orders];

    // STATUS filter
    if (statusFilter !== "All") {
      data = data.filter((o) => o.status === statusFilter);
    }

    // COURIER filter
    if (courierFilter !== "All") {
      data = data.filter((o) => {
        const c = (o.trackingMetadata && o.trackingMetadata.courier) || (o.tracking && o.tracking[0] && o.tracking[0].courier) || "";
        return c && c.toLowerCase().includes(courierFilter.toLowerCase());
      });
    }

    // SEARCH filter
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter((o) => {
        return (
          o._id.toLowerCase().includes(s) ||
          (o.userId?.name || "").toLowerCase().includes(s) ||
          (o.userId?.email || "").toLowerCase().includes(s) ||
          (o.shippingAddress?.fullName || "").toLowerCase().includes(s) ||
          (o.shippingAddress?.email || "").toLowerCase().includes(s) ||
          (o.shippingAddress?.phone || "").toLowerCase().includes(s) ||
          (o.trackingMetadata?.trackingNumber || "").toLowerCase().includes(s)
        );
      });
    }

    // SORT
    if (sort === "newest") {
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "oldest") {
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === "high") {
      data.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sort === "low") {
      data.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    return data;
  }, [orders, search, statusFilter, courierFilter, sort]);

  // ---------- PAGINATION ----------
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginated = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  // ---------- EXPORT HANDLERS ----------
  const downloadFileFromResponse = (res, filename) => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExport = async (format = "csv") => {
    try {
      // send current filters as query params to server export endpoint
      const params = new URLSearchParams();
      params.set("format", format);
      if (statusFilter && statusFilter !== "All") params.set("status", statusFilter);
      if (courierFilter && courierFilter !== "All") params.set("courier", courierFilter);

      const res = await axios.get(`${API_BASE}/api/admin/export/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        responseType: "blob",
        timeout: 60000,
      });

      const ext = format === "excel" ? "xlsx" : "csv";
      const filename = `orders_${Date.now()}.${ext}`;
      downloadFileFromResponse(res, filename);
      toast.success("Export started — check your downloads");
    } catch (err) {
      console.error("Export failed:", err?.response || err.message);
      toast.error("Failed to export orders");
    }
  };

  if (loading)
    return <div className="p-10 text-center text-gray-600">Loading orders...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Manage Orders</h2>

      {/* FILTER BAR */}
      <div className="bg-white shadow rounded-lg p-4 mb-4 flex flex-wrap gap-3 items-center">

        {/* Search */}
        <input
          type="text"
          placeholder="Search Order ID, Name, Email, Phone, Tracking..."
          className="border px-3 py-2 rounded flex-1 min-w-[260px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        {/* Status Filter */}
        <select className="border px-3 py-2 rounded" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option>All</option>
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>

        {/* Courier Filter */}
        <select className="border px-3 py-2 rounded" value={courierFilter} onChange={(e) => { setCourierFilter(e.target.value); setPage(1); }}>
          {couriers.map((c) => <option key={c}>{c}</option>)}
        </select>

        {/* Sorting */}
        <select className="border px-3 py-2 rounded" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="high">Amount High → Low</option>
          <option value="low">Amount Low → High</option>
        </select>

        <div className="ml-auto flex gap-2">
          <button onClick={() => handleExport("csv")} className="bg-gray-800 text-white px-3 py-2 rounded">Export CSV</button>
          <button onClick={() => handleExport("excel")} className="bg-green-600 text-white px-3 py-2 rounded">Export Excel</button>
          <button onClick={() => navigate("/admin/analytics")} className="bg-indigo-600 text-white px-3 py-2 rounded">Analytics</button>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border">Order ID</th>
              <th className="px-4 py-2 border">Customer</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Courier</th>
              <th className="px-4 py-2 border">Track #</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length ? (
              paginated.map((order) => (
                <tr key={order._id} className="text-center border-b">
                  <td className="border px-3 py-2">{order._id}</td>

                  <td className="border px-3 py-2">
                    {order.userId?.name || order.shippingAddress?.fullName}
                    <br />
                    <span className="text-xs text-gray-500">{order.userId?.email || order.shippingAddress?.email}</span>
                  </td>

                  <td className="border px-3 py-2 font-semibold">₹{order.totalAmount}</td>

                  <td className="border px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadgeClass(order.status)}`}>{order.status}</span>
                  </td>

                  <td className="border px-3 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>

                  <td className="border px-3 py-2 text-sm">{order.trackingMetadata?.courier || (order.tracking && order.tracking[0]?.courier) || "—"}</td>

                  <td className="border px-3 py-2 text-xs">{order.trackingMetadata?.trackingNumber || (order.tracking && order.tracking[0]?.trackingNumber) || "—"}</td>

                  <td className="border px-3 py-2">
                    <button onClick={() => navigate(`/admin/orders/detail/${order._id}`)} className="bg-pink-600 text-white px-3 py-1 rounded">View / Track</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500 border">No matching orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-5 gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button key={index} onClick={() => setPage(index + 1)} className={`px-3 py-1 rounded border ${page === index + 1 ? "bg-pink-600 text-white" : "bg-white text-gray-700"}`}>{index + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
