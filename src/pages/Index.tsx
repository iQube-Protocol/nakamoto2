
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to the main dashboard with sidebar
        console.log("User authenticated, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        // User is not authenticated, redirect to sign in
        console.log("User not authenticated, redirecting to signin");
        navigate('/signin', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
