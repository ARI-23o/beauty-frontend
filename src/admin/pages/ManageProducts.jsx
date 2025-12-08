// src/admin/pages/ManageProducts.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    category: "",
    newCategory: "",
    image: "",
    images: [],
    video: "",
    countInStock: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Persistent copies of uploaded URLs for debugging
  const [uploadedImagesUrls, setUploadedImagesUrls] = useState([]); // persistent uploaded image URLs
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");     // persistent uploaded video URL

  const token = localStorage.getItem("adminToken");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const imageFileRef = useRef(null);
  const videoFileRef = useRef(null);

  const [tempImages, setTempImages] = useState([]); // { file, preview }
  const [tempVideo, setTempVideo] = useState(null); // { file, preview }

  /* ---------------------------------------------------------
      LOAD PRODUCTS
  ----------------------------------------------------------*/
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products`);
      const data = Array.isArray(res.data) ? res.data : [];

      setProducts(data);

      const cats = [
        ...new Set(
          data
            .map((p) => (p.category ? p.category.toString().toLowerCase() : ""))
            .filter(Boolean)
        ),
      ];
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------------------------------------------------
      HANDLE INPUTS
  ----------------------------------------------------------*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* ---------------------------------------------------------
      SELECT IMAGES (UP TO 5)
  ----------------------------------------------------------*/
  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const selected = files.slice(0, 5);

    const previews = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setTempImages(previews);
  };

  /* ---------------------------------------------------------
      SELECT VIDEO
  ----------------------------------------------------------*/
  const handleVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTempVideo({
      file,
      preview: URL.createObjectURL(file),
    });
  };

  /* ---------------------------------------------------------
      UPLOAD FILES TO CLOUDINARY (and persist URLs into formData)
      - persistToForm: if true, the returned URLs are merged into formData.images / formData.image and formData.video
      - this allows user to click "Upload Selected" and then later click "Add Product" (temp previews cleared but URLs remain)
  ----------------------------------------------------------*/
  const uploadSelectedFiles = async ({ persistToForm = true } = {}) => {
    if (tempImages.length === 0 && !tempVideo) return { images: [], video: "" };

    setUploading(true);
    try {
      let uploadedImages = [];
      let uploadedVideo = "";

      /* --- Upload ALL IMAGES --- */
      if (tempImages.length > 0) {
        const fd = new FormData();
        tempImages.forEach((t) => fd.append("images", t.file));

        const res = await axios.post(
          `${API_BASE}/api/products/upload-images`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        uploadedImages = res.data.images || [];
        // debug
        console.log("Uploaded images (cloudinary):", uploadedImages);
      }

      /* --- Upload VIDEO --- */
      if (tempVideo) {
        const fd = new FormData();
        fd.append("video", tempVideo.file);

        const res = await axios.post(
          `${API_BASE}/api/products/upload-video`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        uploadedVideo = res.data.video || "";
        console.log("Uploaded video (cloudinary):", uploadedVideo);
      }

      // Persist returned URLs to component/form state so they are available when user clicks Add Product later.
      if (persistToForm) {
        setFormData((prev) => {
          const merged = [...(prev.images || []), ...uploadedImages].slice(0, 5);
          const primary = prev.image || merged[0] || "";
          return {
            ...prev,
            images: merged,
            image: primary,
            video: prev.video || uploadedVideo || "",
          };
        });

        // debugging copies
        setUploadedImagesUrls((prev) => {
          const merged = [...prev, ...uploadedImages].slice(0, 5);
          return merged;
        });
        if (uploadedVideo) setUploadedVideoUrl(uploadedVideo);
      }

      return { images: uploadedImages, video: uploadedVideo };
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");
      return { images: [], video: "" };
    } finally {
      // revoke previews and clear temp states (we already persisted the uploaded URLs if persistToForm was true)
      try {
        tempImages.forEach((t) => {
          if (t.preview) URL.revokeObjectURL(t.preview);
        });
      } catch (e) {
        // ignore
      }
      if (tempVideo && tempVideo.preview) {
        try {
          URL.revokeObjectURL(tempVideo.preview);
        } catch (e) {}
      }

      setTempImages([]);
      setTempVideo(null);
      setUploading(false);
    }
  };

  /* ---------------------------------------------------------
      SUBMIT FORM (CREATE/UPDATE)
  ----------------------------------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If user hasn't clicked "Upload Selected" but there are temp files, upload them now.
    const { images: newImgs, video: newVid } = await uploadSelectedFiles({ persistToForm: true });

    // final images: combine already-saved (in formData.images) with newly uploaded (newImgs) and limit to 5
    const finalImages = [...(formData.images || []), ...(newImgs || [])].slice(0, 5);

    // primary image: preserve formData.image if set, otherwise pick first of finalImages
    const finalPrimary = formData.image || finalImages[0] || "";

    const finalVideo = formData.video || newVid || "";

    let finalCategory = formData.category;
    if (finalCategory === "new") {
      finalCategory = formData.newCategory.trim().toLowerCase();
    }

    const payload = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      price: Number(formData.price),
      category: finalCategory,
      description: formData.description.trim(),
      image: finalPrimary,
      images: finalImages,
      video: finalVideo,
      countInStock: Number(formData.countInStock || 0),
    };

    // debug: show payload in console so you can verify images array before sending
    console.log("Saving product payload:", payload);

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/api/products/${editingId}`,
          payload,
          axiosConfig
        );
        toast.success("Product updated");
      } else {
        await axios.post(
          `${API_BASE}/api/products`,
          payload,
          axiosConfig
        );
        toast.success("Product added");
      }

      // Reset
      setFormData({
        name: "",
        brand: "",
        price: "",
        category: "",
        newCategory: "",
        image: "",
        images: [],
        video: "",
        countInStock: "",
        description: "",
      });

      setEditingId(null);
      setUploadedImagesUrls([]);
      setUploadedVideoUrl("");
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Error saving product");
    }
  };

  /* ---------------------------------------------------------
      EDIT PRODUCT
  ----------------------------------------------------------*/
  const handleEdit = (p) => {
    setFormData({
      name: p.name || "",
      brand: p.brand || "",
      price: p.price || "",
      category: p.category || "",
      newCategory: "",
      image: p.image || "",
      images: p.images || [],
      video: p.video || "",
      countInStock: p.countInStock || "",
      description: p.description || "",
    });

    // set debug copies to reflect what is currently saved on product
    setUploadedImagesUrls(p.images ? [...p.images].slice(0, 5) : []);
    setUploadedVideoUrl(p.video || "");

    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------------------------------------------------
      DELETE PRODUCT
  ----------------------------------------------------------*/
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(`${API_BASE}/api/products/${id}`, axiosConfig);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete product");
    }
  };

  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

  /* ---------------------------------------------------------
      UI
  ----------------------------------------------------------*/
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6">Manage Products</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow"
      >
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="border p-2 rounded"
        />

        <input
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="border p-2 rounded"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {cap(c)}
            </option>
          ))}
          <option value="new">+ Add New Category</option>
        </select>

        {formData.category === "new" && (
          <input
            name="newCategory"
            value={formData.newCategory}
            onChange={handleChange}
            placeholder="Enter new category"
            className="border p-2 rounded md:col-span-2"
          />
        )}

        {/* Primary image auto-fills */}
        <input
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Primary Image URL"
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="countInStock"
          value={formData.countInStock}
          onChange={handleChange}
          placeholder="Stock"
          className="border p-2 rounded"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 rounded md:col-span-2"
        ></textarea>

        {/* Upload controls */}
        <div className="md:col-span-2">
          <div className="flex gap-6 items-center">
            <div>
              <label className="font-medium">Images (max 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={imageFileRef}
                onChange={handleImageFiles}
                className="mt-1"
              />
            </div>

            <div>
              <label className="font-medium">Video</label>
              <input
                type="file"
                accept="video/*"
                ref={videoFileRef}
                onChange={handleVideoFile}
                className="mt-1"
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                // explicitly persist uploaded URLs into the form so they remain after clearing previews
                const result = await uploadSelectedFiles({ persistToForm: true });
                if ((result.images && result.images.length) || result.video) {
                  toast.success("Files uploaded and saved to form");
                } else {
                  toast.info("No files uploaded");
                }
              }}
              disabled={uploading}
              className="bg-gray-200 px-3 py-2 rounded"
            >
              {uploading ? "Uploading..." : "Upload Selected"}
            </button>
          </div>

          {/* TEMP PREVIEWS */}
          {tempImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {tempImages.map((t, i) => (
                <img
                  key={i}
                  src={t.preview}
                  className="h-24 w-full object-cover rounded"
                  alt={`preview-${i}`}
                />
              ))}
            </div>
          )}

          {tempVideo && (
            <div className="mt-3">
              <video src={tempVideo.preview} controls className="max-h-40 rounded"></video>
            </div>
          )}

          {/* ALWAYS-VISIBLE DEBUG THUMBNAILS (Option A) */}
          <div className="mt-4">
            <label className="font-medium">Uploaded Images (debug)</label>
            <div className="flex gap-2 mt-2">
              {
                // use uploadedImagesUrls first; fallback to formData.images so thumbnails show for edit states too
                (uploadedImagesUrls.length ? uploadedImagesUrls : formData.images || []).map((u, i) => (
                  <div key={i} className="w-16 h-16 overflow-hidden rounded border">
                    <img
                      src={u}
                      alt={`uploaded-${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              }
              {((uploadedImagesUrls.length === 0) && (formData.images || []).length === 0) && (
                <div className="text-sm text-gray-500 ml-1">No uploaded images yet</div>
              )}
            </div>
          </div>
        </div>

        {/* SAVED IMAGES (the ones that will be sent in payload) */}
        <div className="md:col-span-2 grid grid-cols-6 gap-2 mt-2">
          {formData.images.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} className="h-20 w-full object-cover rounded" alt={`saved-${i}`} />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    images: prev.images.filter((u) => u !== img),
                  }))
                }
                className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* SAVED VIDEO */}
        {formData.video && (
          <div className="md:col-span-2 mt-3">
            <video src={formData.video} controls className="max-h-40 w-full rounded"></video>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, video: "" }))}
              className="text-red-600 text-sm"
            >
              Remove video
            </button>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded md:col-span-2"
        >
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* PRODUCT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {products.map((p) => (
          <div key={p._id} className="p-4 bg-white rounded shadow">
            <img
              src={p.image || (p.images && p.images[0]) || ""}
              className="h-40 w-full object-cover rounded"
              alt={p.name}
            />
            <h3 className="font-bold mt-2">{p.name}</h3>
            <p>{p.brand}</p>
            <p className="font-semibold">₹{p.price}</p>

            <div className="flex justify-between mt-3">
              <button
                onClick={() => handleEdit(p)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
