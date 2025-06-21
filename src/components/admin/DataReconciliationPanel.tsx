import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';
import { dataReconciliationService, type ReconciliationResult, type DuplicateEmailRecord } from '@/services/data-reconciliation';

const DataReconciliationPanel = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const [lastReconciliation, setLastReconciliation] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  const handleReconciliation = async () => {
    setIsReconciling(true);
    try {
      toast.info('Starting data reconciliation...');
      const result = await dataReconciliationService.reconcileHistoricalData();
      
      setLastReconciliation(result);
      
      if (result.errors.length > 0) {
        toast.error(`Reconciliation completed with ${result.errors.length} errors`);
        result.errors.forEach(error => {
          console.error('Reconciliation error:', error);
        });
      } else {
        toast.success(`Reconciliation completed successfully! Updated ${result.emailsReconciled} emails and ${result.signupsReconciled} signups.`);
      }
      
      // Refresh the report
      await loadReport();
    } catch (error: any) {
      toast.error(`Reconciliation failed: ${error.message}`);
    } finally {
      setIsReconciling(false);
    }
  };

  const loadReport = async () => {
    try {
      const [reportData, duplicateData] = await Promise.all([
        dataReconciliationService.getReconciliationReport(),
        dataReconciliationService.findDuplicateEmails()
      ]);
      setReport(reportData);
      setDuplicates(duplicateData);
    } catch (error: any) {
      toast.error(`Failed to load report: ${error.message}`);
    }
  };

  React.useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            disabled={isReconciling}
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

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Current Data Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{report.totalInvitations}</div>
                <div className="text-sm text-gray-600">Total Invitations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{report.emailsSent}</div>
                <div className="text-sm text-gray-600">Emails Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{report.signupsCompleted}</div>
                <div className="text-sm text-gray-600">Signups Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{report.pendingEmails}</div>
                <div className="text-sm text-gray-600">Pending Emails</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{report.awaitingSignup}</div>
                <div className="text-sm text-gray-600">Awaiting Signup</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{duplicates.length}</div>
                <div className="text-sm text-gray-600">Duplicate Emails</div>
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
