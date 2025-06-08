import React from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from '../auth/ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import SignUp from '../../pages/auth/SignUp';
import SignIn from '../../pages/SignIn';
import Index from '../../pages/Index';
import Settings from '../../pages/Settings';
import Learn from '../../pages/Learn';
import Earn from '../../pages/Earn';
import Connect from '../../pages/Connect';
import NotFound from '../../pages/NotFound';
import Profile from '../../pages/Profile';
import MonDAI from '../../pages/MonDAI';
import AgentQube from '../../pages/qubes/AgentQube';
import ToolQube from '../../pages/qubes/ToolQube';
import DataQube from '../../pages/qubes/DataQube';
import SplashPage from '../../pages/SplashPage';
import LegacyDashboard from '../../pages/LegacyDashboard';
import { AuthProvider } from '@/hooks/use-auth';
import OAuthCallback from '@/components/settings/OAuthCallback';
import EmailConfirmation from '@/components/auth/EmailConfirmation';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

const ProtectedLayoutRoute = ({ element }) => {
  return (
    <ProtectedRoute>
      <MainLayout>
        {element}
      </MainLayout>
    </ProtectedRoute>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/legacy" element={<LegacyDashboard />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/auth/confirm" element={<EmailConfirmation />} />
        
        {/* Redirect /dashboard to /mondai */}
        <Route path="/dashboard" element={<Navigate to="/mondai" replace />} />
        
        <Route path="/mondai" element={<ProtectedLayoutRoute element={<MonDAI />} />} />
        <Route path="/learn" element={<ProtectedLayoutRoute element={<Learn />} />} />
        <Route path="/earn" element={<ProtectedLayoutRoute element={<Earn />} />} />
        <Route path="/connect" element={<ProtectedLayoutRoute element={<Connect />} />} />
        <Route path="/settings" element={<ProtectedLayoutRoute element={<Settings />} />} />
        <Route path="/profile" element={<ProtectedLayoutRoute element={<Profile />} />} />
        <Route path="/qubes/agent" element={<ProtectedLayoutRoute element={<AgentQube />} />} />
        <Route path="/qubes/tool" element={<ProtectedLayoutRoute element={<ToolQube />} />} />
        <Route path="/qubes/data" element={<ProtectedLayoutRoute element={<DataQube />} />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
