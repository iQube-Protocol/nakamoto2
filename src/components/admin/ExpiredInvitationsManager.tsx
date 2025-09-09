import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, RefreshCw, Clock, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { invitationExpirationService } from '@/services/invitation-expiration-service';

interface ExpiredInvitation {
  id: string;
  email: string;
  persona_type: string;
  invited_at: string;
  expires_at: string;
  email_sent: boolean;
  send_attempts: number;
}

const ExpiredInvitationsManager = () => {
  const [expiredInvitations, setExpiredInvitations] = useState<ExpiredInvitation[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [extendDays, setExtendDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  const loadExpiredInvitations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('invited_users')
        .select('id, email, persona_type, invited_at, expires_at, email_sent, send_attempts')
        .eq('signup_completed', false)
        .lt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false });

      if (error) {
        console.error('Error fetching expired invitations:', error);
        toast.error('Failed to load expired invitations');
        return;
      }

      setExpiredInvitations(data || []);
    } catch (error) {
      console.error('Error loading expired invitations:', error);
      toast.error('Failed to load expired invitations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpiredInvitations();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(expiredInvitations.map(inv => inv.email));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectInvitation = (email: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails(prev => [...prev, email]);
    } else {
      setSelectedEmails(prev => prev.filter(e => e !== email));
    }
  };

  const handleExtendSelected = async () => {
    if (selectedEmails.length === 0) {
      toast.error('Please select invitations to extend');
      return;
    }

    setIsExtending(true);
    try {
      const result = await invitationExpirationService.extendInvitationExpiration(
        selectedEmails, 
        extendDays
      );

      if (result.success) {
        toast.success(`Extended ${result.updatedCount} invitations by ${extendDays} days`);
        setSelectedEmails([]);
        await loadExpiredInvitations();
      } else {
        toast.error(`Failed to extend invitations: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error extending invitations:', error);
      toast.error('Failed to extend invitations');
    } finally {
      setIsExtending(false);
    }
  };

  const handleExtendAll = async () => {
    if (expiredInvitations.length === 0) {
      toast.error('No expired invitations to extend');
      return;
    }

    setIsExtending(true);
    try {
      const allEmails = expiredInvitations.map(inv => inv.email);
      const result = await invitationExpirationService.extendInvitationExpiration(
        allEmails, 
        extendDays
      );

      if (result.success) {
        toast.success(`Extended all ${result.updatedCount} expired invitations by ${extendDays} days`);
        setSelectedEmails([]);
        await loadExpiredInvitations();
      } else {
        toast.error(`Failed to extend invitations: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error extending all invitations:', error);
      toast.error('Failed to extend all invitations');
    } finally {
      setIsExtending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysExpired = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = now.getTime() - expiry.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Expired Invitations ({expiredInvitations.length})
            </CardTitle>
            <Button onClick={loadExpiredInvitations} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="extend-days">Extend by:</Label>
              <Input
                id="extend-days"
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                min="1"
                max="365"
                className="w-20"
              />
              <span className="text-sm text-gray-500">days</span>
            </div>
            
            <div className="flex gap-2 ml-auto">
              <Button
                onClick={handleExtendSelected}
                disabled={selectedEmails.length === 0 || isExtending}
                variant="default"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isExtending ? 'Extending...' : `Extend Selected (${selectedEmails.length})`}
              </Button>
              
              <Button
                onClick={handleExtendAll}
                disabled={expiredInvitations.length === 0 || isExtending}
                variant="secondary"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isExtending ? 'Extending...' : 'Extend All'}
              </Button>
            </div>
          </div>

          {expiredInvitations.length > 0 && (
            <div className="text-sm text-gray-600 mb-4">
              Select invitations to reactivate by extending their expiration dates. 
              This will change their status from "Expired" to "Active".
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired Invitations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin mr-2" />
              <span>Loading expired invitations...</span>
            </div>
          ) : expiredInvitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Expired Invitations</h3>
              <p className="text-gray-500">All invitations are currently active or completed.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEmails.length === expiredInvitations.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Persona Type</TableHead>
                  <TableHead>Invited Date</TableHead>
                  <TableHead>Expired Date</TableHead>
                  <TableHead>Days Expired</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Attempts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmails.includes(invitation.email)}
                        onCheckedChange={(checked) => 
                          handleSelectInvitation(invitation.email, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>
                      <span className="capitalize">{invitation.persona_type}</span>
                    </TableCell>
                    <TableCell>{formatDate(invitation.invited_at)}</TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        {formatDate(invitation.expires_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        {getDaysExpired(invitation.expires_at)} days
                      </span>
                    </TableCell>
                    <TableCell>
                      {invitation.email_sent ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Sent
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{invitation.send_attempts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpiredInvitationsManager;