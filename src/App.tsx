
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component
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

// Router component with Auth provider
const AppRouter = () => {
  const [initialized, setInitialized] = useState(false);
  
  // Set document title
  useEffect(() => {
    document.title = "Aigent MonDAI";
    setInitialized(true);
  }, []);

  if (!initialized) {
    return <div className="flex h-screen items-center justify-center">Initializing application...</div>;
  }

  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/signin" element={<SignIn />} />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Index />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/learn" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Learn />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/earn" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Earn />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/connect" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Connect />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
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
