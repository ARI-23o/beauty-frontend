import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../api";




const ManageFilters = () => {
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceRanges: [],
  });

  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newRange, setNewRange] = useState({ label: "", min: "", max: "" });

  const token = localStorage.getItem("adminToken");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Load current filter settings
  const loadFilters = async () => {
    try {
      const res = await api.get(`${API_BASE}/api/filters`);
      setFilters(res.data);
    } catch (err) {
      toast.error("Failed to load filters");
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  const saveFilters = async () => {
    try {
      await api.put(`${API_BASE}/api/filters`, filters, axiosConfig);
      toast.success("Filters updated successfully!");
      loadFilters();
    } catch (err) {
      toast.error("Failed to update filters");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-4">Manage Filters</h2>

      {/* Categories */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h3 className="text-xl font-semibold mb-3">Categories</h3>

        <div className="space-y-2 mb-4">
          {filters.categories.map((cat, i) => (
            <div
              key={i}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span className="capitalize">{cat}</span>
              <button
                className="text-red-600"
                onClick={() => {
                  const updated = filters.categories.filter((c) => c !== cat);
                  setFilters({ ...filters, categories: updated });
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={() => {
              if (!newCategory.trim()) return;
              setFilters({
                ...filters,
                categories: [...filters.categories, newCategory.toLowerCase()],
              });
              setNewCategory("");
            }}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* Brands */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h3 className="text-xl font-semibold mb-3">Brands</h3>

        <div className="space-y-2 mb-4">
          {filters.brands.map((brand, i) => (
            <div
              key={i}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span className="capitalize">{brand}</span>
              <button
                className="text-red-600"
                onClick={() => {
                  const updated = filters.brands.filter((b) => b !== brand);
                  setFilters({ ...filters, brands: updated });
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="New Brand"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={() => {
              if (!newBrand.trim()) return;
              setFilters({
                ...filters,
                brands: [...filters.brands, newBrand.toLowerCase()],
              });
              setNewBrand("");
            }}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* Price ranges */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h3 className="text-xl font-semibold mb-3">Price Ranges</h3>

        <div className="space-y-2 mb-4">
          {filters.priceRanges.map((range, i) => (
            <div
              key={i}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>
                {range.label} — ₹{range.min} to ₹{range.max}
              </span>
              <button
                className="text-red-600"
                onClick={() => {
                  const updated = filters.priceRanges.filter((r) => r !== range);
                  setFilters({ ...filters, priceRanges: updated });
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <input
            value={newRange.label}
            onChange={(e) =>
              setNewRange({ ...newRange, label: e.target.value })
            }
            placeholder="Label"
            className="border p-2 rounded"
          />
          <input
            type="number"
            value={newRange.min}
            onChange={(e) =>
              setNewRange({ ...newRange, min: e.target.value })
            }
            placeholder="Min"
            className="border p-2 rounded"
          />
          <input
            type="number"
            value={newRange.max}
            onChange={(e) =>
              setNewRange({ ...newRange, max: e.target.value })
            }
            placeholder="Max"
            className="border p-2 rounded"
          />
        </div>

        <button
          onClick={() => {
            if (!newRange.label || !newRange.min || !newRange.max) return;
            setFilters({
              ...filters,
              priceRanges: [...filters.priceRanges, newRange],
            });
            setNewRange({ label: "", min: "", max: "" });
          }}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          Add Range
        </button>
      </div>

      <button
        onClick={saveFilters}
        className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg"
      >
        Save All Filters
      </button>
    </div>
  );
};

export default ManageFilters;
