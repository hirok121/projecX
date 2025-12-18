import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";
import logger from "../utils/logger";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, isStaff, isSuperuser } = useAuth();

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
    logger.log("🔒 User not authenticated, redirecting to signin");
    return <Navigate to="/signin" />;
  }

  // Check if admin access is required (staff OR superuser)
  if (requireAdmin && !isStaff && !isSuperuser) {
    logger.security("Admin access required but user is not staff/superuser");
    return (
      <Navigate
        to="/"
        state={{
          message: "Admin privileges required to access this page",
          type: "error",
        }}
      />
    );
  }

  logger.success("Protected route access granted");
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
};

export default ProtectedRoute;
