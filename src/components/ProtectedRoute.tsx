import { JSX } from "react";
import {Navigate } from "react-router-dom";

// ProtectedRoute checks if token exists in localStorage
export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Logged in, render the children components (dashboard)
  return children;
};
