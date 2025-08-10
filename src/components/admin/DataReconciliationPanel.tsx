
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDataReconciliation } from './hooks/useDataReconciliation';
import DataReconciliationHeader from './components/DataReconciliationHeader';
import DataErrorDisplay from './components/DataErrorDisplay';
import ConsistencyIssuesDisplay from './components/ConsistencyIssuesDisplay';
import ReconciliationControl from './components/ReconciliationControl';
import ReconciliationResults from './components/ReconciliationResults';
import UnifiedStatsCard from './components/UnifiedStatsCard';
import DuplicateEmailsList from './components/DuplicateEmailsList';

const DataReconciliationPanel = () => {
  const {
    isReconciling,
    isRefreshing,
    lastReconciliation,
    unifiedStats,
    duplicates,
    lastRefreshTime,
    dataError,
    consistencyIssues,
    handleReconciliation,
    handleManualRefresh
  } = useDataReconciliation();

  const [isBackfilling, setIsBackfilling] = React.useState(false);

  const handleBackfill = async () => {
    setIsBackfilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('backfill-direct-signups');
      if (error) throw error;

      const inserted = (data as any)?.invitesInserted ?? 0;
      const personas = (data as any)?.personasCreated ?? 0;
      toast.success(`Backfill complete: ${inserted} invites, ${personas} personas created`);
      await handleManualRefresh();
    } catch (e: any) {
      console.error('Backfill failed', e);
      toast.error(`Backfill failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <DataReconciliationHeader
              lastRefreshTime={lastRefreshTime}
              isRefreshing={isRefreshing}
              onRefresh={handleManualRefresh}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataError && (
            <DataErrorDisplay
              error={dataError}
              onRetry={handleManualRefresh}
            />
          )}

          <ConsistencyIssuesDisplay issues={consistencyIssues} />

          <ReconciliationControl
            isReconciling={isReconciling}
            isRefreshing={isRefreshing}
            onReconcile={handleReconciliation}
          />

          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={handleBackfill}
              disabled={isBackfilling || isRefreshing || isReconciling}
            >
              {isBackfilling ? 'Backfilling…' : 'Backfill Direct Signups'}
            </Button>
          </div>

          {lastReconciliation && (
            <ReconciliationResults result={lastReconciliation} />
          )}
        </CardContent>
      </Card>

      {unifiedStats && (
        <UnifiedStatsCard
          stats={unifiedStats}
          duplicatesCount={duplicates.length}
          isRefreshing={isRefreshing}
        />
      )}

      <DuplicateEmailsList duplicates={duplicates} />
    </div>
  );
};

export default DataReconciliationPanel;
