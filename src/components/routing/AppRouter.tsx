
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

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

export default AppRouter;
