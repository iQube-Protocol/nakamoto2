
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { getRelativeTime } from '@/lib/utils';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'learn' | 'earn' | 'connect'>('learn');
  
  // Get user interactions for the active tab
  const { interactions, refreshInteractions } = useUserInteractions(activeTab);
  
  // Ensure we refresh the data when the tab changes
  useEffect(() => {
    refreshInteractions();
  }, [activeTab, refreshInteractions]);

  if (!user) return null;
  
  return (
    <div className="container py-6">
      <div className="grid gap-6">
        {/* Compressed user info section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div>User Profile</div>
              <Badge variant="outline">{user.email}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{user.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sign In:</span>
                <span>{getRelativeTime(new Date(user.last_sign_in_at || ''))}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Created:</span>
                <span>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span>
                  <Badge variant={user.email_confirmed_at ? "secondary" : "destructive"}>
                    {user.email_confirmed_at ? "Verified" : "Unverified"}
                  </Badge>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interaction history section with fixed height and scrolling */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Interaction History</CardTitle>
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveTab('learn')} 
                className={`px-3 py-1 rounded ${activeTab === 'learn' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Learn
              </button>
              <button 
                onClick={() => setActiveTab('earn')} 
                className={`px-3 py-1 rounded ${activeTab === 'earn' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Earn
              </button>
              <button 
                onClick={() => setActiveTab('connect')} 
                className={`px-3 py-1 rounded ${activeTab === 'connect' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Connect
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {interactions && interactions.length > 0 ? (
                  interactions.map((interaction) => (
                    <div key={interaction.id} className="space-y-2">
                      <div>
                        <span className="font-medium">Query: </span>
                        <span>{interaction.query}</span>
                      </div>
                      <div>
                        <span className="font-medium">Response: </span>
                        <span className="text-sm">{interaction.response.length > 150 
                          ? `${interaction.response.substring(0, 150)}...` 
                          : interaction.response}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{new Date(interaction.created_at).toLocaleString()}</span>
                        <span>{interaction.interaction_type} agent</span>
                      </div>
                      <Separator />
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6">
                    <p>No {activeTab} interactions found.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
