// src/components/Navbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaBars, FaSearch, FaShoppingBag, FaTimes, FaUserCircle, FaHeart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import api from "../api";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { cartItems, clearCartOnLogout } = useCart();
  const navigate = useNavigate();

  // Search variables
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search history
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Refs
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const profileRef = useRef(null);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const loadUserFromStorage = () => {
    const raw = localStorage.getItem("user");
    try {
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  };

  const getUserId = () => {
    if (!user) return null;
    return user.id || user._id || null;
  };

  useEffect(() => {
    loadUserFromStorage();

    const handleStorage = (e) => {
      if (e.key === "user" || e.key === "token") loadUserFromStorage();
    };

    const handleAuthChanged = () => {
      loadUserFromStorage();
    };

    const handleFavoritesChanged = () => {
      fetchFavoritesCount();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-changed", handleAuthChanged);
    window.addEventListener("favorites-changed", handleFavoritesChanged);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener("favorites-changed", handleFavoritesChanged);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Whenever user changes, refresh count & history
    fetchFavoritesCount();
    fetchHistory();
    // eslint-disable-next-line
  }, [user]);

  const fetchFavoritesCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFavoritesCount(0);
      return;
    }
    try {
      const res = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavoritesCount(Array.isArray(res.data.favorites) ? res.data.favorites.length : 0);
    } catch (err) {
      setFavoritesCount(0);
    }
  };

  // Fetch product suggestions (debounced)
  useEffect(() => {
    const fetchSuggestions = async () => {
      const term = (searchTerm || "").trim();
      if (!term) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const res = await api.get(`/api/products?search=${encodeURIComponent(term)}`);
        setSuggestions(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const t = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Load search history (server)
  const fetchHistory = async () => {
    const userId = getUserId();
    if (!userId) {
      setSearchHistory([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/search-history/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = res.data.history || [];
      const list = Array.isArray(raw)
        ? raw
            .map((h) =>
              typeof h === "string"
                ? h
                : h.keyword || h.term || h.search || h.q || ""
            )
            .filter(Boolean)
        : [];

      setSearchHistory(list);
    } catch (err) {
      console.error("Navbar history load failed:", err);
      setSearchHistory([]);
    }
  };

  const handleLogout = () => {
    clearCartOnLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("serverCart");
    window.dispatchEvent(new Event("auth-changed"));
    window.dispatchEvent(new Event("favorites-changed"));
    setUser(null);
    navigate("/login");
  };

  // Click-outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isInsideSearch =
        desktopSearchRef.current?.contains(e.target) || mobileSearchRef.current?.contains(e.target);
      const isInsideDropdown = e.target.closest(".dropdown");
      if (!isInsideSearch && !isInsideDropdown) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product) => {
    if (!product?._id) return;
    navigate(`/product/${product._id}`);
    setSearchTerm("");
    setSuggestions([]);
    setShowHistory(false);
    setMenuOpen(false);
  };

  const saveTermToHistory = async (term) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/api/search-history/${userId}/add`,
        { keyword: term, term },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchHistory();
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  const clearSearchHistory = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/search-history/${userId}/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  // when user submits search in navbar: send to shop and clear input (auto-clear)
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    const term = (searchTerm || "").trim();
    if (!term) return;
    await saveTermToHistory(term);
    setShowHistory(false);
    setShowSuggestions(false);
    setMenuOpen(false);
    setSearchTerm(""); // auto-clear input
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  const handleHistoryClick = async (term) => {
    await saveTermToHistory(term);
    setShowHistory(false);
    setShowSuggestions(false);
    setSearchTerm(""); // clear after submit
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-6 md:px-16 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-semibold tracking-wide text-gray-900">
          Beauty<span className="text-pink-500">E</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-lg font-medium ${
                  isActive
                    ? "text-pink-500 border-b-2 border-pink-500 pb-1"
                    : "text-gray-700 hover:text-pink-500"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center space-x-4">
          {/* Desktop search */}
          <div className="relative hidden md:block w-64" ref={desktopSearchRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border rounded-full px-3 py-1 bg-white relative z-[60]"
            >
              <input
                type="text"
                placeholder={
                  searchHistory && searchHistory.length > 0
                    ? `Last: ${searchHistory[0]}`
                    : "Search products..."
                }
                value={searchTerm}
                onFocus={() => {
                  fetchHistory();
                  setShowHistory(true);
                }}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow outline-none text-sm text-gray-700"
              />
              <button type="submit" className="text-gray-600 hover:text-pink-500">
                <FaSearch />
              </button>
            </form>

            {/* Recent Searches */}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute bg-white shadow-lg rounded-lg w-full mt-2 border z-[9999] pointer-events-auto">
                <div className="flex justify-between items-center px-3 py-2 text-gray-500 text-sm">
                  <span>Recent Searches</span>
                  <button
                    onClick={clearSearchHistory}
                    className="text-pink-500 hover:text-pink-600 text-xs font-medium"
                  >
                    Clear All
                  </button>
                </div>
                {searchHistory.slice(0, 5).map((h, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleHistoryClick(h)}
                    className="px-3 py-2 hover:bg-pink-50 cursor-pointer text-sm"
                  >
                    {h}
                  </div>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute bg-white shadow-lg rounded-lg w-full mt-2 border z-[9999] max-h-60 overflow-y-auto pointer-events-auto">
                {suggestions.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleSelectProduct(p)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-pink-50 cursor-pointer"
                  >
                    <img
                      src={p.image || ""}
                      alt={p.name}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/64")}
                    />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favorites */}
          <Link to="/favorites" className="relative text-gray-800 hover:text-pink-500">
            <FaHeart className="text-xl" />
            {favoritesCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-1.5 rounded-full">
                {favoritesCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative text-gray-800 hover:text-pink-500">
            <FaShoppingBag className="text-xl" />
            {cartItems?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-1.5 rounded-full">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Profile / Login */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="text-gray-800 hover:text-pink-500 transition"
              >
                <FaUserCircle className="text-3xl" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white shadow-lg rounded-xl border p-4 animate-fadeIn z-[80]">
                  <p className="text-gray-800 font-medium">{user.name}</p>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  {user.mobile && <p className="text-gray-600 text-sm">📱 {user.mobile}</p>}
                  <hr className="my-3" />
                  <button
                    onClick={() => {
                      navigate("/my-orders");
                      setProfileOpen(false);
                    }}
                    className="w-full text-left text-gray-700 hover:text-pink-600 py-1"
                  >
                    📦 My Orders
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setProfileOpen(false);
                    }}
                    className="w-full text-left text-red-600 hover:text-red-700 py-1"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/login"
                className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm hover:bg-pink-600"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="border border-pink-500 text-pink-500 px-4 py-2 rounded-full text-sm hover:bg-pink-50"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-2 text-2xl"
            onClick={() => setMenuOpen((m) => !m)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-sm">
          <div className="p-4">
            <form onSubmit={handleSearchSubmit} ref={mobileSearchRef} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
              />
              <button type="submit" className="bg-pink-500 text-white px-3 py-2 rounded">
                <FaSearch />
              </button>
            </form>

            <nav className="mt-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 px-3 rounded hover:bg-pink-50 text-gray-700"
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 mt-3">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 bg-pink-500 text-white py-2 rounded text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 border border-pink-500 text-pink-500 py-2 rounded text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              {user && (
                <button
                  onClick={() => {
                    navigate("/my-orders");
                    setMenuOpen(false);
                  }}
                  className="text-left py-2 px-3 rounded hover:bg-pink-50"
                >
                  My Orders
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
