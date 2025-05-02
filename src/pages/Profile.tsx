
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useUserInteractions } from '@/hooks/use-user-interactions';

const Profile = () => {
  const { user } = useAuth();
  const { interactions, loading: interactionsLoading } = useUserInteractions();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user?.email || 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-xs font-mono">{user?.id || 'Not logged in'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p>{user?.created_at ? formatDate(user.created_at) : 'Not available'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Sign In</p>
                <p>{user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Not available'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interaction History</CardTitle>
          <CardDescription>Your recent conversations with AI assistants</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="learn">Learn</TabsTrigger>
              <TabsTrigger value="earn">Earn</TabsTrigger>
              <TabsTrigger value="connect">Connect</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {interactionsLoading ? (
                <p>Loading interaction history...</p>
              ) : interactions && interactions.length > 0 ? (
                <div className="space-y-4">
                  {interactions.slice(0, 10).map((interaction) => (
                    <div key={interaction.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{interaction.interaction_type} Interaction</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(interaction.created_at)}
                        </span>
                      </div>
                      <p className="font-semibold">Q: {interaction.query}</p>
                      <p>A: {interaction.response.length > 100 
                        ? `${interaction.response.substring(0, 100)}...` 
                        : interaction.response}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No interaction history found</p>
              )}
            </TabsContent>

            {['learn', 'earn', 'connect'].map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                {interactionsLoading ? (
                  <p>Loading {type} interactions...</p>
                ) : interactions && interactions.filter(i => i.interaction_type === type).length > 0 ? (
                  <div className="space-y-4">
                    {interactions
                      .filter(i => i.interaction_type === type)
                      .slice(0, 10)
                      .map((interaction) => (
                        <div key={interaction.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">{interaction.interaction_type} Interaction</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(interaction.created_at)}
                            </span>
                          </div>
                          <p className="font-semibold">Q: {interaction.query}</p>
                          <p>A: {interaction.response.length > 100 
                            ? `${interaction.response.substring(0, 100)}...` 
                            : interaction.response}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p>No {type} interactions found</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
