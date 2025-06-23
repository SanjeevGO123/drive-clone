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

  if (!token) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Logged in, render the children components (dashboard)
  return children;
};
