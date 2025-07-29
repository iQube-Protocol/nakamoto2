
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
      console.log(`🔄 UserListModal: Loading users for category: ${category}`);
      
      let users: UserDetail[] = [];
      
      switch (category) {
        case 'totalCreated':
          // Get all REAL invitations (exclude direct signup placeholders)
          const { data: allInvites, error: allError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id')
            .not('batch_id', 'in', '("direct_signup","direct-signup")')
            .order('invited_at', { ascending: false });
          
          if (allError) throw allError;
          users = (allInvites || []).map(user => ({
            id: user.id,
            email: user.email,
            persona_type: user.persona_type,
            invited_at: user.invited_at,
            email_sent: user.email_sent,
            email_sent_at: user.email_sent_at,
            signup_completed: user.signup_completed,
            completed_at: user.completed_at
          }));
          break;

        case 'emailsSent':
          // Get REAL invitations where emails were sent
          const { data: sentUsers, error: sentError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id')
            .eq('email_sent', true)
            .not('batch_id', 'in', '("direct_signup","direct-signup")')
            .order('email_sent_at', { ascending: false });
          
          if (sentError) throw sentError;
          users = (sentUsers || []).map(user => ({
            id: user.id,
            email: user.email,
            persona_type: user.persona_type,
            invited_at: user.invited_at,
            email_sent: user.email_sent,
            email_sent_at: user.email_sent_at,
            signup_completed: user.signup_completed,
            completed_at: user.completed_at
          }));
          break;

        case 'emailsPending':
          // Get REAL invitations where emails are pending
          const { data: pendingUsers, error: pendingError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id')
            .eq('email_sent', false)
            .not('batch_id', 'in', '("direct_signup","direct-signup")')
            .order('invited_at', { ascending: false });
          
          if (pendingError) throw pendingError;
          users = (pendingUsers || []).map(user => ({
            id: user.id,
            email: user.email,
            persona_type: user.persona_type,
            invited_at: user.invited_at,
            email_sent: user.email_sent,
            email_sent_at: user.email_sent_at,
            signup_completed: user.signup_completed,
            completed_at: user.completed_at
          }));
          break;

        case 'awaitingSignup':
          // Get REAL invitations where emails sent but signup not completed
          const { data: awaitingUsers, error: awaitingError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id')
            .eq('email_sent', true)
            .eq('signup_completed', false)
            .not('batch_id', 'in', '("direct_signup","direct-signup")')
            .order('email_sent_at', { ascending: false });
          
          if (awaitingError) throw awaitingError;
          users = (awaitingUsers || []).map(user => ({
            id: user.id,
            email: user.email,
            persona_type: user.persona_type,
            invited_at: user.invited_at,
            email_sent: user.email_sent,
            email_sent_at: user.email_sent_at,
            signup_completed: user.signup_completed,
            completed_at: user.completed_at
          }));
          break;

        case 'signupsCompleted':
          // Get all personas (total completed signups)
          const [knytData, qryptoData] = await Promise.all([
            supabase.from('knyt_personas').select('user_id, "Email", created_at'),
            supabase.from('qrypto_personas').select('user_id, "Email", created_at')
          ]);
          
          if (knytData.error || qryptoData.error) {
            throw knytData.error || qryptoData.error;
          }

          const allPersonas = [
            ...(knytData.data || []).map(p => ({ ...p, persona_type: 'knyt' })),
            ...(qryptoData.data || []).map(p => ({ ...p, persona_type: 'qrypto' }))
          ];

          users = allPersonas.map(persona => ({
            id: persona.user_id,
            email: persona.Email || '',
            persona_type: persona.persona_type,
            invited_at: persona.created_at,
            email_sent: true,
            email_sent_at: null,
            signup_completed: true,
            completed_at: persona.created_at
          }));
          break;

        case 'directSignups':
          // Get TRUE direct signups (personas without invitation records)
          const [allKnytData, allQryptoData] = await Promise.all([
            supabase.from('knyt_personas').select('user_id, "Email", created_at'),
            supabase.from('qrypto_personas').select('user_id, "Email", created_at')
          ]);
          
          if (allKnytData.error || allQryptoData.error) {
            throw allKnytData.error || allQryptoData.error;
          }

          // Get all REAL invitation emails
          const { data: inviteEmails, error: inviteError } = await supabase
            .from('invited_users')
            .select('email')
            .not('batch_id', 'in', '("direct_signup","direct-signup")');

          if (inviteError) throw inviteError;

          const invitedEmailSet = new Set(
            inviteEmails?.map(inv => inv.email?.toLowerCase()?.trim()).filter(Boolean) || []
          );

          // Find personas without invitations
          const directKnyt = (allKnytData.data || [])
            .filter(p => p.Email && p.Email.trim() !== '' && !invitedEmailSet.has(p.Email.toLowerCase().trim()))
            .map(p => ({
              id: p.user_id,
              email: p.Email || '',
              persona_type: 'knyt',
              invited_at: p.created_at,
              email_sent: false,
              email_sent_at: null,
              signup_completed: true,
              completed_at: p.created_at
            }));

          const directQrypto = (allQryptoData.data || [])
            .filter(p => p.Email && p.Email.trim() !== '' && !invitedEmailSet.has(p.Email.toLowerCase().trim()))
            .map(p => ({
              id: p.user_id,
              email: p.Email || '',
              persona_type: 'qrypto',
              invited_at: p.created_at,
              email_sent: false,
              email_sent_at: null,
              signup_completed: true,
              completed_at: p.created_at
            }));

          users = [...directKnyt, ...directQrypto];
          break;

        default:
          console.warn(`⚠️ UserListModal: Unknown category: ${category}`);
          users = [];
      }

      console.log(`✅ UserListModal: Loaded ${users.length} users for category ${category}`);
      setUsers(users);
      setFilteredUsers(users);

    } catch (error: any) {
      console.error('❌ UserListModal: Error loading users:', error);
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

  // Enhanced search - case insensitive and comprehensive
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const searchLower = searchTerm.toLowerCase().trim();
      const filtered = users.filter(user => {
        const email = user.email?.toLowerCase() || '';
        const personaType = user.persona_type?.toLowerCase() || '';
        
        // Search email parts separately for better matching
        const emailParts = email.split('@');
        const emailName = emailParts[0] || '';
        const emailDomain = emailParts[1] || '';
        
        return email.includes(searchLower) ||
               emailName.includes(searchLower) ||
               emailDomain.includes(searchLower) ||
               personaType.includes(searchLower) ||
               user.id?.toLowerCase().includes(searchLower);
      });
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
            {title} ({users.length})
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
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
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
