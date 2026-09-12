import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const resetToken = new URLSearchParams(
  location.search
  ).get("token");
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resetToken) {
      setMessage("Reset token is missing.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "ecommerce-fullstack-project-production-7599.up.railway.app/api/auth/reset-password",
        {
          resetToken,
          newPassword
        }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to reset password."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-center mb-2">
          Reset Password
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Create your new password
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            required
            minLength="6"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
            minLength="6"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Reset Password
          </button>

        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default ResetPassword;