
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { unifiedInvitationService } from '@/services/unified-invitation';
import { StatsCalculator } from '@/services/unified-invitation/stats-calculator';
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
      console.log('useDashboardData: Loading dashboard data with enhanced monitoring...', { forceRefresh });
      
      if (forceRefresh) {
        // Force refresh all data from service
        await unifiedInvitationService.forceRefreshAllData();
      }
      
      // Load all data in parallel - use real-time stats for maximum accuracy
      const [
        realTimeStats,
        batchesData,
        pendingData,
        sentData,
        awaitingData,
        completedData
      ] = await Promise.all([
        StatsCalculator.getRealTimeStats(), // Use new real-time method
        unifiedInvitationService.getEmailBatches(),
        unifiedInvitationService.getPendingEmailSend(50000), // Increased limit to get all records
        unifiedInvitationService.getEmailsSent(),
        unifiedInvitationService.getAwaitingSignup(),
        unifiedInvitationService.getCompletedInvitations()
      ]);

      console.log('useDashboardData: Loaded data with real-time stats:', {
        realTimeStats,
        batchesCount: batchesData.length,
        pendingCount: pendingData.length,
        sentCount: sentData.length,
        awaitingCount: awaitingData.length,
        completedCount: completedData.length
      });

      // Set all the data - using real-time stats for maximum accuracy
      setUnifiedStats(realTimeStats);
      setBatches(batchesData);
      setPendingEmailSend(pendingData);
      setEmailsSent(sentData);
      setAwaitingSignup(awaitingData);
      setCompletedSignups(completedData);

      // Validate data consistency and warn if issues found
      const basicMathCheck = realTimeStats.emailsSent + realTimeStats.emailsPending === realTimeStats.totalCreated;
      const signupMathCheck = realTimeStats.signupsCompleted + realTimeStats.awaitingSignup <= realTimeStats.emailsSent;
      
      if (!basicMathCheck) {
        console.error('useDashboardData: CRITICAL - Basic math validation failed!');
        toast.error('Data inconsistency detected! Please check Data Integrity Monitor.');
      }
      
      if (!signupMathCheck) {
        console.error('useDashboardData: CRITICAL - Signup math validation failed!');
        toast.error('Signup data inconsistency detected! Please check Data Integrity Monitor.');
      }

      if (forceRefresh) {
        toast.success(`Dashboard refreshed: ${batchesData.length} batches, ${sentData.length} sent emails, ${pendingData.length} pending`);
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
