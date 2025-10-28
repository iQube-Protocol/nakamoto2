
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/use-auth';
import Index from '@/pages/Index';
import SplashPage from '@/pages/SplashPage';
import SignIn from '@/pages/SignIn';
import SignUpPage from '@/pages/auth/SignUp';
import PasswordReset from '@/pages/PasswordReset';
import Aigent from '@/pages/Aigent';
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
import QubeBaseMigration from '@/pages/admin/QubeBaseMigration';
import InvitedUserSignup from '@/components/auth/InvitedUserSignup';
import OAuthCallback from '@/components/settings/OAuthCallback';
import PasswordResetGuard from '@/components/auth/PasswordResetGuard';

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
          <Route path="/reset-password" element={
            <PasswordResetGuard>
              <PasswordReset />
            </PasswordResetGuard>
          } />
          <Route path="/invited-signup" element={<InvitedUserSignup />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            {/* Admin routes - protected but outside MainLayout */}
            <Route path="/admin/invitations" element={<InvitationsPage />} />
            <Route path="/admin/migration" element={<QubeBaseMigration />} />
            
            {/* Main app routes with layout */}
            <Route element={<MainLayout />}>
              <Route path="/aigent" element={<Aigent />} />
              <Route path="/mondai" element={<Aigent />} />
              <Route path="/learn" element={<Learn />} />
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
