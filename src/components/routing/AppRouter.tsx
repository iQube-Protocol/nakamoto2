
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/use-auth';
import Index from '@/pages/Index';
import SplashPage from '@/pages/SplashPage';
import SignIn from '@/pages/SignIn';
import SignUpPage from '@/pages/auth/SignUp';
import MonDAI from '@/pages/MonDAI';
import Learn from '@/pages/Learn';
import Earn from '@/pages/Earn';
import Connect from '@/pages/Connect';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Dashboard from '@/pages/Dashboard';
import LegacyDashboard from '@/pages/LegacyDashboard';
import DataQube from '@/pages/qubes/DataQube';
import ToolQube from '@/pages/qubes/ToolQube';
import AgentQube from '@/pages/qubes/AgentQube';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import InvitationsPage from '@/pages/admin/Invitations';
import InvitedUserSignup from '@/components/auth/InvitedUserSignup';

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/invited-signup" element={<InvitedUserSignup />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Admin routes */}
          <Route path="/admin/invitations" element={<InvitationsPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/mondai" element={<MonDAI />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/earn" element={<Earn />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/legacy-dashboard" element={<LegacyDashboard />} />
              
              {/* Qube pages */}
              <Route path="/qubes/data" element={<DataQube />} />
              <Route path="/qubes/tool" element={<ToolQube />} />
              <Route path="/qubes/agent" element={<AgentQube />} />
            </Route>
          </Route>
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
