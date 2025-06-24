import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';

// Page imports
import Dashboard from '@/pages/Dashboard';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/auth/SignUp';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Learn from '@/pages/Learn';
import Earn from '@/pages/Earn';
import Connect from '@/pages/Connect';
import MonDAI from '@/pages/MonDAI';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import LegacyDashboard from '@/pages/LegacyDashboard';
import SplashPage from '@/pages/SplashPage';
import SplashScreen from '@/pages/SplashScreen';

// Admin pages
import InvitationsAdmin from '@/pages/admin/Invitations';

// Qube pages
import AgentQube from '@/pages/qubes/AgentQube';
import DataQube from '@/pages/qubes/DataQube';
import ToolQube from '@/pages/qubes/ToolQube';

// Auth components
import InvitedUserSignup from '@/components/auth/InvitedUserSignup';
import EmailConfirmation from '@/components/auth/EmailConfirmation';

// Redirect handler for old invitation URLs
const InvitationRedirectHandler = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  // Log the redirect attempt
  console.log('InvitationRedirectHandler: Handling old URL redirect', {
    currentUrl: window.location.href,
    token: token?.substring(0, 8) + '...',
    timestamp: new Date().toISOString()
  });
  
  if (token) {
    // Redirect to the new invitation signup URL
    const newUrl = `/invited-signup?token=${token}`;
    return <Navigate to={newUrl} replace />;
  }
  
  // If no token, redirect to home
  return <Navigate to="/" replace />;
};

export const AppRouter = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        
        {/* Auth routes */}
        <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />
        <Route path="/invited-signup" element={<InvitedUserSignup />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        
        {/* Legacy invitation URL redirect handler */}
        <Route path="/invite" element={<InvitationRedirectHandler />} />
        <Route path="/invitation" element={<InvitationRedirectHandler />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/legacy-dashboard" element={<ProtectedRoute><LegacyDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/earn" element={<ProtectedRoute><Earn /></ProtectedRoute>} />
        <Route path="/connect" element={<ProtectedRoute><Connect /></ProtectedRoute>} />
        <Route path="/mondai" element={<ProtectedRoute><MonDAI /></ProtectedRoute>} />
        
        {/* Qube routes */}
        <Route path="/agent-qube" element={<ProtectedRoute><AgentQube /></ProtectedRoute>} />
        <Route path="/data-qube" element={<ProtectedRoute><DataQube /></ProtectedRoute>} />
        <Route path="/tool-qube" element={<ProtectedRoute><ToolQube /></ProtectedRoute>} />
        
        {/* Admin routes */}
        <Route path="/admin/invitations" element={<ProtectedRoute><InvitationsAdmin /></ProtectedRoute>} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};
