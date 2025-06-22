
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { PendingInvitation } from '@/services/unified-invitation';

interface ExportTabProps {
  pendingEmailSend: PendingInvitation[];
  emailsSent: PendingInvitation[];
  awaitingSignup: PendingInvitation[];
  completedSignups: PendingInvitation[];
}

const ExportTab: React.FC<ExportTabProps> = ({
  pendingEmailSend,
  emailsSent,
  awaitingSignup,
  completedSignups
}) => {
  const exportEmails = (emails: PendingInvitation[], filename: string) => {
    const csvContent = [
      'Email,Persona Type,Invited At,Email Sent,Email Sent At,Batch ID,Send Attempts',
      ...emails.map(inv => 
        `${inv.email},${inv.persona_type},${inv.invited_at},${inv.email_sent || false},${inv.email_sent_at || ''},${inv.batch_id || ''},${inv.send_attempts || 0}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => exportEmails(pendingEmailSend, 'pending-email-send.csv')}
            disabled={pendingEmailSend.length === 0}
            variant="outline"
            className="justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Pending Email Send ({pendingEmailSend.length})
          </Button>
          <Button
            onClick={() => exportEmails(emailsSent, 'emails-sent.csv')}
            disabled={emailsSent.length === 0}
            variant="outline"
            className="justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Emails Sent ({emailsSent.length})
          </Button>
          <Button
            onClick={() => exportEmails(awaitingSignup, 'awaiting-signup.csv')}
            disabled={awaitingSignup.length === 0}
            variant="outline"
            className="justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Awaiting Signup ({awaitingSignup.length})
          </Button>
          <Button
            onClick={() => exportEmails(completedSignups, 'completed-signups.csv')}
            disabled={completedSignups.length === 0}
            variant="outline"
            className="justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Completed Signups ({completedSignups.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportTab;
