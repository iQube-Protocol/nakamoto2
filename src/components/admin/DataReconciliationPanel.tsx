
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
