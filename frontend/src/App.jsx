import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./components/signup";
import Login from "./components/login";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import Cart from "./components/Cart";
import OrderSuccess from "./components/orderSuccess.jsx";
import MyOrders from "./components/MyOrders.jsx";

import Categories from "./components/Categories";
import Wishlist from "./components/Wishlist";
import Profile from "./components/Profile";
import Logout from "./components/Logout";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  const token = window.localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        {/* Default Page */}
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={<Signup />}
        />
        {/* Forgot Password */}
<Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>

{/* Reset Password */}
<Route
  path="/reset-password"
  element={<ResetPassword />}
/>

        {/* Login */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Home - Protected */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Categories - Protected */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />

        {/* Wishlist - Protected */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* Cart - Protected */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* Profile - Protected */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Order Success - Protected */}
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
       <Route
          path="/my-orders"
          element={
           <ProtectedRoute>
             <MyOrders />
           </ProtectedRoute>
          }
        />


        {/* Logout */}
        <Route
          path="/logout"
          element={<Logout />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;