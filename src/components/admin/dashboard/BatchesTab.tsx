
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EmailBatch, BatchStatus } from '@/services/unified-invitation';
import BatchRetryControl from '../components/BatchRetryControl';

interface BatchesTabProps {
  batches: EmailBatch[];
  onRefresh: () => void;
}

const BatchesTab: React.FC<BatchesTabProps> = ({ batches, onRefresh }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Email Sending Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{batch.batch_id}</h3>
                  <Badge 
                    variant={
                      batch.status === 'completed' ? 'default' :
                      batch.status === 'failed' ? 'destructive' :
                      batch.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                  >
                    {batch.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-1 font-medium">{batch.total_emails}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sent:</span>
                    <span className="ml-1 font-medium text-green-600">{batch.emails_sent}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Failed:</span>
                    <span className="ml-1 font-medium text-red-600">{batch.emails_failed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <span className="ml-1 font-medium">
                      {batch.started_at ? new Date(batch.started_at).toLocaleDateString() : 'Not started'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <BatchRetryControl 
        batches={batches.map(b => ({
          batchId: b.batch_id,
          status: b.status as any,
          totalEmails: b.total_emails,
          emailsSent: b.emails_sent,
          emailsFailed: b.emails_failed,
          errors: [],
          createdAt: b.created_at,
          startedAt: b.started_at,
          completedAt: b.completed_at
        }))}
        onBatchRetried={onRefresh}
      />
    </div>
  );
};

export default BatchesTab;
