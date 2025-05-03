
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  
  // Debug authentication status
  useEffect(() => {
    console.log("ProtectedRoute - Auth status:", { 
      user: !!user, 
      session: !!session, 
      loading, 
      path: location.pathname 
    });
  }, [user, loading, session, location.pathname]);
  
  // Don't redirect while authentication is loading
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
  
  // Only redirect if not already on signin page and user is not authenticated
  if (!user && location.pathname !== "/signin") {
    console.log(`ProtectedRoute - Redirecting to signin page from ${location.pathname}`);
    // Save the attempted URL to redirect back after login
    // Using sessionStorage to persist across page refreshes
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/signin" replace />;
  }
  
  // If we're on signin page but already authenticated, redirect to home
  if (user && location.pathname === "/signin") {
    console.log("ProtectedRoute - Already authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  console.log("ProtectedRoute - Authenticated or public route, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
