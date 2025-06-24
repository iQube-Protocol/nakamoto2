
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import InvitationManager from '@/components/admin/InvitationManager';

const InvitationsPage = () => {
  const { user, isGuest } = useAuth();

  // Enhanced admin check - allow nakamoto.metame.com and other admin patterns
  const isAdmin = user?.email && (
    user.email.includes('nakamoto') || 
    user.email.includes('admin') ||
    user.email === 'nakamoto@metame.com' ||
    // Add more specific admin emails here as needed
    user.email.endsWith('@metame.com')
  );

  console.log('Admin access check:', {
    userEmail: user?.email,
    isAdmin,
    isGuest,
    timestamp: new Date().toISOString()
  });

  if (isGuest || !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please sign in to access the invitation manager.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">This page is restricted to administrators.</p>
          <p className="text-sm text-gray-600">
            Current user: {user.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">User Invitation Manager</h1>
        <p className="text-gray-600">
          Upload user data via CSV and send invitation emails for account creation.
        </p>
      </div>
      
      <InvitationManager />
    </div>
  );
};

export default InvitationsPage;
