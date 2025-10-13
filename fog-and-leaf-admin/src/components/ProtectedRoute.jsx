import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while authentication is being verified
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Verifying authentication...</p>
          <p className="text-xs text-secondary-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Once loading is complete, check authentication status
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
