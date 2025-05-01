
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { User, Clock, MessageSquare, Layers } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'learn' | 'earn' | 'connect'>('learn');
  const { interactions, loading } = useUserInteractions(activeTab);
  
  if (!user) {
    return (
      <div className="container p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" /> User Info
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Email:</span>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium">User ID:</span>
                <p className="text-xs text-muted-foreground truncate">{user.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Account Created:</span>
                <p className="text-sm">{user.created_at ? format(new Date(user.created_at), 'PPP') : '-'}</p>
              </div>
              <Button 
                variant="destructive" 
                className="mt-4 w-full" 
                size="sm"
                onClick={() => {
                  signOut();
                  toast.success('Successfully signed out');
                }}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Interaction History */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" /> Interaction History
              </CardTitle>
              <CardDescription>Your recent interactions with MonDAI</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as 'learn' | 'earn' | 'connect')}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="learn">Learn</TabsTrigger>
                  <TabsTrigger value="earn">Earn</TabsTrigger>
                  <TabsTrigger value="connect">Connect</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  {loading ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Loading your {activeTab} history...
                    </div>
                  ) : interactions.length > 0 ? (
                    <div className="space-y-4">
                      {interactions.slice(0, 5).map((interaction) => (
                        <Card key={interaction.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-medium">
                                <Clock className="h-3 w-3 inline mr-2" />
                                {format(new Date(interaction.created_at), 'PPp')}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm bg-muted p-2 rounded-md">
                                <span className="font-medium">Q:</span> {interaction.query}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">A:</span> 
                                {interaction.response.length > 150 
                                  ? `${interaction.response.substring(0, 150)}...` 
                                  : interaction.response
                                }
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Layers className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">No {activeTab} interactions yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
