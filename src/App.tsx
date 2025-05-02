
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
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./hooks/use-auth";

// Create query client with error handling compatible with @tanstack/react-query v5+
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    }
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading authentication...</div>;
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
};

// Router component with Auth provider
const AppRouter = () => {
  console.log("Rendering app router");
  
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
  console.log("Rendering root App component");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
