
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { unifiedInvitationService } from '@/services/unified-invitation';
import type { 
  UnifiedInvitationStats, 
  PendingInvitation, 
  EmailBatch 
} from '@/services/unified-invitation';

export const useDashboardData = () => {
  const [unifiedStats, setUnifiedStats] = useState<UnifiedInvitationStats | null>(null);
  const [batches, setBatches] = useState<EmailBatch[]>([]);
  const [pendingEmailSend, setPendingEmailSend] = useState<PendingInvitation[]>([]);
  const [emailsSent, setEmailsSent] = useState<PendingInvitation[]>([]);
  const [awaitingSignup, setAwaitingSignup] = useState<PendingInvitation[]>([]);
  const [completedSignups, setCompletedSignups] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadDashboardData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      console.log('useDashboardData: Loading dashboard data...', { forceRefresh });
      
      if (forceRefresh) {
        // Clear all caches before refreshing
        unifiedInvitationService.clearCache();
      }
      
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

      console.log('useDashboardData: Loaded dashboard data:', {
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
        toast.success('Dashboard data refreshed successfully');
      }
    } catch (error) {
      console.error('useDashboardData: Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendNextBatch = useCallback(async (batchSize: number = 1000) => {
    if (pendingEmailSend.length === 0) {
      toast.error('No emails pending to send');
      return;
    }

    setIsSending(true);
    try {
      console.log(`useDashboardData: Sending batch of ${batchSize} emails`);
      
      const emailsToSend = pendingEmailSend.slice(0, batchSize).map(inv => inv.email);
      const result = await unifiedInvitationService.sendEmailBatch(emailsToSend, 50);
      
      if (result.success) {
        toast.success(`Email sending started for ${emailsToSend.length} emails. Check batch status for progress.`);
        await loadDashboardData(true); // Force refresh after sending
      } else {
        toast.error(`Failed to send emails: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error('useDashboardData: Error sending emails:', error);
      toast.error(`Error sending emails: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  }, [pendingEmailSend, loadDashboardData]);

  const handleRefresh = useCallback(async () => {
    console.log('useDashboardData: Manual refresh triggered');
    await loadDashboardData(true);
  }, [loadDashboardData]);

  return {
    // State
    unifiedStats,
    batches,
    pendingEmailSend,
    emailsSent,
    awaitingSignup,
    completedSignups,
    isLoading,
    isSending,
    
    // Actions
    loadDashboardData,
    handleSendNextBatch,
    handleRefresh
  };
};
