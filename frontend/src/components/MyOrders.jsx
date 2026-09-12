import React, { useEffect, useState } from "react";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const cancelOrder = (orderId) => {
  const user = JSON.parse(localStorage.getItem("user"));

  axios
    .put(
      `http://localhost:5000/api/orders/${user.id}/${orderId}/cancel`
    )
    .then(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: "Cancelled" }
            : order
        )
      );
    })
    .catch((error) => {
      console.log("Cancel order error:", error);
      alert("Unable to cancel order.");
    });
};

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/orders/${user.id}`)
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {
        console.log("Orders loading error:", error);
      });
  }, [user.id]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-md text-center">
          <div className="text-5xl mb-4">📦</div>

          <h2 className="text-2xl font-bold text-gray-800">
            No Orders Yet
          </h2>

          <p className="text-gray-500 mt-2">
            Your placed orders will appear here.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Order #{order.id}
                </h2>

                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-gray-600">
                <p>
                  <strong>Total:</strong> ₹{order.total_amount}
                </p>

                <p>
                  <strong>Address:</strong> {order.shipping_address}
                </p>

                <p>
                  <strong>Payment:</strong> {order.payment_status}
                </p>

                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(order.order_date).toLocaleString()}
                </p>

                {order.status === "Pending" && (
                    <button onClick={() => cancelOrder(order.id)}
                     className="mt-5 w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"  >
                     Cancel Order
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;