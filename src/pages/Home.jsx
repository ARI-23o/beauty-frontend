import React from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

const categories = [
  { name: "Face", image: "https://images.unsplash.com/photo-1610878180933-123728c1f8c7?auto=format&fit=crop&w=900&q=80" },
  { name: "Eyes", image: "https://images.unsplash.com/photo-1619782257043-3a70949f1d5a?auto=format&fit=crop&w=900&q=80" },
  { name: "Lips", image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9f0?auto=format&fit=crop&w=900&q=80" },
  { name: "Skincare", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80" },
  { name: "Haircare", image: "https://images.unsplash.com/photo-1620912189861-2b8c2b3a53ce?auto=format&fit=crop&w=900&q=80" },
  { name: "Body Care", image: "https://images.unsplash.com/photo-1600181951055-3c3a0a68c8a3?auto=format&fit=crop&w=900&q=80" },
  { name: "Nail Care", image: "https://images.unsplash.com/photo-1620799139449-2a9a7bafc61c?auto=format&fit=crop&w=900&q=80" },
];

const Home = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center text-center overflow-hidden">
        <img
          src="https://copilot.microsoft.com/th/id/BCO.a12bcf31-108a-4613-903f-ba10e3e9a69c.png"
          alt="Luxury Beauty Banner"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
        />

        <div className="relative z-10 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-light tracking-wide text-white mb-4"
          >
            Discover Your <span className="font-semibold">True Glow</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-white/80 text-lg md:text-xl mb-8"
          >
            Experience luxury skincare and beauty products curated for you.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/shop")}
            className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium shadow-md hover:bg-gray-100 transition-all"
          >
            Shop Now
          </motion.button>
        </div>
      </section>

      {/* Category Section (Horizontal Scroll) */}
      <section className="py-16 px-6 md:px-16 bg-gray-50">
        <h2 className="text-3xl font-semibold text-center mb-10">
          Shop by Category
        </h2>
        <div
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2 pb-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/shop")}
              className="min-w-[220px] sm:min-w-[260px] snap-center relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg flex-shrink-0"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-64 object-cover group-hover:brightness-90 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <h3 className="text-white text-2xl font-light tracking-wide">
                  {cat.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-6 md:px-16">
        <h2 className="text-3xl font-semibold text-center mb-10">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
            >
              <img
                src={`https://source.unsplash.com/600x600/?cosmetics,beauty,product,${i}`}
                alt={`Product ${i}`}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 text-center">
                <h4 className="text-lg font-medium mb-2">
                  Luxury Product {i}
                </h4>
                <p className="text-gray-500 mb-2">
                  ₹{(i * 1499).toLocaleString("en-IN")}
                </p>
                <button
                  onClick={() =>
                    addToCart({
                      id: `featured-${i}`,
                      name: `Luxury Product ${i}`,
                      price: i * 1499,
                    })
                  }
                  className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800 transition"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
