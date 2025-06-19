
import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Send, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { invitationService, type InvitationData, type PendingInvitation } from '@/services/invitation-service';

const InvitationManager = () => {
  const [selectedPersonaType, setSelectedPersonaType] = useState<'knyt' | 'qrypto'>('knyt');
  const [csvContent, setCsvContent] = useState('');
  const [parsedInvitations, setParsedInvitations] = useState<InvitationData[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [completedInvitations, setCompletedInvitations] = useState<PendingInvitation[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
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
        const invitations = invitationService.parseCSV(content, selectedPersonaType);
        setParsedInvitations(invitations);
        toast.success(`Parsed ${invitations.length} potential invitations`);
      } catch (error) {
        toast.error(`Error parsing CSV: ${error}`);
        setParsedInvitations([]);
      }
    };
    reader.readAsText(file);
  };

  // Create invitations in database
  const handleCreateInvitations = async () => {
    if (parsedInvitations.length === 0) {
      toast.error('No invitations to create');
      return;
    }

    setIsUploading(true);
    try {
      const result = await invitationService.createInvitations(parsedInvitations);
      
      if (result.success) {
        toast.success(`Created ${parsedInvitations.length} invitations successfully`);
        setParsedInvitations([]);
        setCsvContent('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadInvitations();
      } else {
        toast.error(`Failed to create invitations: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      toast.error(`Error creating invitations: ${error}`);
    } finally {
      setIsUploading(false);
    }
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
              Upload a CSV file with user data. First row should contain column headers.
            </p>
          </div>

          {csvContent && (
            <div>
              <Label>CSV Preview</Label>
              <Textarea
                value={csvContent.split('\n').slice(0, 5).join('\n')}
                readOnly
                rows={5}
                className="font-mono text-xs"
              />
              <p className="text-sm text-gray-500 mt-1">
                Showing first 5 rows. Parsed {parsedInvitations.length} invitations.
              </p>
            </div>
          )}

          <Button 
            onClick={handleCreateInvitations}
            disabled={parsedInvitations.length === 0 || isUploading}
            className="w-full"
          >
            {isUploading ? 'Creating Invitations...' : `Create ${parsedInvitations.length} Invitations`}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Pending Invitations ({pendingInvitations.length})
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
                    </p>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
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
    </div>
  );
};

export default InvitationManager;
