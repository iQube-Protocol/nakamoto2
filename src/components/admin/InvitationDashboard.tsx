
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import UserListModal from './UserListModal';
import UserDetailModal from './UserDetailModal';
import DataValidationDashboard from './components/DataValidationDashboard';
import StatsOverview from './dashboard/StatsOverview';
import PipelineTab from './dashboard/PipelineTab';
import BatchesTab from './dashboard/BatchesTab';
import AnalyticsTab from './dashboard/AnalyticsTab';
import ExportTab from './dashboard/ExportTab';
import { useDashboardData } from './hooks/useDashboardData';

// Define UserDetail type locally since we removed the old service
interface UserDetail {
  id: string;
  email: string;
  persona_type: string;
}

const InvitationDashboard = () => {
  const {
    unifiedStats,
    batches,
    pendingEmailSend,
    emailsSent,
    awaitingSignup,
    completedSignups,
    isLoading,
    isSending,
    loadDashboardData,
    handleSendNextBatch,
    handleRefresh
  } = useDashboardData();

  // Modal states
  const [userListModal, setUserListModal] = useState<{ open: boolean; category: string; title: string }>({
    open: false,
    category: '',
    title: ''
  });
  const [userDetailModal, setUserDetailModal] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null
  });

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStatCardClick = (category: string, title: string) => {
    setUserListModal({ open: true, category, title });
  };

  const handleUserClick = (user: UserDetail) => {
    setUserListModal({ open: false, category: '', title: '' });
    setUserDetailModal({ open: true, userId: user.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button Header */}
      <div className="flex justify-end">
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh All Data
        </Button>
      </div>

      {/* Interactive Stats Overview */}
      <StatsOverview stats={unifiedStats} onStatCardClick={handleStatCardClick} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <PipelineTab
            pendingEmailSend={pendingEmailSend}
            awaitingSignup={awaitingSignup}
            isSending={isSending}
            onSendBatch={handleSendNextBatch}
          />
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <BatchesTab batches={batches} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <DataValidationDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab stats={unifiedStats} batches={batches} />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportTab
            pendingEmailSend={pendingEmailSend}
            emailsSent={emailsSent}
            awaitingSignup={awaitingSignup}
            completedSignups={completedSignups}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <UserListModal
        open={userListModal.open}
        onClose={() => setUserListModal({ open: false, category: '', title: '' })}
        category={userListModal.category}
        title={userListModal.title}
        onUserClick={handleUserClick}
      />

      <UserDetailModal
        open={userDetailModal.open}
        onClose={() => setUserDetailModal({ open: false, userId: null })}
        userId={userDetailModal.userId}
      />
    </div>
  );
};

export default InvitationDashboard;
