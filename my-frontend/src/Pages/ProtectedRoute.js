import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/Login" replace />; // Redirect to login if not authenticated
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/Unauthorized" replace />; // Redirect if role is not allowed
  }

  return <Outlet />;
};

export default ProtectedRoute;