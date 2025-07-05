import { JSX } from "react";
import { Navigate } from "react-router-dom";

// This file defines the ProtectedRoute component, which ensures that only authenticated users can access certain routes.
// If a valid token exists in localStorage, the children components are rendered.
// Otherwise, the user is redirected to the login page.

// Props:
// - children: A JSX element representing the components to render if the user is authenticated.

// ProtectedRoute checks if token exists in localStorage
export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const tokenTime = localStorage.getItem("tokenTime");
  // Check if token exists and is not expired (15 minutes)
  const isTokenValid =
    token && tokenTime && Date.now() - parseInt(tokenTime) < 15 * 60 * 1000;

  if (!isTokenValid) {
    // Token missing or expired, clear storage and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("tokenTime");
    return <Navigate to="/login" replace />;
  }

  // Logged in, render the children components (dashboard)
  return children;
};
