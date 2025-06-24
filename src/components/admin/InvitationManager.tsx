import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Send, Users, CheckCircle, Clock, AlertCircle, FileText, Merge, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { invitationService, type InvitationData, type PendingInvitation, type DeduplicationStats, type BatchProgress } from '@/services/invitation-service';
import BatchProgressDialog from './BatchProgressDialog';
import InvitationDashboard from './InvitationDashboard';
import DataReconciliationPanel from './DataReconciliationPanel';

// Define a simpler BatchProgress for the reconciliation dialog
interface SimpleProgress {
  batchId: string;
  totalEmails: number;
  emailsProcessed: number;
  emailsSuccessful: number;
  emailsFailed: number;
  errors: string[];
  isComplete: boolean;
}

const InvitationManager = () => {
  const [selectedPersonaType, setSelectedPersonaType] = useState<'knyt' | 'qrypto'>('knyt');
  const [csvContent, setCsvContent] = useState('');
  const [parsedInvitations, setParsedInvitations] = useState<InvitationData[]>([]);
  const [deduplicationStats, setDeduplicationStats] = useState<DeduplicationStats | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [completedInvitations, setCompletedInvitations] = useState<PendingInvitation[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing invitations
  const loadInvitations = async () => {
    const [pending, completed] = await Promise.all([
      invitationService.getPendingInvitations(),
      invitationService.getCompletedInvitations()
    ]);
    setPendingInvitations(pending);
    setCompletedInvitations(completed);
  };

  React.useEffect(() => {
    loadInvitations();
  }, []);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      
      try {
        const { invitations, stats } = invitationService.parseCSV(content, selectedPersonaType);
        setParsedInvitations(invitations);
        setDeduplicationStats(stats);
        
        let message = `Parsed ${stats.finalCount} unique invitations`;
        if (stats.duplicatesFound > 0) {
          message += ` (${stats.duplicatesFound} duplicates merged)`;
        }
        toast.success(message);
      } catch (error) {
        toast.error(`Error parsing CSV: ${error}`);
        setParsedInvitations([]);
        setDeduplicationStats(null);
      }
    };
    reader.readAsText(file);
  };

  // Create invitations in database with progress tracking
  const handleCreateInvitations = async () => {
    if (parsedInvitations.length === 0) {
      toast.error('No invitations to create');
      return;
    }

    setIsUploading(true);
    setShowProgressDialog(true);
    
    try {
      const result = await invitationService.createInvitations(
        parsedInvitations,
        (progress: BatchProgress) => {
          setBatchProgress(progress);
        }
      );
      
      if (result.success) {
        // Show success message with details
        if (result.errors.length > 0) {
          // Show success with additional info (like skipped emails)
          result.errors.forEach(message => {
            if (message.includes('Successfully created')) {
              toast.success(message);
            } else {
              toast.info(message);
            }
          });
        } else {
          toast.success(`Created ${parsedInvitations.length} invitations successfully`);
        }
        
        setParsedInvitations([]);
        setCsvContent('');
        setDeduplicationStats(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadInvitations();
      } else {
        // Show error messages
        result.errors.forEach(error => {
          toast.error(error);
        });
      }
    } catch (error: any) {
      toast.error(`Error creating invitations: ${error.message}`);
      setBatchProgress(prev => prev ? {
        ...prev,
        errors: [...prev.errors, `Unexpected error: ${error.message}`]
      } : null);
    } finally {
      setIsUploading(false);
      // Keep dialog open for a moment to show final results
      setTimeout(() => {
        setShowProgressDialog(false);
        setBatchProgress(null);
      }, 3000);
    }
  };

  const handleCancelBatch = () => {
    setShowProgressDialog(false);
    setBatchProgress(null);
    setIsUploading(false);
    toast.info('Batch processing cancelled');
  };

  // Send invitation emails
  const handleSendEmails = async () => {
    if (pendingInvitations.length === 0) {
      toast.error('No pending invitations to send');
      return;
    }

    setIsSendingEmails(true);
    try {
      const emails = pendingInvitations.map(inv => inv.email);
      const result = await invitationService.sendInvitationEmails(emails);
      
      if (result.success) {
        toast.success(`Sent invitation emails to ${emails.length} recipients`);
      } else {
        toast.error(`Failed to send some emails: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      toast.error(`Error sending emails: ${error}`);
    } finally {
      setIsSendingEmails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Batch Progress Dialog */}
      <BatchProgressDialog
        open={showProgressDialog}
        progress={batchProgress}
        onCancel={handleCancelBatch}
        canCancel={!batchProgress || batchProgress.emailsProcessed < batchProgress.totalEmails}
      />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="reconcile">
            <AlertCircle className="h-4 w-4 mr-2" />
            Data Cleanup
          </TabsTrigger>
          <TabsTrigger value="legacy">
            <Users className="h-4 w-4 mr-2" />
            Legacy View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <InvitationDashboard />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload CSV Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload User Data CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="persona-type">Persona Type</Label>
                <Select value={selectedPersonaType} onValueChange={(value) => setSelectedPersonaType(value as 'knyt' | 'qrypto')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="knyt">KNYT Persona</SelectItem>
                    <SelectItem value="qrypto">Qrypto Persona</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload a CSV file with user data. First row should contain column headers. Duplicate emails will be automatically merged.
                </p>
              </div>

              {csvContent && (
                <>
                  <div>
                    <Label>CSV Preview</Label>
                    <Textarea
                      value={csvContent.split('\n').slice(0, 5).join('\n')}
                      readOnly
                      rows={5}
                      className="font-mono text-xs"
                    />
                  </div>

                  {deduplicationStats && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <FileText className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">Processing Summary</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total entries:</span>
                          <span className="ml-2 font-medium">{deduplicationStats.totalEntries}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Final count:</span>
                          <span className="ml-2 font-medium text-green-600">{deduplicationStats.finalCount}</span>
                        </div>
                        {deduplicationStats.duplicatesFound > 0 && (
                          <>
                            <div>
                              <span className="text-gray-600">Duplicates merged:</span>
                              <span className="ml-2 font-medium text-orange-600">{deduplicationStats.duplicatesFound}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Affected emails:</span>
                              <span className="ml-2 font-medium">{deduplicationStats.mergedEmails.length}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {deduplicationStats.mergedEmails.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center mb-1">
                            <Merge className="h-3 w-3 text-orange-600 mr-1" />
                            <span className="text-xs font-medium text-orange-800">Merged emails:</span>
                          </div>
                          <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                            {deduplicationStats.mergedEmails.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <Button 
                onClick={handleCreateInvitations}
                disabled={parsedInvitations.length === 0 || isUploading}
                className="w-full"
              >
                {isUploading ? 'Processing...' : `Create ${parsedInvitations.length} Invitations`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconcile">
          <DataReconciliationPanel />
        </TabsContent>

        <TabsContent value="legacy" className="space-y-6">
          {/* Pending Invitations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                All Invitations ({pendingInvitations.length})
              </CardTitle>
              <Button 
                onClick={handleSendEmails}
                disabled={pendingInvitations.length === 0 || isSendingEmails}
                variant="outline"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSendingEmails ? 'Sending...' : 'Send All Emails'}
              </Button>
            </CardHeader>
            <CardContent>
              {pendingInvitations.length === 0 ? (
                <p className="text-gray-500">No pending invitations</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          {invitation.persona_type} • Invited {new Date(invitation.invited_at).toLocaleDateString()}
                          {invitation.email_sent && ` • Email sent ${new Date(invitation.email_sent_at!).toLocaleDateString()}`}
                          {invitation.batch_id && ` • Batch: ${invitation.batch_id}`}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {invitation.email_sent ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Completed Signups ({completedInvitations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedInvitations.length === 0 ? (
                <p className="text-gray-500">No completed signups yet</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {completedInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          {invitation.persona_type} • Signed up
                        </p>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvitationManager;
