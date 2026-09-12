import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "ecommerce-fullstack-project-production-7599.up.railway.app/api/auth/forgot-password",
        {
          email
        }
      );

      setMessage(
        "Reset link sent to your email. Please check your email."
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Something went wrong."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Enter your registered email
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Send Reset Link
          </button>

        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;