
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, User, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { unifiedInvitationService, type PendingInvitation } from '@/services/unified-invitation';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseUserResult {
  id: string;
  email: string;
  persona_type: string;
  invited_at: string;
  email_sent: boolean;
  email_sent_at?: string;
  signup_completed?: boolean;
  completed_at?: string;
  batch_id?: string;
  send_attempts: number;
  persona_data?: any;
}

interface UserDetail {
  id: string;
  email: string;
  persona_type: string;
  invited_at?: string;
  email_sent?: boolean;
  email_sent_at?: string;
  signup_completed?: boolean;
  completed_at?: string;
  first_name?: string;
  last_name?: string;
}

interface UserListModalProps {
  open: boolean;
  onClose: () => void;
  category: string;
  title: string;
  totalCount?: number;
  onUserClick: (user: UserDetail) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({
  open,
  onClose,
  category,
  title,
  totalCount,
  onUserClick
}) => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    if (!open || !category) {
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`UserListModal: Loading users for category: ${category} using unified service`);
      
      let serviceData: PendingInvitation[] = [];
      
      // Use unified invitation service methods instead of direct Supabase queries
      switch (category) {
        case 'totalCreated':
          // For total created, we need to get all records and filter out direct signups
          const allData = await unifiedInvitationService.getPendingEmailSend(50000);
          const sentData = await unifiedInvitationService.getEmailsSent();
          const awaitingData = await unifiedInvitationService.getAwaitingSignup();
          const completedData = await unifiedInvitationService.getCompletedInvitations();
          
          // Combine all invitation data and deduplicate by email
          const allEmails = new Set<string>();
          serviceData = [];
          
          [allData, sentData, awaitingData, completedData].forEach(dataset => {
            dataset.forEach(item => {
              if (!allEmails.has(item.email) && item.batch_id !== 'direct_signup') {
                allEmails.add(item.email);
                serviceData.push(item);
              }
            });
          });
          break;

        case 'emailsSent':
          serviceData = await unifiedInvitationService.getEmailsSent();
          console.log(`UserListModal: Got ${serviceData.length} emails sent from unified service`);
          break;

        case 'emailsPending':
          serviceData = await unifiedInvitationService.getPendingEmailSend(50000);
          break;

        case 'awaitingSignup':
          serviceData = await unifiedInvitationService.getAwaitingSignup();
          console.log(`UserListModal: Got ${serviceData.length} awaiting signup from unified service`);
          break;

        case 'signupsCompleted':
          serviceData = await unifiedInvitationService.getCompletedInvitations();
          break;

        case 'expiringToday':
        case 'expiring3Days':
        case 'expiring7Days':
          // For expiring invitations, still use direct query as this isn't in unified service
          const daysAhead = category === 'expiringToday' ? 1 : category === 'expiring3Days' ? 3 : 7;
          const { data: expiringData, error: expiringError } = await supabase
            .rpc('get_expiring_invitations', { days_ahead: daysAhead });
          
          if (expiringError) throw expiringError;
          
          // Convert the expiring data to match PendingInvitation format
          serviceData = (expiringData || []).map((item: any) => ({
            id: `expiring-${item.email}`,
            email: item.email,
            persona_type: item.persona_type,
            invited_at: '',
            email_sent: true,
            email_sent_at: '',
            signup_completed: false,
            completed_at: null,
            batch_id: null,
            send_attempts: 0,
            persona_data: {},
            expires_at: item.expires_at
          }));
          break;

        case 'directSignups':
          // For direct signups, still use direct query as this is specific filtering
          const { data: directSignupUsers, error: directSignupError } = await supabase
            .from('invited_users')
            .select('id, email, persona_type, invited_at, email_sent, email_sent_at, signup_completed, completed_at, batch_id, send_attempts, persona_data')
            .eq('batch_id', 'direct_signup')
            .order('invited_at', { ascending: false });
          
          if (directSignupError) throw directSignupError;
          
          serviceData = (directSignupUsers || []).map(user => ({
            ...user,
            send_attempts: user.send_attempts || 0
          }));
          break;

        default:
          console.warn(`UserListModal: Unknown category: ${category}`);
          serviceData = [];
      }

      console.log(`UserListModal: Loaded ${serviceData.length} users for category ${category} from unified service`);
      
      // Convert service data to UserDetail format
      const convertedUsers: UserDetail[] = serviceData.map(user => ({
        id: user.id,
        email: user.email,
        persona_type: user.persona_type,
        invited_at: user.invited_at,
        email_sent: user.email_sent,
        email_sent_at: user.email_sent_at,
        signup_completed: (user as any).signup_completed,
        completed_at: (user as any).completed_at,
        first_name: (user as any).persona_data?.['First-Name'] || '',
        last_name: (user as any).persona_data?.['Last-Name'] || ''
      }));

      console.log('UserListModal: Final converted users count:', convertedUsers.length);
      
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
    console.log('UserListModal: useEffect triggered', { open, category, title });
    if (open && category) {
      console.log('UserListModal: About to call loadUsers');
      loadUsers();
    }
  }, [open, category]);

  // Emergency logging to see what's happening
  if (open) {
    console.log('UserListModal: EMERGENCY DEBUG', {
      category,
      title,
      totalUsers: users.length,
      searchTerm,
      filteredCount: filteredUsers.length,
      firstFewUsers: users.slice(0, 3).map(u => ({ email: u.email, firstName: u.first_name, lastName: u.last_name }))
    });
  }

  useEffect(() => {
    console.log('UserListModal: Search filtering triggered', { 
      searchTerm, 
      usersCount: users.length,
      searchTermTrimmed: searchTerm.trim() 
    });
    
    if (searchTerm.trim() === '') {
      console.log('UserListModal: No search term, showing all users');
      setFilteredUsers(users);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = users.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        user.persona_type.toLowerCase().includes(searchLower) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchLower))
      );
      
      console.log('UserListModal: Search filtered results:', {
        searchTerm: searchLower,
        originalCount: users.length,
        filteredCount: filtered.length,
        sampleFiltered: filtered.slice(0, 3).map(u => ({ email: u.email, name: `${u.first_name} ${u.last_name}` }))
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
    if (category === 'expiringToday') {
      return <Badge variant="destructive">Expires Today</Badge>;
    }
    if (category === 'expiring3Days') {
      return <Badge variant="destructive">Expires in 3 Days</Badge>;
    }
    if (category === 'expiring7Days') {
      return <Badge className="bg-warning text-warning-foreground">Expires in 7 Days</Badge>;
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

  // Add console logging for debugging
  console.log('UserListModal: Rendering modal', { open, category, title, usersLength: users.length, filteredUsersLength: filteredUsers.length });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            {title} ({searchTerm.trim() ? filteredUsers.length : (totalCount !== undefined ? totalCount : filteredUsers.length)})
          </DialogTitle>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </DialogHeader>

        <div className="flex items-center space-x-2 p-4 border-b">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, email, or persona type..."
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
