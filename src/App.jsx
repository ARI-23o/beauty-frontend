// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AddToCartToast from "./components/AddToCartToast";
import { useCart } from "./context/CartContext";

// public
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RateOrder from "./pages/RateOrder"; 
import Favorites from "./pages/Favorites";
import TrackOrder from "./pages/TrackOrder";
import Returns from "./pages/Returns.jsx";
import FAQ from "./pages/FAQ.jsx";
import Shipping from "./pages/Shipping.jsx";
import Privacy from "./pages/Privacy.jsx";

// admin
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";
import ManageProducts from "./admin/pages/ManageProducts";
import ManageOrders from "./admin/pages/ManageOrders";
import ManageUsers from "./admin/pages/ManageUsers";
import OrderDetailAdmin from "./admin/pages/OrderDetail";
import ManageFilters from "./admin/pages/ManageFilters";
import ManageContacts from "./admin/pages/ManageContacts.jsx";

function App() {
  const { toastMessage, setToastMessage } = useCart();

  if (toastMessage) {
    setTimeout(() => setToastMessage(""), 2000);
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white flex flex-col">

        <AddToCartToast show={toastMessage !== ""} productName={toastMessage} />

        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>

            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thankyou" element={<ThankYou />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/rate-order/:token" element={<RateOrder />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
            <Route path="/returns" element={<Returns />} />
<Route path="/faq" element={<FAQ />} />
<Route path="/shipping" element={<Shipping />} />
<Route path="/privacy" element={<Privacy />} />

            {/* Admin Login */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />

            {/* 🔥 NEW: Fix for missing analytics route */}
            <Route
              path="/admin/analytics"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
             <Route
              path="/admin/contacts"
              element={
                <ProtectedAdminRoute>
                  <ManageContacts  />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/admin/manage-filters"
              element={
                <ProtectedAdminRoute>
                  <ManageFilters />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedAdminRoute>
                  <ManageProducts />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedAdminRoute>
                  <ManageOrders />
                </ProtectedAdminRoute>
              }
            />

            {/* 🔥 FIX: Add missing detail route for admin orders */}
            <Route
              path="/admin/orders/detail/:id"
              element={
                <ProtectedAdminRoute>
                  <OrderDetailAdmin />
                </ProtectedAdminRoute>
              }
            />

            {/* Keep this old route if any component still uses it */}
            <Route
              path="/admin/orders/:id"
              element={
                <ProtectedAdminRoute>
                  <OrderDetailAdmin />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedAdminRoute>
                  <ManageUsers />
                </ProtectedAdminRoute>
              }
            />

          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
