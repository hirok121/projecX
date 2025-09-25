import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AUTH_CONFIG } from "../config/constants";

const ProtectedRoute = ({ children, requireStaff = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    console.log('🔒 User not authenticated, redirecting to signin');
    return <Navigate to="/signin" />;
  }

  // Check if staff access is required
  if (requireStaff && !user?.is_staff) {
    console.log('👮 Staff access required but user is not staff');
    return <Navigate to="/" />; // Redirect to home if not staff
  }

  console.log('✅ Protected route access granted');
  return children;
};

export default ProtectedRoute;
