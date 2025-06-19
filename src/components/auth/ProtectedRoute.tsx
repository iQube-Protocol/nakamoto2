
import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const ProtectedRoute: React.FC = () => {
  const { user, isGuest, loading } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute - Auth status:", { user: !!user, isGuest, loading, path: location.pathname });
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading authentication...</p>
        </div>
      </div>
    );
  }
  
  // Allow access if user is authenticated OR in guest mode
  if (!user && !isGuest) {
    console.log("ProtectedRoute - Redirecting to signin page from", location.pathname);
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  
  console.log("ProtectedRoute - Authenticated or guest, rendering children");
  return <Outlet />;
};

export default ProtectedRoute;
