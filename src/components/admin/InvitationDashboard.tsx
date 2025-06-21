
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { invitationService, type InvitationStats, type EmailBatch, type PendingInvitation } from '@/services/invitation-service';

const InvitationDashboard = () => {
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [batches, setBatches] = useState<EmailBatch[]>([]);
  const [pendingEmailSend, setPendingEmailSend] = useState<PendingInvitation[]>([]);
  const [emailsSent, setEmailsSent] = useState<PendingInvitation[]>([]);
  const [awaitingSignup, setAwaitingSignup] = useState<PendingInvitation[]>([]);
  const [completedSignups, setCompletedSignups] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        batchesData,
        pendingData,
        sentData,
        awaitingData,
        completedData
      ] = await Promise.all([
        invitationService.getInvitationStats(),
        invitationService.getEmailBatches(),
        invitationService.getPendingEmailSend(1000), // Show next 1000 to send
        invitationService.getEmailsSent(),
        invitationService.getAwaitingSignup(),
        invitationService.getCompletedInvitations()
      ]);

      setStats(statsData);
      setBatches(batchesData);
      setPendingEmailSend(pendingData);
      setEmailsSent(sentData);
      setAwaitingSignup(awaitingData);
      setCompletedSignups(completedData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSendNextBatch = async (batchSize: number = 1000) => {
    if (pendingEmailSend.length === 0) {
      toast.error('No emails pending to send');
      return;
    }

    setIsSending(true);
    try {
      const emailsToSend = pendingEmailSend.slice(0, batchSize).map(inv => inv.email);
      const result = await invitationService.sendInvitationEmails(emailsToSend);
      
      if (result.success) {
        toast.success(`Successfully sent ${emailsToSend.length} invitation emails`);
        await loadDashboardData(); // Refresh data
      } else {
        toast.error(`Failed to send some emails: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      toast.error(`Error sending emails: ${error}`);
    } finally {
      setIsSending(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Created</p>
                <p className="text-2xl font-bold">{stats?.totalCreated || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold">{stats?.emailsSent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Send</p>
                <p className="text-2xl font-bold">{stats?.emailsPending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Awaiting Signup</p>
                <p className="text-2xl font-bold">{stats?.awaitingSignup || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats?.signupsCompleted || 0}</p>
                <p className="text-xs text-gray-500">
                  {stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}% conversion` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Next Batch to Send */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Next Batch Ready to Send ({pendingEmailSend.length})
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleSendNextBatch(100)}
                  disabled={pendingEmailSend.length === 0 || isSending}
                  variant="outline"
                  size="sm"
                >
                  Send 100
                </Button>
                <Button 
                  onClick={() => handleSendNextBatch(1000)}
                  disabled={pendingEmailSend.length === 0 || isSending}
                >
                  {isSending ? 'Sending...' : 'Send 1000'}
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
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Email Pipeline Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Created:</span>
                      <span className="font-medium">{stats?.totalCreated || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emails Sent:</span>
                      <span className="font-medium text-green-600">{stats?.emailsSent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Send:</span>
                      <span className="font-medium text-orange-600">{stats?.emailsPending || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Awaiting Signup:</span>
                      <span className="font-medium text-yellow-600">{stats?.awaitingSignup || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium text-green-600">{stats?.signupsCompleted || 0}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Conversion Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Email Send Rate:</span>
                      <span className="font-medium">
                        {stats?.totalCreated ? ((stats.emailsSent / stats.totalCreated) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signup Conversion:</span>
                      <span className="font-medium">
                        {stats?.conversionRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Batches:</span>
                      <span className="font-medium">{batches.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
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
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Dashboard
        </Button>
      </div>
    </div>
  );
};

export default InvitationDashboard;
