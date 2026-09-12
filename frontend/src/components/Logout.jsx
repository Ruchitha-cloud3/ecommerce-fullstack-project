import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

function Logout() {
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  return <Navigate to="/login" replace />;
}

export default Logout;