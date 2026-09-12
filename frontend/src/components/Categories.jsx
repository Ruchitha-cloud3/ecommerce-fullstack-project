import React, { useEffect, useState } from "react";
import axios from "axios";

function Categories() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    axios
      .get("https://ecommerce-fullstack-project-production-7599.up.railway.app/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter((category) => category)
    ),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Product Categories
      </h1>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">

        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-blue-100"
            }`}
          >
            {category}
          </button>
        ))}

      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >

            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-52 object-cover"
            />

            <div className="p-5">

              <h2 className="text-xl font-bold text-gray-800">
                {product.name}
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                {product.description}
              </p>

              <div className="flex justify-between items-center mt-4">

                <span className="text-xl font-bold text-blue-600">
                  ₹{product.price}
                </span>

                <span className="text-sm text-gray-500">
                  {product.category}
                </span>

              </div>

            </div>
          </div>
        ))}

      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No products found in this category.
        </p>
      )}

    </div>
  );
}

export default Categories;