
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
import NotFound from "./pages/NotFound";
import SplashPage from "./pages/SplashPage";
import SignIn from "./pages/SignIn";
import { useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Set document title
  useEffect(() => {
    document.title = "Aigent MonDAI";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
