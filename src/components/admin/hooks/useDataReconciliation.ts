
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { dataReconciliationService, type ReconciliationResult, type DuplicateEmailRecord } from '@/services/data-reconciliation';
import { unifiedInvitationService, type UnifiedInvitationStats } from '@/services/unified-invitation';

export const useDataReconciliation = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastReconciliation, setLastReconciliation] = useState<ReconciliationResult | null>(null);
  const [unifiedStats, setUnifiedStats] = useState<UnifiedInvitationStats | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateEmailRecord[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<string[]>([]);

  const loadUnifiedData = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    }
    setDataError(null);

    try {
      console.log('useDataReconciliation: Loading unified data...', { forceRefresh });
      
      // If refreshing, run automatic reconciliation first to ensure data is up to date
      if (forceRefresh) {
        console.log('useDataReconciliation: Running automatic reconciliation...');
        try {
          await dataReconciliationService.reconcileHistoricalData();
          console.log('useDataReconciliation: Automatic reconciliation completed');
        } catch (error: any) {
          console.warn('useDataReconciliation: Automatic reconciliation failed, continuing with data load:', error.message);
        }
      }
      
      const [statsData, duplicateData, validationResult] = await Promise.all([
        unifiedInvitationService.getUnifiedStats(forceRefresh),
        dataReconciliationService.findDuplicateEmails(),
        unifiedInvitationService.validateDataConsistency()
      ]);
      
      console.log('useDataReconciliation: Loaded unified data:', {
        stats: statsData,
        duplicatesCount: duplicateData.length,
        consistencyIssues: validationResult.issues
      });
      
      setUnifiedStats(statsData);
      setDuplicates(duplicateData);
      setConsistencyIssues(validationResult.issues);
      setLastRefreshTime(new Date());
      
      if (forceRefresh) {
        toast.success('Data refreshed successfully');
      }

      if (!validationResult.isConsistent) {
        toast.warning(`Found ${validationResult.issues.length} data consistency issues`);
      }
    } catch (error: any) {
      console.error('useDataReconciliation: Failed to load unified data:', error);
      const errorMessage = `Failed to load data: ${error.message}`;
      setDataError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (forceRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const handleReconciliation = async () => {
    setIsReconciling(true);
    setDataError(null);
    
    try {
      console.log('useDataReconciliation: Starting reconciliation...');
      toast.info('Starting data reconciliation...');
      
      const result = await dataReconciliationService.reconcileHistoricalData();
      setLastReconciliation(result);
      
      if (result.errors.length > 0) {
        console.error('useDataReconciliation: Reconciliation errors:', result.errors);
        toast.error(`Reconciliation completed with ${result.errors.length} errors`);
        result.errors.forEach(error => {
          console.error('Reconciliation error:', error);
        });
      } else {
        console.log('useDataReconciliation: Reconciliation successful:', result);
        toast.success(`Reconciliation completed successfully! Updated ${result.emailsReconciled} emails and ${result.signupsReconciled} signups.`);
      }
      
      // Force refresh the data after reconciliation
      await loadUnifiedData(true);
    } catch (error: any) {
      console.error('useDataReconciliation: Reconciliation failed:', error);
      setDataError(`Reconciliation failed: ${error.message}`);
      toast.error(`Reconciliation failed: ${error.message}`);
    } finally {
      setIsReconciling(false);
    }
  };

  const handleManualRefresh = async () => {
    console.log('useDataReconciliation: Manual refresh triggered');
    unifiedInvitationService.clearCache();
    await loadUnifiedData(true);
  };

  useEffect(() => {
    console.log('useDataReconciliation: Hook mounted, loading initial data');
    loadUnifiedData();
  }, []);

  return {
    isReconciling,
    isRefreshing,
    lastReconciliation,
    unifiedStats,
    duplicates,
    lastRefreshTime,
    dataError,
    consistencyIssues,
    handleReconciliation,
    handleManualRefresh,
    loadUnifiedData
  };
};
