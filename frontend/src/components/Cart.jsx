import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    setCartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useContext(CartContext);

  const [address, setAddress] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // Load cart and profile address
  useEffect(() => {
    if (!user) return;

    const savedProfile = JSON.parse(
      localStorage.getItem("profile") || "{}"
    );

    setProfileAddress(savedProfile.address || "");
    setAddress(savedProfile.address || "");

    axios
      .get(`https://ecommerce-fullstack-project-production-7599.up.railway.app/api/cart/${user.id}`)
      .then((response) => {
        const items = response.data.map((item) => ({
          ...item,
          id: item.product_id,
        }));

        setCartItems(items);
      })
      .catch((error) => {
        console.log("Cart loading error:", error);
      });
  }, [setCartItems]);

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, product) =>
      total +
      Number(product.price) * Number(product.quantity),
    0
  );

  // Place order
  const placeOrder = async () => {
  if (!address.trim()) {
    alert("Please add a delivery address in Profile.");
    return;
  }

  if (!paymentMethod) {
    alert("Please select a payment method.");
    return;
  }

  if (cartItems.length === 0) {
    return;
  }

  if (isPlacingOrder) {
    return;
  }

  setIsPlacingOrder(true);

  // COD does not need online payment
  if (paymentMethod === "Cash on Delivery") {
    axios
      .post("https://ecommerce-fullstack-project-production-7599.up.railway.app/api/orders", {
        user_id: user.id,
        total_amount: totalPrice,
        shipping_address: address,
        payment_method: paymentMethod,
      })
      .then((response) => {
        setCartItems([]);

        navigate("/order-success", {
          state: {
            orderId: response.data.orderId,
            totalAmount: totalPrice,
            paymentMethod: paymentMethod,
          },
        });
      })
      .catch((error) => {
        console.log("COD order error:", error);
        alert("Unable to place order. Please try again.");
        setIsPlacingOrder(false);
      });

    return;
  }

  // Online payment: Create Razorpay order
  try {
    const response = await axios.post(
      "https://ecommerce-fullstack-project-production-7599.up.railway.app/api/payment/create-order",
      {
        amount: totalPrice,
      }
    );

    const options = {
      key: response.data.keyId,
      amount: response.data.amount,
      currency: response.data.currency,
      name: "My E-Commerce Store",
      description: "Order Payment",
      order_id: response.data.orderId,

      handler: async function (paymentResponse) {
  try {
    const verifyResponse = await axios.post(
      "https://ecommerce-fullstack-project-production-7599.up.railway.app/api/payment/verify",
      {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,

        user_id: user.id,
        total_amount: totalPrice,
        shipping_address: address,
        payment_method: paymentMethod
      }
    );

    console.log(
      "Payment verified:",
      verifyResponse.data
    );

    setCartItems([]);

    navigate("/order-success", {
      state: {
        orderId: verifyResponse.data.orderId,
        totalAmount: totalPrice,
        paymentMethod: paymentMethod
      }
    });

  } catch (error) {
    console.log(
      "Payment verification error:",
      error
    );

    alert(
      "Payment verification failed. Please contact support."
    );

    setIsPlacingOrder(false);
  }
},

      prefill: {
        name: user.name,
        email: user.email,
      },

      theme: {
        color: "#2563eb",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.open();

    razorpay.on("payment.failed", function (response) {
      console.log("Payment failed:", response.error);
      alert("Payment failed. Please try again.");
      setIsPlacingOrder(false);
    });
  } catch (error) {
    console.log("Razorpay error:", error);
    alert("Unable to start payment. Please try again.");
    setIsPlacingOrder(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          My Cart 🛒
        </h1>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <div className="text-5xl mb-4">🛒</div>

            <h2 className="text-2xl font-bold text-gray-800">
              Your Cart is Empty
            </h2>

            <p className="text-gray-500 mt-2">
              Add some products to your cart.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Products */}
            <div className="lg:col-span-2 space-y-5">

              {cartItems.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-md p-5"
                >
                  <div className="flex flex-col sm:flex-row gap-5">

                    {/* Product Image */}
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full sm:w-40 h-40 object-cover rounded-xl"
                      />
                    )}

                    {/* Product Details */}
                    <div className="flex-1">

                      <h2 className="text-xl font-bold text-gray-800">
                        {product.name}
                      </h2>

                      <p className="text-gray-500 mt-2">
                        ₹{Number(product.price).toFixed(2)}
                      </p>

                      {/* Quantity */}
                      <div className="flex items-center gap-3 mt-4">

                        <button
                          onClick={() =>
                            decreaseQuantity(product.id)
                          }
                          className="w-9 h-9 rounded-lg bg-gray-200 text-xl font-bold hover:bg-gray-300"
                        >
                          −
                        </button>

                        <span className="font-bold text-lg">
                          {product.quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(product.id)
                          }
                          className="w-9 h-9 rounded-lg bg-gray-200 text-xl font-bold hover:bg-gray-300"
                        >
                          +
                        </button>

                      </div>

                      {/* Product Total */}
                      <p className="font-bold text-blue-600 mt-4">
                        Product Total: ₹
                        {(
                          Number(product.price) *
                          Number(product.quantity)
                        ).toFixed(2)}
                      </p>

                      {/* Remove */}
                      <button
                        onClick={() =>
                          removeFromCart(product.id)
                        }
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600"
                      >
                        Remove
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Section */}
            <div className="bg-white rounded-2xl shadow-md p-6 h-fit">

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              {/* Total */}
              <div className="flex justify-between border-b pb-4">
                <span className="text-gray-600">
                  Total Amount
                </span>

                <span className="text-xl font-bold text-blue-600">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Address */}
              <div className="mb-6 mt-6">

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Delivery Address
                </h2>

                <div className="bg-gray-50 border rounded-xl p-4">

                  <p className="font-semibold text-gray-700">
                    Home Address
                  </p>

                  <p className="text-gray-600 mt-1">
                    {profileAddress ||
                      "No address saved in Profile"}
                  </p>

                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={useDifferentAddress}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      setUseDifferentAddress(checked);

                      if (!checked) {
                        setAddress(profileAddress);
                      } else {
                        setAddress("");
                      }
                    }}
                    className="w-4 h-4"
                  />

                  <span className="text-gray-700 font-medium">
                    Use a different delivery address
                  </span>

                </label>

                {useDifferentAddress && (
                  <textarea
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    placeholder="Enter your delivery address"
                    rows="4"
                    className="w-full border rounded-xl p-3 mt-4"
                  />
                )}

              </div>

              {/* Payment */}
              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Payment Method
                </h2>

                <div className="space-y-3">

                  <label className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />
                    <span>UPI</span>
                  </label>

                  <label className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="Credit/Debit Card"
                      checked={
                        paymentMethod === "Credit/Debit Card"
                      }
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />
                    <span>Credit / Debit Card</span>
                  </label>

                  <label className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="Net Banking"
                      checked={
                        paymentMethod === "Net Banking"
                      }
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />
                    <span>Net Banking</span>
                  </label>

                  <label className="flex items-center gap-3 border rounded-xl p-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="Cash on Delivery"
                      checked={
                        paymentMethod === "Cash on Delivery"
                      }
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />
                    <span>Cash on Delivery</span>
                  </label>

                </div>
              </div>

              {/* Place Order */}
              <button
                onClick={placeOrder}
                disabled={isPlacingOrder}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400"
              >
                {isPlacingOrder
                  ? "Placing Order..."
                  : "Place Order"}
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;