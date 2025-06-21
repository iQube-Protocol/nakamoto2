
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Mail, Calendar, RefreshCw } from 'lucide-react';
import { invitationService, type UserDetail } from '@/services/invitation-service';
import { toast } from 'sonner';

interface UserListModalProps {
  open: boolean;
  onClose: () => void;
  category: string;
  title: string;
  onUserClick: (user: UserDetail) => void;
}

const UserListModal = ({ open, onClose, category, title, onUserClick }: UserListModalProps) => {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const userData = await invitationService.getUserDetails(category, searchTerm);
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, category]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (open) {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const getStatusBadge = (user: UserDetail) => {
    if (user.signup_completed) {
      return <Badge className="bg-green-100 text-green-800">Signed Up</Badge>;
    } else if (user.email_sent) {
      return <Badge className="bg-blue-100 text-blue-800">Email Sent</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const getDisplayName = (user: UserDetail) => {
    const firstName = user.persona_data?.['First-Name'] || '';
    const lastName = user.persona_data?.['Last-Name'] || '';
    return firstName && lastName ? `${firstName} ${lastName}` : user.email;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title} ({users.length})</span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onUserClick(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{getDisplayName(user)}</span>
                        {getStatusBadge(user)}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Invited {new Date(user.invited_at).toLocaleDateString()}</span>
                        </div>
                        <span className="capitalize">{user.persona_type}</span>
                      </div>
                      {user.email_sent && user.email_sent_at && (
                        <div className="text-xs text-blue-600 mt-1">
                          Email sent: {new Date(user.email_sent_at).toLocaleString()}
                        </div>
                      )}
                      {user.signup_completed && user.completed_at && (
                        <div className="text-xs text-green-600 mt-1">
                          Signed up: {new Date(user.completed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No users found matching your search.' : 'No users found in this category.'}
                </div>
              )}
              
              {isLoading && (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">Loading users...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserListModal;
