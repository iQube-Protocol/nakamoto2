
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { unifiedInvitationService, type UnifiedInvitationStats, type PendingInvitation, type EmailBatch } from '@/services/unified-invitation';
import UserListModal from './UserListModal';
import UserDetailModal from './UserDetailModal';
import DataValidationDashboard from './components/DataValidationDashboard';
import StatsOverview from './dashboard/StatsOverview';
import PipelineTab from './dashboard/PipelineTab';
import BatchesTab from './dashboard/BatchesTab';
import AnalyticsTab from './dashboard/AnalyticsTab';
import ExportTab from './dashboard/ExportTab';

// Define UserDetail type locally since we removed the old service
interface UserDetail {
  id: string;
  email: string;
  persona_type: string;
}

const InvitationDashboard = () => {
  const [unifiedStats, setUnifiedStats] = useState<UnifiedInvitationStats | null>(null);
  const [batches, setBatches] = useState<EmailBatch[]>([]);
  const [pendingEmailSend, setPendingEmailSend] = useState<PendingInvitation[]>([]);
  const [emailsSent, setEmailsSent] = useState<PendingInvitation[]>([]);
  const [awaitingSignup, setAwaitingSignup] = useState<PendingInvitation[]>([]);
  const [completedSignups, setCompletedSignups] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

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

  const loadDashboardData = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      console.log('InvitationDashboard: Loading dashboard data with unified service only...', { forceRefresh });
      
      // Use ONLY the unified service for ALL data
      const [
        unifiedStatsData,
        batchesData,
        pendingData,
        sentData,
        awaitingData,
        completedData
      ] = await Promise.all([
        unifiedInvitationService.getUnifiedStats(forceRefresh),
        unifiedInvitationService.getEmailBatches(),
        unifiedInvitationService.getPendingEmailSend(1000),
        unifiedInvitationService.getEmailsSent(),
        unifiedInvitationService.getAwaitingSignup(),
        unifiedInvitationService.getCompletedInvitations()
      ]);

      console.log('InvitationDashboard: Loaded dashboard data from unified service:', {
        unifiedStats: unifiedStatsData,
        batchesCount: batchesData.length,
        pendingCount: pendingData.length,
        sentCount: sentData.length,
        awaitingCount: awaitingData.length,
        completedCount: completedData.length
      });

      setUnifiedStats(unifiedStatsData);
      setBatches(batchesData);
      setPendingEmailSend(pendingData);
      setEmailsSent(sentData);
      setAwaitingSignup(awaitingData);
      setCompletedSignups(completedData);

      if (forceRefresh) {
        toast.success('Dashboard data refreshed');
      }
    } catch (error) {
      console.error('InvitationDashboard: Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSendNextBatch = async (batchSize: number = 1000) => {
    if (pendingEmailSend.length === 0) {
      toast.error('No emails pending to send');
      return;
    }

    setIsSending(true);
    try {
      console.log(`InvitationDashboard: Sending batch of ${batchSize} emails using unified service`);
      
      const emailsToSend = pendingEmailSend.slice(0, batchSize).map(inv => inv.email);
      const result = await unifiedInvitationService.sendEmailBatch(emailsToSend, 50); // Use smaller chunks
      
      if (result.success) {
        toast.success(`Email sending started for ${emailsToSend.length} emails. Check batch status for progress.`);
        await loadDashboardData(true); // Force refresh after sending
      } else {
        toast.error(`Failed to send emails: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error('InvitationDashboard: Error sending emails:', error);
      toast.error(`Error sending emails: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    console.log('InvitationDashboard: Manual refresh triggered');
    unifiedInvitationService.clearCache();
    await loadDashboardData(true);
  };

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
