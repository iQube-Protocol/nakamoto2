import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { BatchManager } from '@/services/unified-invitation/batch-manager';
import { unifiedInvitationService } from '@/services/unified-invitation';
import type { BatchStatus } from '@/services/unified-invitation/types';

interface BatchRetryControlProps {
  batches: BatchStatus[];
  onBatchRetried: () => void;
}

const BatchRetryControl: React.FC<BatchRetryControlProps> = ({ batches, onBatchRetried }) => {
  const [retryingBatch, setRetryingBatch] = useState<string | null>(null);
  const [checkingEmails, setCheckingEmails] = useState<string | null>(null);

  const handleRetryBatch = async (batchId: string) => {
    setRetryingBatch(batchId);
    try {
      console.log(`BatchRetryControl: Retrying batch ${batchId}`);
      
      // Check for pending emails (those with email_sent = false)
      const pendingEmails = await unifiedInvitationService.getPendingEmailSend(1000);
      const batchPendingEmails = pendingEmails.filter(email => 
        email.batch_id === batchId || !email.batch_id
      );
      
      if (batchPendingEmails.length === 0) {
        toast.info(`No pending emails found for batch ${batchId}. All emails may have already been sent.`);
        onBatchRetried();
        return;
      }
      
      const result = await BatchManager.retryStuckBatch(batchId);
      
      if (result.success) {
        toast.success(result.message);
        onBatchRetried();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('BatchRetryControl: Retry failed:', error);
      toast.error(`Retry failed: ${error.message}`);
    } finally {
      setRetryingBatch(null);
    }
  };

  const checkBatchEmails = async (batchId: string) => {
    setCheckingEmails(batchId);
    try {
      const [pendingEmails, sentEmails] = await Promise.all([
        unifiedInvitationService.getPendingEmailSend(1000),
        unifiedInvitationService.getEmailsSent()
      ]);
      
      const batchPending = pendingEmails.filter(email => email.batch_id === batchId);
      const batchSent = sentEmails.filter(email => email.batch_id === batchId);
      
      toast.info(`Batch ${batchId}: ${batchPending.length} pending, ${batchSent.length} sent`, {
        duration: 5000
      });
    } catch (error: any) {
      console.error('Error checking batch emails:', error);
      toast.error(`Failed to check batch emails: ${error.message}`);
    } finally {
      setCheckingEmails(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const problematicBatches = batches.filter(batch => {
    const isStuck = batch.status === 'pending' && batch.createdAt && 
      Date.now() - new Date(batch.createdAt).getTime() > 300000; // 5 minutes
    const hasFailed = batch.status === 'failed';
    const hasErrors = batch.errors.length > 0;
    const hasIncompleteProgress = batch.status === 'in_progress' && 
      batch.createdAt && Date.now() - new Date(batch.createdAt).getTime() > 600000; // 10 minutes
    
    return isStuck || hasFailed || hasErrors || hasIncompleteProgress;
  });

  const needsAttention = problematicBatches.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <RotateCcw className="h-5 w-5 mr-2" />
            Batch Retry Control
            {needsAttention && (
              <Badge variant="destructive" className="ml-2">
                {problematicBatches.length} need attention
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Total batches: {batches.length}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!needsAttention ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
            <p className="text-gray-600">All {batches.length} batches are running smoothly!</p>
            <p className="text-sm text-gray-500 mt-2">
              No stuck, failed, or problematic batches detected.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Found {problematicBatches.length} batches that need attention out of {batches.length} total:
            </div>
            
            {problematicBatches.map((batch) => {
              const isStuck = batch.status === 'pending' && batch.createdAt && 
                Date.now() - new Date(batch.createdAt).getTime() > 300000;
              const isStuckInProgress = batch.status === 'in_progress' && batch.createdAt && 
                Date.now() - new Date(batch.createdAt).getTime() > 600000;
              
              return (
                <div key={batch.batchId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {getStatusIcon(batch.status)}
                      <span className="font-medium ml-2">{batch.batchId}</span>
                      <Badge variant={getStatusVariant(batch.status) as any} className="ml-2">
                        {batch.status}
                      </Badge>
                      {isStuck && (
                        <Badge variant="destructive" className="ml-2">
                          Stuck (Pending)
                        </Badge>
                      )}
                      {isStuckInProgress && (
                        <Badge variant="destructive" className="ml-2">
                          Stuck (In Progress)
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => checkBatchEmails(batch.batchId)}
                        disabled={checkingEmails === batch.batchId}
                        size="sm"
                        variant="ghost"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${checkingEmails === batch.batchId ? 'animate-spin' : ''}`} />
                        Check Status
                      </Button>
                      
                      {(batch.status === 'pending' || batch.status === 'failed' || isStuckInProgress) && (
                        <Button
                          onClick={() => handleRetryBatch(batch.batchId)}
                          disabled={retryingBatch === batch.batchId}
                          size="sm"
                          variant="outline"
                        >
                          <RotateCcw className={`h-4 w-4 mr-1 ${retryingBatch === batch.batchId ? 'animate-spin' : ''}`} />
                          {retryingBatch === batch.batchId ? 'Retrying...' : 'Retry'}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                    <div>Total: {batch.totalEmails}</div>
                    <div>Sent: {batch.emailsSent}</div>
                    <div>Failed: {batch.emailsFailed}</div>
                  </div>
                  
                  {batch.createdAt && (
                    <div className="text-xs text-gray-500 mb-2">
                      Created: {new Date(batch.createdAt).toLocaleString()}
                      {isStuck && (
                        <span className="text-red-600 ml-2">
                          (Stuck for {Math.round((Date.now() - new Date(batch.createdAt).getTime()) / 60000)} minutes)
                        </span>
                      )}
                      {isStuckInProgress && (
                        <span className="text-red-600 ml-2">
                          (In progress for {Math.round((Date.now() - new Date(batch.createdAt).getTime()) / 60000)} minutes)
                        </span>
                      )}
                    </div>
                  )}
                  
                  {batch.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-600 font-medium">Errors:</p>
                      {batch.errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-600">• {error}</p>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Progress: {batch.emailsSent}/{batch.totalEmails} 
                    ({batch.totalEmails > 0 ? Math.round((batch.emailsSent / batch.totalEmails) * 100) : 0}%)
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchRetryControl;
