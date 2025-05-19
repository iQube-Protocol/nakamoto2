
import React from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from '../auth/ProtectedRoute';
import SignUp from '../../pages/auth/SignUp';
import SignIn from '../../pages/SignIn';
import Index from '../../pages/Index';
import Dashboard from '../../pages/Dashboard';
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
import { AuthProvider } from '@/hooks/use-auth';
import OAuthCallback from '@/components/settings/OAuthCallback';

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/earn" element={<ProtectedRoute><Earn /></ProtectedRoute>} />
        <Route path="/connect" element={<ProtectedRoute><Connect /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/mondai" element={<ProtectedRoute><MonDAI /></ProtectedRoute>} />
        <Route path="/qubes/agent" element={<ProtectedRoute><AgentQube /></ProtectedRoute>} />
        <Route path="/qubes/tool" element={<ProtectedRoute><ToolQube /></ProtectedRoute>} />
        <Route path="/qubes/data" element={<ProtectedRoute><DataQube /></ProtectedRoute>} />
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
