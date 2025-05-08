
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import MonDAI from "@/pages/MonDAI";
import Settings from "@/pages/Settings";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import NotFound from "@/pages/NotFound";
import SplashScreen from "@/pages/SplashScreen";
import Profile from "@/pages/Profile";
import DataQube from "@/pages/qubes/DataQube";
import AgentQube from "@/pages/qubes/AgentQube";
import ToolQube from "@/pages/qubes/ToolQube";
import ProtectedRoute from "../auth/ProtectedRoute";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/splash" element={<SplashScreen />} />
        
        {/* Protected routes with main layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/mondai" element={
          <ProtectedRoute>
            <MainLayout>
              <MonDAI />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* iQubes routes */}
        <Route path="/qubes/dataqube" element={
          <ProtectedRoute>
            <MainLayout>
              <DataQube />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/qubes/agentqube" element={
          <ProtectedRoute>
            <MainLayout>
              <AgentQube />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/qubes/toolqube" element={
          <ProtectedRoute>
            <MainLayout>
              <ToolQube />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
