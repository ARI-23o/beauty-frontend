// src/admin/pages/ManageFilters.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

/*
  Admin Filter Manager (Advanced B)
  - Chips for categories & brands (add/delete)
  - Price range builder (label, min, max) with add / edit / delete / reorder
  - Save / Reset / Load from backend
  - Uses adminToken from localStorage for authorization
*/

const ManageFilters = () => {
  const [loading, setLoading] = useState(true);

  // Data model mirrors server FilterOptions
  const [categories, setCategories] = useState([]); // array of strings
  const [brands, setBrands] = useState([]); // array of strings
  const [priceRanges, setPriceRanges] = useState([]); // array of { label, min, max }

  // UI input state
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");

  // Price range input
  const [priceLabel, setPriceLabel] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [editingPriceIndex, setEditingPriceIndex] = useState(-1);

  const token = localStorage.getItem("adminToken");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };

  // Load filters from backend
  const loadFilters = async () => {
    setLoading(true);
    try {
      // ✅ use api with relative URL (no API_BASE)
      const res = await api.get("/api/filters");
      const data = res.data || {};

      // ensure normalized arrays
      setCategories((data.categories || []).map((c) => String(c).trim()));
      setBrands((data.brands || []).map((b) => String(b).trim()));
      setPriceRanges(
        (data.priceRanges || []).map((r) => ({
          label: String(r.label || "").trim(),
          min: Number(r.min ?? 0),
          max: Number(r.max ?? 999999),
        }))
      );
      toast.success("Filters loaded");
    } catch (err) {
      console.error("Failed to load filters:", err);
      toast.error("Failed to load filters from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers — normalize string to single-line trimmed lower-case key for dedupe
  const norm = (s) => (s || "").toString().trim();

  // CATEGORIES
  const addCategory = () => {
    const val = norm(newCategory);
    if (!val) return toast.warn("Enter a category name");
    // case-insensitive dedupe
    if (categories.some((c) => c.toLowerCase() === val.toLowerCase())) {
      setNewCategory("");
      return toast.info("Category already exists");
    }
    setCategories((prev) => [...prev, val]);
    setNewCategory("");
  };

  const removeCategory = (idx) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveCategory = (idx, dir) => {
    setCategories((prev) => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      const [item] = next.splice(idx, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  // BRANDS
  const addBrand = () => {
    const val = norm(newBrand);
    if (!val) return toast.warn("Enter a brand name");
    if (brands.some((b) => b.toLowerCase() === val.toLowerCase())) {
      setNewBrand("");
      return toast.info("Brand already exists");
    }
    setBrands((prev) => [...prev, val]);
    setNewBrand("");
  };

  const removeBrand = (idx) => {
    setBrands((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveBrand = (idx, dir) => {
    setBrands((prev) => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      const [item] = next.splice(idx, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  // PRICE RANGES
  const validatePriceInputs = () => {
    if (!priceLabel.trim()) return "Label required";
    const min = Number(priceMin);
    const max = Number(priceMax);
    if (Number.isNaN(min) || Number.isNaN(max)) return "Min & Max must be numbers";
    if (min < 0 || max < 0) return "Min/Max should be >= 0";
    if (max < min) return "Max should be >= Min";
    return null;
  };

  const addOrUpdatePriceRange = () => {
    const err = validatePriceInputs();
    if (err) return toast.warn(err);

    const r = { label: priceLabel.trim(), min: Number(priceMin), max: Number(priceMax) };

    // If editing
    if (editingPriceIndex >= 0) {
      setPriceRanges((prev) => prev.map((p, i) => (i === editingPriceIndex ? r : p)));
      setEditingPriceIndex(-1);
      setPriceLabel("");
      setPriceMin("");
      setPriceMax("");
      toast.success("Price range updated");
      return;
    }

    // Add new
    setPriceRanges((prev) => [...prev, r]);
    setPriceLabel("");
    setPriceMin("");
    setPriceMax("");
    toast.success("Price range added");
  };

  const editPriceRange = (idx) => {
    const p = priceRanges[idx];
    if (!p) return;
    setPriceLabel(p.label);
    setPriceMin(String(p.min));
    setPriceMax(String(p.max));
    setEditingPriceIndex(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removePriceRange = (idx) => {
    setPriceRanges((prev) => prev.filter((_, i) => i !== idx));
  };

  const movePriceRange = (idx, dir) => {
    setPriceRanges((prev) => {
      const next = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      const [item] = next.splice(idx, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  // SAVE to backend (PUT /api/filters)
  const saveFilters = async () => {
    if (!token) {
      toast.error("Admin not authenticated. Please login as admin.");
      return;
    }

    try {
      const payload = {
        categories: categories.map((c) => c.trim()),
        brands: brands.map((b) => b.trim()),
        priceRanges: priceRanges.map((r) => ({
          label: r.label.trim(),
          min: Number(r.min),
          max: Number(r.max),
        })),
      };

      // ✅ use api with relative URL (no API_BASE)
      await api.put("/api/filters", payload, axiosConfig);
      toast.success("Filters saved");
      // reload to reflect normalization from server
      loadFilters();
    } catch (err) {
      console.error("Failed to save filters:", err);
      const msg = err?.response?.data?.message || "Failed to save filters";
      toast.error(msg);
    }
  };

  const resetToServer = () => {
    loadFilters();
  };

  const clearAll = () => {
    setCategories([]);
    setBrands([]);
    setPriceRanges([]);
    setNewCategory("");
    setNewBrand("");
    setPriceLabel("");
    setPriceMin("");
    setPriceMax("");
    setEditingPriceIndex(-1);
    toast.info("Local filters cleared (not saved on server)");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin — Manage Filters</h1>
        <p className="text-sm text-gray-600 mb-6">
          Manage categories, brands and price ranges used by the Shop page filters. After making changes press{" "}
          <strong>Save</strong>.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: quick actions */}
          <div className="col-span-1 bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-3">Actions</h2>

            <div className="space-y-3">
              <button
                onClick={saveFilters}
                className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
              >
                Save to server
              </button>

              <button
                onClick={resetToServer}
                className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50 transition"
              >
                Reload from server
              </button>

              <button
                onClick={clearAll}
                className="w-full bg-yellow-100 text-yellow-800 py-2 rounded hover:bg-yellow-200 transition"
              >
                Clear locally
              </button>

              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Note: Server-side validation will normalize entries (trim). Make sure values are unique.
                </p>
              </div>
            </div>
          </div>

          {/* MIDDLE: categories & brands */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {/* CATEGORIES */}
            <section className="bg-white rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-3">Categories</h2>

              <div className="flex gap-2 mb-3">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add category (e.g. skincare)"
                  className="flex-1 border px-3 py-2 rounded"
                />
                <button
                  onClick={addCategory}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.length === 0 && <div className="text-gray-500">No categories yet.</div>}

                {categories.map((c, idx) => (
                  <div
                    key={c + "-" + idx}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm font-medium capitalize">{c}</span>
                    <div className="flex items-center gap-1">
                      <button
                        title="Move up"
                        onClick={() => moveCategory(idx, -1)}
                        className="text-xs px-2 py-1 hover:bg-gray-200 rounded"
                      >
                        ▲
                      </button>
                      <button
                        title="Move down"
                        onClick={() => moveCategory(idx, 1)}
                        className="text-xs px-2 py-1 hover:bg-gray-200 rounded"
                      >
                        ▼
                      </button>
                      <button
                        title="Remove"
                        onClick={() => removeCategory(idx)}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* BRANDS */}
            <section className="bg-white rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-3">Brands</h2>

              <div className="flex gap-2 mb-3">
                <input
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Add brand (e.g. GlowCo)"
                  className="flex-1 border px-3 py-2 rounded"
                />
                <button
                  onClick={addBrand}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {brands.length === 0 && <div className="text-gray-500">No brands yet.</div>}

                {brands.map((b, idx) => (
                  <div
                    key={b + "-" + idx}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm font-medium capitalize">{b}</span>
                    <div className="flex items-center gap-1">
                      <button
                        title="Move up"
                        onClick={() => moveBrand(idx, -1)}
                        className="text-xs px-2 py-1 hover:bg-gray-200 rounded"
                      >
                        ▲
                      </button>
                      <button
                        title="Move down"
                        onClick={() => moveBrand(idx, 1)}
                        className="text-xs px-2 py-1 hover:bg-gray-200 rounded"
                      >
                        ▼
                      </button>
                      <button
                        title="Remove"
                        onClick={() => removeBrand(idx)}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PRICE RANGES */}
            <section className="bg-white rounded-lg p-4 shadow">
              <h2 className="text-lg font-semibold mb-3">Price Ranges</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <input
                  value={priceLabel}
                  onChange={(e) => setPriceLabel(e.target.value)}
                  placeholder="Label (e.g. Under ₹499)"
                  className="border px-3 py-2 rounded col-span-1 md:col-span-1"
                />
                <input
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  type="number"
                  min="0"
                  className="border px-3 py-2 rounded"
                />
                <input
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  type="number"
                  min="0"
                  className="border px-3 py-2 rounded"
                />
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={addOrUpdatePriceRange}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingPriceIndex >= 0 ? "Update range" : "Add range"}
                </button>
                {editingPriceIndex >= 0 && (
                  <button
                    onClick={() => {
                      setEditingPriceIndex(-1);
                      setPriceLabel("");
                      setPriceMin("");
                      setPriceMax("");
                    }}
                    className="bg-gray-100 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {priceRanges.length === 0 && (
                  <div className="text-gray-500">No price ranges defined.</div>
                )}

                {priceRanges.map((r, idx) => (
                  <div
                    key={r.label + "-" + idx}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-sm text-gray-600">
                        ₹{r.min} — ₹{r.max}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        title="Move up"
                        onClick={() => movePriceRange(idx, -1)}
                        className="px-2 py-1 hover:bg-gray-200 rounded"
                      >
                        ▲
                      </button>
                      <button
                        title="Move down"
                        onClick={() => movePriceRange(idx, 1)}
                        className="px-2 py-1 hover:bg-gray-200 rounded"
                      >
                        ▼
                      </button>
                      <button
                        title="Edit"
                        onClick={() => editPriceRange(idx)}
                        className="px-2 py-1 hover:bg-gray-200 rounded"
                      >
                        ✎
                      </button>
                      <button
                        title="Remove"
                        onClick={() => removePriceRange(idx)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <strong>Tip:</strong> After saving, the Shop page will pick the updated filters. You can also manage
          categories from the Manage Products page — make sure values match (case-insensitive).
        </div>
      </div>
    </div>
  );
};

export default ManageFilters;
