import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
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

// Enhanced redirect handler for old invitation URLs with better debugging
const InvitationRedirectHandler = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const currentHost = window.location.host;
  
  console.log('🔄 InvitationRedirectHandler activated:', {
    currentUrl: window.location.href,
    currentHost: currentHost,
    token: token ? token.substring(0, 12) + '...' : 'NO_TOKEN',
    pathname: window.location.pathname,
    timestamp: new Date().toISOString()
  });
  
  // If we're on the old domain (nakamoto2), redirect to the new domain
  if (currentHost.includes('nakamoto2')) {
    const newUrl = `https://preview--aigent-nakamoto.lovable.app/invited-signup${token ? `?token=${token}` : ''}`;
    console.log('🚀 Redirecting from old domain to new domain:', newUrl);
    window.location.replace(newUrl);
    return <div>Redirecting to updated site...</div>;
  }
  
  // If we have a token, redirect to invited-signup
  if (token) {
    const newUrl = `/invited-signup?token=${token}`;
    console.log('📧 Redirecting with token to:', newUrl);
    return <Navigate to={newUrl} replace />;
  }
  
  // Default redirect to home
  console.log('🏠 No token found, redirecting to home');
  return <Navigate to="/" replace />;
};

export const AppRouter = () => {
  const { user, loading } = useAuth();
  
  console.log('AppRouter rendering with auth state:', { user: !!user, loading });
  
  if (loading) {
    return <SplashScreen />;
  }

  console.log('AppRouter: About to render routes');

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<SplashPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      
      {/* Auth routes - these should work without authentication */}
      <Route path="/signin" element={<AuthLayout title="Welcome back"><SignIn /></AuthLayout>} />
      <Route path="/signup" element={<AuthLayout title="Create account"><SignUp /></AuthLayout>} />
      
      {/* ENHANCED INVITATION SIGNUP with better debugging */}
      <Route 
        path="/invited-signup" 
        element={
          <div>
            <InvitedUserSignup />
          </div>
        } 
      />
      
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
  );
};
