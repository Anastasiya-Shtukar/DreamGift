import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute() {
  const { isAuthenticated, isLoading, isError } = useAuth();

  if (isLoading) {
    return <p>Checking authentication...</p>;
  }

  if (isError) {
    return <p>Unable to verify your session. Please try again.</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
