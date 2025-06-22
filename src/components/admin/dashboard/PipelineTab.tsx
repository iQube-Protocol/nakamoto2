
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Send, AlertCircle } from 'lucide-react';
import type { PendingInvitation } from '@/services/unified-invitation';

interface PipelineTabProps {
  pendingEmailSend: PendingInvitation[];
  awaitingSignup: PendingInvitation[];
  isSending: boolean;
  onSendBatch: (batchSize: number) => void;
}

const PipelineTab: React.FC<PipelineTabProps> = ({
  pendingEmailSend,
  awaitingSignup,
  isSending,
  onSendBatch
}) => {
  return (
    <div className="space-y-4">
      {/* Next Batch to Send */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Next Batch Ready to Send ({pendingEmailSend.length})
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              onClick={() => onSendBatch(100)}
              disabled={pendingEmailSend.length === 0 || isSending}
              variant="outline"
              size="sm"
            >
              Send 100
            </Button>
            <Button 
              onClick={() => onSendBatch(1000)}
              disabled={pendingEmailSend.length === 0 || isSending}
            >
              {isSending ? 'Sending...' : 'Send 1000 (Auto-Chunked)'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pendingEmailSend.slice(0, 10).map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-sm text-gray-500">
                    {invitation.persona_type} • Created {new Date(invitation.invited_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">Ready</Badge>
              </div>
            ))}
            {pendingEmailSend.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                ...and {pendingEmailSend.length - 10} more
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Awaiting Signup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Awaiting Signup ({awaitingSignup.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {awaitingSignup.slice(0, 10).map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{invitation.email}</p>
                  <p className="text-sm text-gray-500">
                    {invitation.persona_type} • Sent {new Date(invitation.email_sent_at!).toLocaleDateString()}
                    {invitation.batch_id && ` • Batch: ${invitation.batch_id}`}
                  </p>
                </div>
                <Badge variant="secondary">Sent</Badge>
              </div>
            ))}
            {awaitingSignup.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                ...and {awaitingSignup.length - 10} more
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineTab;
