
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// Pages
import Index from "@/pages/Index";
import Learn from "@/pages/Learn";
import Earn from "@/pages/Earn";
import Connect from "@/pages/Connect";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import SplashPage from "@/pages/SplashPage";
import SignIn from "@/pages/SignIn";

const AppRouter: React.FC = () => {
  console.log("Rendering app router");
  
  return (
    <ErrorBoundary fallback={
      <div className="flex items-center justify-center h-screen w-full">
        <div className="text-center p-8 max-w-lg">
          <h1 className="text-2xl font-bold mb-4">Application Error</h1>
          <p className="mb-4">Sorry, something went wrong while loading the application.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    }>
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
                  <ErrorBoundary>
                    <Earn />
                  </ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default AppRouter;
