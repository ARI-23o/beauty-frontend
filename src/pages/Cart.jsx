// src/pages/Cart.jsx 
import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";

const Cart = () => {
  const { cartItems, addToCart, removeFromCart, deleteFromCart, totalAmount } =
    useCart();
  const navigate = useNavigate();

  // ✅ INR formatting
  const formatPrice = (amount) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });

  // ✅ Empty Cart View
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50 min-h-[80vh] text-center">
        <div className="text-pink-500 mb-6">
          <FaShoppingCart className="text-7xl mx-auto opacity-80 animate-bounce" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-700 mb-3">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven’t added anything yet.
        </p>
        <Link
          to="/shop"
          className="bg-pink-500 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-600 transition shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-20 py-24 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-semibold mb-10 text-gray-800 text-center">
        Your Cart
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {/* 🧺 Cart Items */}
        <div className="md:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.productId || item._id}
              className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg shadow-sm"
                />
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {item.name}
                  </h3>
                  <p className="text-gray-500">{formatPrice(item.price)}</p>
                </div>
              </div>

              {/* ✅ Quantity Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-pink-100 hover:text-pink-500 transition"
                >
                  <FaMinus />
                </button>

                <span className="px-3 font-medium text-gray-800">
                  {item.quantity}
                </span>

                <button
                  onClick={() => addToCart({ ...item })}
                  className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-pink-100 hover:text-pink-500 transition"
                >
                  <FaPlus />
                </button>

                <button
                  onClick={() => deleteFromCart(item.productId)}
                  className="text-red-500 hover:text-red-600 ml-3"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 💰 Summary */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <h3 className="text-2xl font-semibold mb-5 text-gray-800">
            Order Summary
          </h3>

          <div className="flex justify-between text-gray-700 mb-3">
            <span>Subtotal</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>

          <div className="flex justify-between text-gray-700 mb-3">
            <span>Shipping</span>
            <span className="font-medium text-green-600">Free</span>
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="flex justify-between text-xl font-semibold text-gray-900 mb-6">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>

          {/* ✅ Checkout Button */}
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-pink-500 text-white py-3 rounded-full text-lg font-medium hover:bg-pink-600 transition shadow-md"
          >
            Proceed to Checkout
          </button>

          {/* 🛍 Continue Shopping */}
          <Link
            to="/shop"
            className="block w-full text-center mt-4 border border-pink-500 text-pink-500 py-2 rounded-full font-medium hover:bg-pink-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
