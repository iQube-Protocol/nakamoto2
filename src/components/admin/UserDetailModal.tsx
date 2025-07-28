
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Database, Settings, RefreshCw } from 'lucide-react';
import { invitationService, type UserDetail } from '@/services/invitation-service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { personaDataSync } from '@/services/persona-data-sync';
import UserPersonaDisplay from './UserPersonaDisplay';

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

const UserDetailModal = ({ open, onClose, userId }: UserDetailModalProps) => {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserDetail = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const detail = await invitationService.getUserDetailWithBlakQube(userId);
      setUserDetail(detail);
    } catch (error) {
      console.error('Error loading user detail:', error);
      toast.error('Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      loadUserDetail();
    } else {
      setUserDetail(null);
    }
  }, [open, userId]);

  // Subscribe to persona data updates for real-time sync
  useEffect(() => {
    if (!open || !userId || !userDetail?.signup_completed) return;

    const unsubscribe = personaDataSync.subscribe(() => {
      console.log('UserDetailModal: Received persona data update notification, refreshing...');
      loadUserDetail();
    });

    return unsubscribe;
  }, [open, userId, userDetail?.signup_completed]);

  if (!userDetail && !isLoading) {
    return null;
  }

  const getStatusInfo = () => {
    if (!userDetail) return { status: 'Unknown', color: 'gray' };
    
    if (userDetail.signup_completed) {
      return { status: 'Signed Up', color: 'green' };
    } else if (userDetail.email_sent) {
      return { status: 'Email Sent', color: 'blue' };
    } else {
      return { status: 'Pending Email', color: 'orange' };
    }
  };

  const statusInfo = getStatusInfo();

  const renderDataSection = (title: string, data: Record<string, any>, icon: React.ReactNode) => {
    const filteredData = Object.entries(data || {}).filter(([key, value]) => {
      if (key === 'id' || key === 'user_id' || key === 'created_at' || key === 'updated_at') return false;
      return value !== null && value !== undefined && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true);
    });

    if (filteredData.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {icon}
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No data available</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  {key.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="text-sm">
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1">
                      {value.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : key === 'Total-Invested' && typeof value === 'string' && value ? (
                    // Format investment amount as currency if not already formatted
                    <span className="break-words">
                      {(() => {
                        const numericValue = value.replace(/[$,]/g, '');
                        if (!isNaN(Number(numericValue)) && numericValue !== '') {
                          return `$${Number(numericValue).toLocaleString()}`;
                        }
                        return String(value);
                      })()}
                    </span>
                  ) : (
                    <span className="break-words">{String(value)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>
                {userDetail ? 
                  `${userDetail.persona_data?.['First-Name'] || ''} ${userDetail.persona_data?.['Last-Name'] || ''}`.trim() || userDetail.email
                  : 'Loading...'
                }
              </span>
              {userDetail && (
                <Badge className={`bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                  {statusInfo.status}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUserDetail}
              disabled={isLoading || !userId}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading user details...</span>
          </div>
        ) : userDetail ? (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm">{userDetail.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Persona Type</label>
                      <p className="text-sm capitalize">{userDetail.persona_type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Invited At</label>
                      <p className="text-sm">{new Date(userDetail.invited_at).toLocaleString()}</p>
                    </div>
                    {userDetail.email_sent && userDetail.email_sent_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email Sent At</label>
                        <p className="text-sm">{new Date(userDetail.email_sent_at).toLocaleString()}</p>
                      </div>
                    )}
                    {userDetail.signup_completed && userDetail.completed_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Signed Up At</label>
                        <p className="text-sm">{new Date(userDetail.completed_at).toLocaleString()}</p>
                      </div>
                    )}
                    {userDetail.batch_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Batch ID</label>
                        <p className="text-sm font-mono">{userDetail.batch_id}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Persona Data Display */}
              <UserPersonaDisplay
                userEmail={userDetail.email}
                personaType={userDetail.persona_type}
                originalData={userDetail.persona_data}
                onDataUpdate={loadUserDetail}
              />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Failed to load user details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
