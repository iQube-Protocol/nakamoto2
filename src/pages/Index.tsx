
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Only perform redirects if we're actually on the root path
    if (!loading && location.pathname === '/') {
      if (user) {
        // User is authenticated, redirect directly to Aigent
        console.log("User authenticated, redirecting to Aigent");
        navigate('/aigent', { replace: true });
      } else {
        // For preview/development, show the splash page instead of forcing sign-in
        console.log("User not authenticated, showing splash page");
        navigate('/splash', { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading state while checking authentication, but only on root path
  if (loading && location.pathname === '/') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-qrypto-dark to-qrypto-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qrypto-accent mx-auto mb-4"></div>
          <p className="text-white">Loading QryptoCOYN...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
