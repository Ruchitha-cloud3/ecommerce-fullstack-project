import React, { useState, useEffect } from "react";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const savedWishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    setWishlist(savedWishlist);
  }, []);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(
      (product) => product.id !== productId
    );

    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6">

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        My Wishlist ❤️
      </h1>

      {wishlist.length === 0 ? (
        <div className="max-w-xl mx-auto bg-white p-10 rounded-2xl shadow-md text-center">
          <div className="text-5xl mb-4">❤️</div>

          <h2 className="text-2xl font-bold text-gray-800">
            Your Wishlist is Empty
          </h2>

          <p className="text-gray-500 mt-2">
            Add your favorite products to your wishlist.
          </p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
            >

              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-56 object-cover"
              />

              <div className="p-5">

                <h2 className="text-xl font-bold text-gray-800">
                  {product.name}
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  {product.description}
                </p>

                <p className="text-2xl font-bold text-blue-600 mt-4">
                  ₹{product.price}
                </p>

                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="mt-5 w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                >
                  Remove from Wishlist
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Wishlist;
