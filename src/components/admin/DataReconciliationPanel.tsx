
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw, Database, Clock, AlertCircle as AlertIcon, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { dataReconciliationService, type ReconciliationResult, type DuplicateEmailRecord } from '@/services/data-reconciliation';
import { unifiedInvitationService, type UnifiedInvitationStats } from '@/services/unified-invitation-service';

const DataReconciliationPanel = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastReconciliation, setLastReconciliation] = useState<ReconciliationResult | null>(null);
  const [unifiedStats, setUnifiedStats] = useState<UnifiedInvitationStats | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateEmailRecord[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<string[]>([]);

  const handleReconciliation = async () => {
    setIsReconciling(true);
    setDataError(null);
    
    try {
      console.log('DataReconciliationPanel: Starting reconciliation...');
      toast.info('Starting data reconciliation...');
      
      const result = await dataReconciliationService.reconcileHistoricalData();
      setLastReconciliation(result);
      
      if (result.errors.length > 0) {
        console.error('DataReconciliationPanel: Reconciliation errors:', result.errors);
        toast.error(`Reconciliation completed with ${result.errors.length} errors`);
        result.errors.forEach(error => {
          console.error('Reconciliation error:', error);
        });
      } else {
        console.log('DataReconciliationPanel: Reconciliation successful:', result);
        toast.success(`Reconciliation completed successfully! Updated ${result.emailsReconciled} emails and ${result.signupsReconciled} signups.`);
      }
      
      // Force refresh the data after reconciliation
      await loadUnifiedData(true);
    } catch (error: any) {
      console.error('DataReconciliationPanel: Reconciliation failed:', error);
      setDataError(`Reconciliation failed: ${error.message}`);
      toast.error(`Reconciliation failed: ${error.message}`);
    } finally {
      setIsReconciling(false);
    }
  };

  const loadUnifiedData = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    }
    setDataError(null);

    try {
      console.log('DataReconciliationPanel: Loading unified data...', { forceRefresh });
      
      const [statsData, duplicateData, validationResult] = await Promise.all([
        unifiedInvitationService.getUnifiedStats(forceRefresh),
        dataReconciliationService.findDuplicateEmails(),
        unifiedInvitationService.validateDataConsistency()
      ]);
      
      console.log('DataReconciliationPanel: Loaded unified data:', {
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
      console.error('DataReconciliationPanel: Failed to load unified data:', error);
      const errorMessage = `Failed to load data: ${error.message}`;
      setDataError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (forceRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = async () => {
    console.log('DataReconciliationPanel: Manual refresh triggered');
    unifiedInvitationService.clearCache();
    await loadUnifiedData(true);
  };

  React.useEffect(() => {
    console.log('DataReconciliationPanel: Component mounted, loading initial data');
    loadUnifiedData();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Reconciliation & Validation
            </div>
            <div className="flex items-center space-x-2">
              {lastRefreshTime && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </div>
              )}
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertIcon className="h-4 w-4 text-red-600 mr-2" />
                <span className="font-medium text-red-800">Data Loading Error</span>
              </div>
              <p className="text-sm text-red-700">{dataError}</p>
              <Button
                onClick={handleManualRefresh}
                className="mt-2"
                size="sm"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}

          {consistencyIssues.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Shield className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Data Consistency Issues Found</span>
              </div>
              <div className="space-y-1">
                {consistencyIssues.map((issue, index) => (
                  <p key={index} className="text-sm text-yellow-700">• {issue}</p>
                ))}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800">Historical Data Cleanup</span>
            </div>
            <p className="text-sm text-yellow-700">
              This tool reconciles historical data from before the batch email system was implemented. 
              It will mark users as having received emails if they've signed up, and ensure signup completion status is accurate.
            </p>
          </div>

          <Button 
            onClick={handleReconciliation}
            disabled={isReconciling || isRefreshing}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'Reconciling Data...' : 'Run Data Reconciliation'}
          </Button>

          {lastReconciliation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Last Reconciliation Results</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Emails reconciled:</span>
                  <span className="ml-2 font-medium text-green-600">{lastReconciliation.emailsReconciled}</span>
                </div>
                <div>
                  <span className="text-gray-600">Signups reconciled:</span>
                  <span className="ml-2 font-medium text-green-600">{lastReconciliation.signupsReconciled}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duplicates handled:</span>
                  <span className="ml-2 font-medium">{lastReconciliation.duplicatesHandled}</span>
                </div>
                <div>
                  <span className="text-gray-600">Errors:</span>
                  <span className="ml-2 font-medium text-red-600">{lastReconciliation.errors.length}</span>
                </div>
              </div>
              {lastReconciliation.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-red-800">Errors:</p>
                  <div className="text-xs text-red-700 max-h-20 overflow-y-auto">
                    {lastReconciliation.errors.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {unifiedStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Unified Data Status (Authoritative Source)
              </div>
              {isRefreshing && (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{unifiedStats.totalCreated}</div>
                <div className="text-sm text-gray-600">Total Invitations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{unifiedStats.emailsSent}</div>
                <div className="text-sm text-gray-600">Emails Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{unifiedStats.signupsCompleted}</div>
                <div className="text-sm text-gray-600">Signups Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{unifiedStats.emailsPending}</div>
                <div className="text-sm text-gray-600">Pending Emails</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{unifiedStats.awaitingSignup}</div>
                <div className="text-sm text-gray-600">Awaiting Signup</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{duplicates.length}</div>
                <div className="text-sm text-gray-600">Duplicate Emails</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500">
                Conversion Rate: <span className="font-medium">{unifiedStats.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-400">
                Last Updated: {new Date(unifiedStats.lastUpdated).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Duplicate Email Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {duplicates.map((duplicate, index) => (
                <div key={index} className="flex items-center justify-between p-2 border border-red-200 rounded bg-red-50">
                  <div>
                    <span className="font-medium">{duplicate.email}</span>
                    <Badge variant="destructive" className="ml-2">
                      {duplicate.count} records
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    IDs: {duplicate.ids.slice(0, 2).join(', ')}
                    {duplicate.ids.length > 2 && ` +${duplicate.ids.length - 2} more`}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataReconciliationPanel;
