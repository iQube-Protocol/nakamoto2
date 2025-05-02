
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute - Auth status:", { 
    user: !!user, 
    session: !!session, 
    loading, 
    path: location.pathname 
  });
  
  useEffect(() => {
    // Log authentication state for debugging
    if (!user && !loading) {
      console.log("ProtectedRoute - No user detected, should redirect to signin");
    }
  }, [user, loading, location.pathname]);
  
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
  
  if (!user) {
    console.log(`ProtectedRoute - Redirecting to signin page from ${location.pathname}`);
    // Save the attempted URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/signin" replace />;
  }
  
  console.log("ProtectedRoute - Authenticated, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
