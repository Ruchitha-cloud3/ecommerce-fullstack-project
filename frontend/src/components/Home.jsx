import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import axios from "axios";

function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { addToCart, cartItems } = useContext(CartContext);
  const addToWishlist = (product) => {
  const savedWishlist = JSON.parse(
    localStorage.getItem("wishlist") || "[]"
  );

  const alreadyExists = savedWishlist.some(
    (item) => item.id === product.id
  );

  if (alreadyExists) {
    return;
  }

  const updatedWishlist = [...savedWishlist, product];

  localStorage.setItem(
    "wishlist",
    JSON.stringify(updatedWishlist)
  );
};

  useEffect(() => {
    axios
      .get("ecommerce-fullstack-project-production-7599.up.railway.app/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Total quantity in cart
  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  // Search products
  const filteredProducts = products.filter((item) => {
    const productName = item?.name ? String(item.name) : "";

    return productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">

            <Link
              to="/home"
              className="text-gray-700 font-semibold hover:text-blue-600 transition duration-300"
            >
              Home
            </Link>

            <Link
              to="/categories"
              className="text-gray-700 font-semibold hover:text-blue-600 transition duration-300"
            >
              Categories
            </Link>

            <Link
              to="/wishlist"
              className="text-gray-700 font-semibold hover:text-pink-600 transition duration-300"
            >
              ❤️ Wishlist
            </Link>

            <Link
              to="/cart"
              className="text-gray-700 font-semibold hover:text-green-600 transition duration-300"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="ml-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              className="text-gray-700 font-semibold hover:text-purple-600 transition duration-300"
            >
              👤 Profile
            </Link>

            <Link
              to="/logout"
              className="text-gray-700 font-semibold hover:text-red-600 transition duration-300"
            >
              Logout
            </Link>
            <Link
              to="/my-orders"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              My Orders
            </Link>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">

        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-3xl p-8 sm:p-12 text-white shadow-xl">

          <div className="max-w-3xl">

            <p className="text-sm sm:text-base font-semibold uppercase tracking-wider mb-3">
              Welcome to Our Store
            </p>

            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Shop Your Favorites
            </h1>

            <p className="text-blue-100 text-base sm:text-lg mb-7">
              Discover quality products at great prices and enjoy a simple
              shopping experience.
            </p>

            {/* Search */}
            <div className="relative w-full max-w-2xl">

              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-4 pr-12 rounded-xl text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30"
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">
                🔍
              </span>

            </div>

          </div>
        </div>

      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Our Products
            </h2>

            <p className="text-gray-500 mt-1">
              Explore our latest collection
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {filteredProducts.length} products found
          </span>

        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {filteredProducts.map((product) => (

              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >

                {/* Product Image */}
                <div className="relative overflow-hidden bg-gray-100">

                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-105 transition duration-500"
                  />

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-green-600 shadow">
                    Available
                  </div>

                </div>

                {/* Product Details */}
                <div className="p-6">

                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h2>

                  <p className="text-gray-500 text-sm leading-6 min-h-[48px]">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-5">

                    <p className="text-2xl font-extrabold text-blue-600">
                      ₹{product.price}
                    </p>

                    <span className="text-yellow-500 text-sm">
                      ★ ★ ★ ★ ★
                    </span>

                  </div>

                  {/* Add To Cart */}
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-5 w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-orange-600 hover:to-pink-600 active:scale-95 transition duration-300 shadow-md"
                  >
                    🛒 Add to Cart
                  </button>
                  
                  <button
                   onClick={() => addToWishlist(product)}
                   className="mt-2 w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition"
                  >
                    ❤️ Add to Wishlist
                  </button>

                </div>

              </div>

            ))}

          </div>

        ) : (

          /* No Products */
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">

            <div className="text-5xl mb-4">
              🔍
            </div>

            <h3 className="text-2xl font-bold text-gray-800">
              No products found
            </h3>

            <p className="text-gray-500 mt-2">
              Try searching with a different product name.
            </p>

          </div>

        )}

      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-10">

        <div className="max-w-7xl mx-auto px-6 py-8 text-center">

          <p className="font-semibold text-white text-lg">
            Our Store
          </p>

          <p className="text-sm mt-2">
            Quality products. Simple shopping. Happy customers.
          </p>

          <p className="text-xs text-gray-500 mt-5">
            © 2026 Our Store. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;