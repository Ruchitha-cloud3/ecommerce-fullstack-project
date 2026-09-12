import React, { useState, useEffect } from "react";
import axios from "axios";

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [editing, setEditing] = useState(false);

  // Get profile from backend
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    axios
      .get(`https://ecommerce-fullstack-project-production-7599.up.railway.app/api/profile/${user.id}`)
      .then((response) => {
        setProfile({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
        });
      })
      .catch((error) => {
        console.log("Profile loading error:", error);
      });
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Update profile in database
  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    axios
      .put(
        `https://ecommerce-fullstack-project-production-7599.up.railway.app/api/profile/${user.id}`,
        profile
      )
      .then(() => {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            name: profile.name,
            email: profile.email,
          })
        );

        setEditing(false);
        alert("Profile updated successfully");
      })
      .catch((error) => {
        console.log("Profile update error:", error);
        console.log("Server response:", error.response?.data);
        alert("Unable to update profile");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          My Profile 👤
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">

          {/* Full Name */}
          <div className="mb-5">
            <label className="block font-semibold text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Enter your name"
              className="w-full border rounded-lg p-3 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block font-semibold text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Enter your email"
              className="w-full border rounded-lg p-3 disabled:bg-gray-100"
            />
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label className="block font-semibold text-gray-700 mb-2">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Enter your phone number"
              className="w-full border rounded-lg p-3 disabled:bg-gray-100"
            />
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              Address
            </label>

            <textarea
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={!editing}
              placeholder="Enter your delivery address"
              rows="4"
              className="w-full border rounded-lg p-3 disabled:bg-gray-100"
            />
          </div>

          {/* Buttons */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Save Profile
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;
