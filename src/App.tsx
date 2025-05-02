
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Learn from "./pages/Learn";
import Earn from "./pages/Earn";
import Connect from "./pages/Connect";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SplashPage from "./pages/SplashPage";
import SignIn from "./pages/SignIn";
import { useEffect, useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./hooks/use-auth";

// Create query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("Query error:", error);
      }
    },
  },
});

// Protected route component with proper error handling
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  console.log("ProtectedRoute - User:", user?.email, "Loading:", loading);
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading authentication...</div>;
  }
  
  if (!user) {
    console.log("No user, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }
  
  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};

// Router component with Auth provider and better initialization
const AppRouter = () => {
  const [initialized, setInitialized] = useState(false);
  
  // Set document title and handle initialization
  useEffect(() => {
    try {
      console.log("Initializing AppRouter");
      document.title = "Aigent MonDAI";
      // Short delay to ensure all initialization is complete
      const timer = setTimeout(() => {
        setInitialized(true);
        console.log("App initialization complete");
      }, 100);
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error during initialization:", error);
      setInitialized(true); // Still set to true to avoid getting stuck
    }
  }, []);

  if (!initialized) {
    return <div className="flex h-screen items-center justify-center">Initializing application...</div>;
  }

  return (
    <AuthProvider>
      <Routes>
        {/* Public routes with fallbacks */}
        <Route path="/splash" element={
          <ErrorBoundaryWrapper>
            <SplashPage />
          </ErrorBoundaryWrapper>
        } />
        
        <Route path="/signin" element={
          <ErrorBoundaryWrapper>
            <SignIn />
          </ErrorBoundaryWrapper>
        } />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <MainLayout>
                  <Index />
                </MainLayout>
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/learn" 
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <MainLayout>
                  <Learn />
                </MainLayout>
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/earn" 
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <MainLayout>
                  <Earn />
                </MainLayout>
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/connect" 
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <MainLayout>
                  <Connect />
                </MainLayout>
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ErrorBoundaryWrapper>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ErrorBoundaryWrapper>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route with fallback */}
        <Route path="*" element={
          <ErrorBoundaryWrapper>
            <NotFound />
          </ErrorBoundaryWrapper>
        } />
      </Routes>
    </AuthProvider>
  );
};

// Simple error boundary component to prevent blank screens
const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
        <p className="mb-4">We encountered an error while rendering this page.</p>
        <button 
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => {
  console.log("Rendering App component");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
