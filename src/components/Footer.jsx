import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaPinterestP } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white pt-12 pb-6 mt-16">
      <div className="container mx-auto px-6 md:px-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-semibold mb-3 tracking-wide">
              Beauty<span className="text-pink-400">E</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Elevating your beauty experience with curated luxury skincare and
              makeup essentials. Discover your glow every day.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-pink-400 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-pink-400 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-pink-400 transition-colors duration-200"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-pink-400 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-pink-400 transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-pink-400 uppercase tracking-wider">
              Customer Care
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link
                  to="/returns"
                  className="hover:text-pink-400 transition-colors duration-200"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-pink-400 transition-colors duration-200"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-pink-400 transition-colors duration-200"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-pink-400 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-pink-400 uppercase tracking-wider">
              Stay Connected
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for exclusive deals and new arrivals.
            </p>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-3 py-2 rounded-l-md text-gray-800 text-sm outline-none"
              />
              <button className="bg-pink-500 px-4 py-2 rounded-r-md text-sm hover:bg-pink-400 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2025 BeautyE — Crafted with 💖 for timeless beauty.</p>

          <div className="flex space-x-4 text-lg">
            <a
              href="#"
              className="hover:text-pink-400 transition-transform transform hover:scale-110"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="hover:text-pink-400 transition-transform transform hover:scale-110"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              className="hover:text-pink-400 transition-transform transform hover:scale-110"
            >
              <FaTwitter />
            </a>
            <a
              href="#"
              className="hover:text-pink-400 transition-transform transform hover:scale-110"
            >
              <FaPinterestP />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
