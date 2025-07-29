
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, User, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { unifiedInvitationService, type PendingInvitation } from '@/services/unified-invitation';
import { supabase } from '@/integrations/supabase/client';

interface UserDetail {
  id: string;
  email: string;
  persona_type: string;
  invited_at?: string;
  email_sent?: boolean;
  email_sent_at?: string;
  signup_completed?: boolean;
  completed_at?: string;
}

interface UserListModalProps {
  open: boolean;
  onClose: () => void;
  category: string;
  title: string;
  onUserClick: (user: UserDetail) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({
  open,
  onClose,
  category,
  title,
  onUserClick
}) => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    if (!open || !category) return;
    
    setIsLoading(true);
    try {
      console.log(`UserListModal: Loading users for category: ${category}`);
      
      let userData: PendingInvitation[] = [];
      
      // Query database with corrected formulas (exclude direct_signup placeholders)
      switch (category) {
        case 'totalCreated':
          // Get real invitations only (exclude direct_signup placeholders)
          const { data: allInvites, error: allError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id, send_attempts')
            .or('batch_id.neq.direct_signup,batch_id.is.null')
            .order('invited_at', { ascending: false });
          
          if (allError) throw allError;
          userData = (allInvites || []).map(user => ({
            ...user,
            send_attempts: user.send_attempts || 0
          }));
          break;

        case 'emailsSent':
          // Get real invitations that had emails sent
          const { data: sentUsers, error: sentError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id, send_attempts')
            .or('batch_id.neq.direct_signup,batch_id.is.null')
            .eq('email_sent', true)
            .order('email_sent_at', { ascending: false });
          
          if (sentError) throw sentError;
          userData = (sentUsers || []).map(user => ({
            ...user,
            send_attempts: user.send_attempts || 0
          }));
          break;

        case 'emailsPending':
          // Get real invitations pending email send
          const { data: pendingUsers, error: pendingError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id, send_attempts')
            .or('batch_id.neq.direct_signup,batch_id.is.null')
            .eq('email_sent', false)
            .order('invited_at', { ascending: false });
          
          if (pendingError) throw pendingError;
          userData = (pendingUsers || []).map(user => ({
            ...user,
            send_attempts: user.send_attempts || 0
          }));
          break;

        case 'awaitingSignup':
          // Get real invitations sent but user hasn't signed up yet
          const { data: awaitingUsers, error: awaitingError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id, send_attempts')
            .or('batch_id.neq.direct_signup,batch_id.is.null')
            .eq('email_sent', true)
            .eq('signup_completed', false)
            .order('email_sent_at', { ascending: false });
          
          if (awaitingError) throw awaitingError;
          userData = (awaitingUsers || []).map(user => ({
            ...user,
            send_attempts: user.send_attempts || 0
          }));
          break;

        case 'signupsCompleted':
          // Get real invited users who completed signup
          const { data: completedUsers, error: completedError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id, send_attempts')
            .or('batch_id.neq.direct_signup,batch_id.is.null')
            .eq('signup_completed', true)
            .order('completed_at', { ascending: false });
          
          if (completedError) throw completedError;
          userData = (completedUsers || []).map(user => ({
            ...user,
            send_attempts: user.send_attempts || 0
          }));
          break;

        case 'directSignups':
          // Get true direct signups from persona tables
          const [knytData, qryptoData] = await Promise.all([
            supabase.from('knyt_personas').select('user_id, "Email", created_at'),
            supabase.from('qrypto_personas').select('user_id, "Email", created_at')
          ]);
          
          // Get all real invited emails to filter out
          const { data: invitedEmails } = await supabase
            .from('invited_users')
            .select('email')
            .or('batch_id.neq.direct_signup,batch_id.is.null');
          
          const invitedEmailsSet = new Set(invitedEmails?.map(inv => inv.email) || []);
          
          // Process KNYT personas
          const knytDirectSignups = (knytData.data || [])
            .filter(p => !invitedEmailsSet.has(p.Email))
            .map(p => ({
              id: p.user_id,
              email: p.Email,
              persona_type: 'knyt',
              invited_at: p.created_at,
              email_sent: false,
              email_sent_at: null,
              signup_completed: true,
              completed_at: p.created_at,
              batch_id: null,
              send_attempts: 0
            }));
          
          // Process Qrypto personas  
          const qryptoDirectSignups = (qryptoData.data || [])
            .filter(p => !invitedEmailsSet.has(p.Email))
            .map(p => ({
              id: p.user_id,
              email: p.Email,
              persona_type: 'qrypto',
              invited_at: p.created_at,
              email_sent: false,
              email_sent_at: null,
              signup_completed: true,
              completed_at: p.created_at,
              batch_id: null,
              send_attempts: 0
            }));
          
          userData = [...knytDirectSignups, ...qryptoDirectSignups];
          break;

        default:
          console.warn(`UserListModal: Unknown category: ${category}`);
          userData = [];
      }

      console.log(`UserListModal: Loaded ${userData.length} users for category ${category}`);

      // Convert PendingInvitation to UserDetail format
      const convertedUsers: UserDetail[] = userData.map(user => ({
        id: user.id,
        email: user.email,
        persona_type: user.persona_type,
        invited_at: user.invited_at,
        email_sent: user.email_sent,
        email_sent_at: user.email_sent_at
      }));

      setUsers(convertedUsers);
      setFilteredUsers(convertedUsers);
    } catch (error: any) {
      console.error('UserListModal: Error loading users:', error);
      toast.error(`Failed to load users: ${error.message}`);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && category) {
      loadUsers();
    }
  }, [open, category]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.persona_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const getStatusBadge = (user: UserDetail) => {
    if (category === 'directSignups') {
      return <Badge className="bg-purple-600">Direct Signup</Badge>;
    }
    if (category === 'signupsCompleted') {
      return <Badge className="bg-green-600">Signed Up</Badge>;
    }
    if (category === 'awaitingSignup') {
      return <Badge className="bg-blue-600">Email Sent</Badge>;
    }
    if (category === 'emailsSent') {
      return <Badge className="bg-green-600">Email Sent</Badge>;
    }
    if (category === 'emailsPending') {
      return <Badge variant="outline">Pending</Badge>;
    }
    if (user.email_sent) {
      return <Badge className="bg-green-600">Email Sent</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleRefresh = () => {
    console.log('UserListModal: Manual refresh triggered');
    unifiedInvitationService.clearCache();
    loadUsers();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {title} ({filteredUsers.length})
          </DialogTitle>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </DialogHeader>

        <div className="flex items-center space-x-2 p-4 border-b">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user, index) => (
                <div
                  key={`${user.id}-${index}`}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onUserClick(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{user.email}</span>
                        {getStatusBadge(user)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{user.persona_type}</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Invited {formatDate(user.invited_at)}</span>
                        </div>
                        {user.email_sent && user.email_sent_at && (
                          <span>Email sent: {formatDate(user.email_sent_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserListModal;
