import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { getRelativeTime } from '@/lib/utils';
const Profile = () => {
  const {
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'learn' | 'earn' | 'connect'>('learn');

  // Get user interactions for the active tab
  const {
    interactions,
    refreshInteractions
  } = useUserInteractions(activeTab);

  // Ensure we refresh the data when the tab changes
  useEffect(() => {
    refreshInteractions();
  }, [activeTab, refreshInteractions]);
  if (!user) return null;
  return <div className="container py-6">
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
                  <Badge variant={user.email_confirmed_at ? "secondary" : "destructive"} className="bg-qrypto-primary">
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
            <CardTitle className="font-medium text-lg">History</CardTitle>
            <div className="flex space-x-2">
              <button onClick={() => setActiveTab('learn')} className="bg-qrypto-primary px-[8px]">Learn  </button>
              <button onClick={() => setActiveTab('earn')} className={`px-3 py-1 rounded ${activeTab === 'earn' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                Earn
              </button>
              <button onClick={() => setActiveTab('connect')} className={`px-3 py-1 rounded ${activeTab === 'connect' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                Connect
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {interactions && interactions.length > 0 ? interactions.map(interaction => <div key={interaction.id} className="space-y-3 p-4 border rounded-lg">
                      {/* User Query */}
                      {interaction.query && <div className="p-3 rounded-lg bg-[#2d1f17]/45">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">You asked</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(interaction.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-100">{interaction.query}</p>
                        </div>}
                      
                      {/* Agent Response */}
                      {interaction.response && <div className="p-3 rounded-lg bg-[#23223f]/[0.32]">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-qrypto-primary">{interaction.interaction_type} agent responded</Badge>
                          </div>
                          <p className="text-sm">
                            {interaction.response.length > 200 ? `${interaction.response.substring(0, 200)}...` : interaction.response}
                          </p>
                        </div>}
                    </div>) : <div className="text-center p-6">
                    <p>No {activeTab === 'learn' ? 'Learn/MonDAI' : activeTab} conversations found.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start a conversation with the {activeTab === 'learn' ? 'Learn or MonDAI' : activeTab} agent to see your history here.
                    </p>
                  </div>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Profile;