
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Database,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { DataValidator } from '@/services/unified-invitation/data-validator';
import { BatchManager } from '@/services/unified-invitation/batch-manager';
import type { DetailedValidationResult } from '@/services/unified-invitation/types';

const DataValidationDashboard = () => {
  const [validation, setValidation] = useState<DetailedValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCleaningBatches, setIsCleaningBatches] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      console.log('DataValidationDashboard: Starting validation...');
      const result = await DataValidator.getDetailedValidation();
      setValidation(result);
      setLastValidation(new Date());
      
      if (result.issues.length > 0) {
        toast.warning(`Found ${result.issues.length} data consistency issues`);
      } else {
        toast.success('All data is consistent!');
      }
    } catch (error: any) {
      console.error('DataValidationDashboard: Validation failed:', error);
      toast.error(`Validation failed: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const cleanupStuckBatches = async () => {
    setIsCleaningBatches(true);
    try {
      console.log('DataValidationDashboard: Cleaning up stuck batches...');
      const result = await BatchManager.cleanupStuckBatches();
      
      if (result.cleaned > 0) {
        toast.success(`Cleaned up ${result.cleaned} stuck batches`);
        // Re-run validation after cleanup
        await runValidation();
      } else {
        toast.info('No stuck batches found to clean up');
      }
      
      if (result.errors.length > 0) {
        toast.error(`Cleanup errors: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      console.error('DataValidationDashboard: Cleanup failed:', error);
      toast.error(`Cleanup failed: ${error.message}`);
    } finally {
      setIsCleaningBatches(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Validation Dashboard
          </div>
          <div className="flex items-center space-x-2">
            {lastValidation && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                Last: {lastValidation.toLocaleTimeString()}
              </div>
            )}
            <Button
              onClick={cleanupStuckBatches}
              disabled={isCleaningBatches}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isCleaningBatches ? 'animate-spin' : ''}`} />
              Cleanup Stuck Batches
            </Button>
            <Button
              onClick={runValidation}
              disabled={isValidating}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isValidating ? 'animate-spin' : ''}`} />
              Run Validation
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!validation && !isValidating && (
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Click "Run Validation" to check data consistency</p>
          </div>
        )}

        {isValidating && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Validating data consistency...</p>
          </div>
        )}

        {validation && (
          <>
            {/* Validation Status */}
            <div className="flex items-center justify-center p-4 rounded-lg border">
              {validation.isConsistent ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  <span className="font-medium">Data is consistent</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  <span className="font-medium">{validation.issues.length} consistency issues found</span>
                </div>
              )}
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {validation.detailedStats.totalInvitations || 0}
                </div>
                <div className="text-sm text-gray-600">Total Invitations</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-green-600">
                  {validation.detailedStats.emailsSent || 0}
                </div>
                <div className="text-sm text-gray-600">Emails Sent</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-orange-600">
                  {validation.detailedStats.emailsPending || 0}
                </div>
                <div className="text-sm text-gray-600">Emails Pending</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-purple-600">
                  {validation.detailedStats.signupsCompleted || 0}
                </div>
                <div className="text-sm text-gray-600">Signups Completed</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-indigo-600">
                  {validation.detailedStats.totalBatches || 0}
                </div>
                <div className="text-sm text-gray-600">Total Batches</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-pink-600">
                  {validation.detailedStats.batchEmailTotals || 0}
                </div>
                <div className="text-sm text-gray-600">Batch Email Total</div>
              </div>
            </div>

            {/* Issues List */}
            {validation.issues.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-red-700 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Consistency Issues
                </h3>
                {validation.issues.map((issue, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">• {issue}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Math Verification */}
            <div className="p-3 bg-gray-50 border rounded">
              <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Math Verification
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Sent + Pending = Total: {validation.detailedStats.emailsSent || 0} + {validation.detailedStats.emailsPending || 0} = {(validation.detailedStats.emailsSent || 0) + (validation.detailedStats.emailsPending || 0)}
                  {(validation.detailedStats.emailsSent || 0) + (validation.detailedStats.emailsPending || 0) === (validation.detailedStats.totalInvitations || 0) ? 
                    <Badge variant="default" className="ml-2">✓ Correct</Badge> : 
                    <Badge variant="destructive" className="ml-2">✗ Mismatch</Badge>
                  }
                </p>
                <p>
                  Expected Total: {validation.detailedStats.totalInvitations || 0}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DataValidationDashboard;
