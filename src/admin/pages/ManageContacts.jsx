// src/admin/pages/ManageContacts.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

export default function ManageContacts() {
  const adminToken = localStorage.getItem("adminToken");

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // local reply form state (subject + body)
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const headers = {
    Authorization: `Bearer ${adminToken}`,
  };

  // Load contact messages
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/contacts", { headers });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load contacts:", err?.response?.data || err.message);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line
  }, []);

  // Search filter
  const filtered = useMemo(() => {
    if (!q.trim()) return messages;
    const s = q.toLowerCase();
    return messages.filter((m) => {
      return (
        (m.name || "").toLowerCase().includes(s) ||
        (m.email || "").toLowerCase().includes(s) ||
        (m.message || "").toLowerCase().includes(s) ||
        (m.subject || "").toLowerCase().includes(s)
      );
    });
  }, [messages, q]);

  const handleSelect = (m) => {
    setSelected(m);
    // prefill reply subject + body template
    setReplySubject(`Re: ${m.subject || m.name || "Your message"}`);
    setReplyBody(`Hi ${m.name || "Customer"},\n\n`);
  };

  // Delete message
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/contacts/${id}`, { headers });
      toast.success("Message deleted");
      await fetchList();
      setSelected(null);
    } catch (err) {
      console.error("Delete failed:", err?.response?.data || err.message);
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // Toggle replied flag (safe server call)
  const handleToggleReplied = async (id, current) => {
    setUpdating(true);
    try {
      await api.patch(`/api/admin/contacts/${id}/replied`, { replied: !current }, { headers });
      toast.success("Status updated");
      await fetchList();
      if (selected && selected._id === id) {
        setSelected((s) => ({ ...s, replied: !current }));
      }
    } catch (err) {
      console.error("Update replied failed:", err?.response?.data || err.message);
      toast.error("Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  // Send reply email to customer (server will send email and mark replied)
  const handleSendReply = async () => {
    if (!replySubject.trim() || !replyBody.trim()) {
      toast.error("Subject and reply message are required");
      return;
    }
    if (!selected || !selected._id) {
      toast.error("No message selected");
      return;
    }

    try {
      setSendingReply(true);

      await api.post(
        `/api/admin/contacts/${selected._id}/reply`,
        {
          subject: replySubject.trim(),
          replyMessage: replyBody.trim(), // <-- send replyBody as replyMessage (backend expects replyMessage)
        },
        { headers }
      );

      toast.success("Reply sent successfully");

      // reset reply fields
      setReplySubject("");
      setReplyBody("");

      // refresh list and clear selection
      await fetchList();
      setSelected(null);
    } catch (err) {
      console.error("Failed to send reply:", err?.response?.data || err.message);
      toast.error(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading contact messages...</div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Customer Contact Messages</h2>

        {/* search + refresh */}
        <div className="mb-4 flex gap-3 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, subject or message..."
            className="border px-3 py-2 rounded flex-1"
          />
          <button onClick={fetchList} className="bg-pink-600 text-white px-4 py-2 rounded">
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List */}
          <div className="md:col-span-2 bg-white rounded shadow p-4">
            {filtered.length === 0 ? (
              <div className="text-gray-500 p-6 text-center">No messages found.</div>
            ) : (
              <div className="space-y-2">
                {filtered.map((m) => (
                  <div
                    key={m._id}
                    className={`p-3 rounded border hover:bg-pink-50 cursor-pointer flex justify-between items-start ${
                      selected && selected._id === m._id ? "bg-pink-50" : "bg-white"
                    }`}
                    onClick={() => handleSelect(m)}
                  >
                    <div>
                      <div className="font-medium">
                        {m.name} <span className="text-xs text-gray-400">({m.email})</span>
                      </div>

                      <div className="text-sm text-gray-600 truncate max-w-xl">{(m.subject ? `${m.subject} — ` : "") + (m.message || "").slice(0, 120)}</div>

                      <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className={`text-xs px-2 py-1 rounded ${m.replied ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {m.replied ? "Replied" : "New"}
                      </div>

                      <div className="text-xs text-gray-400">{m._id?.slice(-6)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail + Reply panel */}
          <div className="bg-white rounded shadow p-4">
            {selected ? (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold">{selected.name}</div>
                    <div className="text-sm text-gray-500">{selected.email}{selected.phone ? ` • ${selected.phone}` : ""}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(selected.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleReplied(selected._id, !!selected.replied)}
                      disabled={updating}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      {selected.replied ? "Mark Unreplied" : "Mark Replied"}
                    </button>

                    <button
                      onClick={() => handleDelete(selected._id)}
                      disabled={deleting}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="text-sm text-gray-800 whitespace-pre-line mb-4">{selected.message}</div>

                <hr className="my-3" />

                {/* Reply form */}
                <div>
                  <h4 className="font-semibold mb-2">Reply to customer</h4>

                  <label className="text-xs text-gray-600">To</label>
                  <div className="text-sm text-gray-700 mb-2">{selected.email}</div>

                  <label className="text-xs text-gray-600">Subject</label>
                  <input
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-2"
                    placeholder="Reply subject"
                  />

                  <label className="text-xs text-gray-600">Message</label>
                  <textarea
                    rows={6}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-2"
                    placeholder="Write your reply here..."
                  />

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setReplySubject(`Re: ${selected.subject || selected.name || "Your message"}`);
                        setReplyBody(`Hi ${selected.name || "Customer"},\n\n`);
                      }}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Reset template
                    </button>

                    <button
                      onClick={handleSendReply}
                      disabled={sendingReply}
                      className="bg-pink-600 text-white px-4 py-2 rounded"
                    >
                      {sendingReply ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500">Select a message to view details and reply</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
