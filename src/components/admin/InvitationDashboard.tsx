
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import UserListModal from './UserListModal';
import UserDetailModal from './UserDetailModal';
import DataValidationDashboard from './components/DataValidationDashboard';
import { ExpirationNotificationCard } from './components/ExpirationNotificationCard';
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

  // Backfill state and actions
  const [backfillCount, setBackfillCount] = useState<number | null>(null);
  const [isBackfilling, setIsBackfilling] = useState(false);

  const loadBackfillCount = async () => {
    try {
      const { data, error } = await supabase.rpc('count_direct_signups');
      if (error) throw error;
      setBackfillCount(data ?? 0);
      console.log('InvitationDashboard: count_direct_signups', { count: data });
    } catch (e: any) {
      console.error('InvitationDashboard: Failed to fetch direct signup count', e);
    }
  };

  const handleBackfill = async () => {
    setIsBackfilling(true);
    try {
      toast.info('Starting backfill of direct signups...');
      const { data, error } = await supabase.functions.invoke('backfill-direct-signups');
      if (error) throw error;
      console.log('InvitationDashboard: Backfill result', data);
      const processed = (data as any)?.processed ?? (data as any)?.summary?.processed ?? 'unknown';
      toast.success(`Backfill complete: ${processed} users processed`);
      await handleRefresh();
      await loadBackfillCount();
    } catch (e: any) {
      console.error('InvitationDashboard: Backfill error', e);
      toast.error(`Backfill failed: ${e.message ?? 'Unknown error'}`);
    } finally {
      setIsBackfilling(false);
    }
  };

  // Modal states
  const [userListModal, setUserListModal] = useState<{ open: boolean; category: string; title: string; totalCount?: number }>({
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
    loadBackfillCount();
  }, [loadDashboardData]);

  const handleStatCardClick = (category: string, title: string, count: number) => {
    console.log('InvitationDashboard: handleStatCardClick', { category, title, count });
    setUserListModal({ open: true, category, title, totalCount: count });
  };

  const handleUserClick = (user: UserDetail) => {
    setUserListModal({ open: false, category: '', title: '', totalCount: undefined });
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
      <div className="flex justify-end gap-2">
        <Button onClick={handleBackfill} variant="outline" size="sm" disabled={isBackfilling}>
          <Database className="h-4 w-4 mr-1" />
          {isBackfilling ? 'Backfilling...' : 'Backfill Direct Signups'}
        </Button>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh All Data
        </Button>
      </div>

      {typeof backfillCount === 'number' && backfillCount > 0 && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Backfill available: {backfillCount} direct signups not tracked.</span>
          <Button onClick={handleBackfill} variant="link" size="sm" className="px-0">
            Run Backfill
          </Button>
        </div>
      )}

      {/* Interactive Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <StatsOverview stats={unifiedStats} onStatCardClick={handleStatCardClick} />
        </div>
        <div className="lg:col-span-1">
          <ExpirationNotificationCard onExpiringClick={handleStatCardClick} />
        </div>
      </div>

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
        onClose={() => setUserListModal({ open: false, category: '', title: '', totalCount: undefined })}
        category={userListModal.category}
        title={userListModal.title}
        totalCount={userListModal.totalCount}
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
