
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { getRelativeTime } from '@/lib/utils';
import ResponseDialog from '@/components/profile/ResponseDialog';
import MessageContent from '@/components/shared/agent/message/MessageContent';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'learn' | 'earn' | 'connect'>('learn');
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get user interactions for the active tab
  const { interactions, refreshInteractions } = useUserInteractions(activeTab);

  // Ensure we refresh the data when the tab changes
  useEffect(() => {
    refreshInteractions();
  }, [activeTab, refreshInteractions]);

  const handleResponseClick = (interaction: any) => {
    setSelectedResponse(interaction);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedResponse(null);
  };

  // Process historic content for preview display
  const processHistoricPreview = (content: string) => {
    return content
      // Remove markdown formatting for preview
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/^\* /gm, '• ')
      .replace(/^- /gm, '• ')
      .replace(/^### (.+)$/gm, '$1:')
      .replace(/^## (.+)$/gm, '$1:')
      .replace(/^# (.+)$/gm, '$1:')
      // Clean up and truncate
      .replace(/\n\n+/g, ' ')
      .trim();
  };

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
                  <Badge variant={user.email_confirmed_at ? "secondary" : "destructive"} className="bg-qrypto-primary">
                    {user.email_confirmed_at ? "Verified" : "Unverified"}
                  </Badge>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interaction history section with enhanced styling */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-lg">History</CardTitle>
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveTab('learn')} 
                className={`px-3 py-1 rounded transition-colors ${activeTab === 'learn' ? 'bg-qrypto-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
              >
                Learn
              </button>
              <button 
                onClick={() => setActiveTab('earn')} 
                className={`px-3 py-1 rounded transition-colors ${activeTab === 'earn' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                Earn
              </button>
              <button 
                onClick={() => setActiveTab('connect')} 
                className={`px-3 py-1 rounded transition-colors ${activeTab === 'connect' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                Connect
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {interactions && interactions.length > 0 ? interactions.map(interaction => (
                  <div key={interaction.id} className="space-y-3 p-4 border rounded-lg hover:shadow-md transition-shadow historic-content">
                    {/* User Query */}
                    {interaction.query && (
                      <div className="p-3 rounded-lg bg-[#2d1f17]/45 border-l-4 border-orange-400">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">You asked</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(interaction.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-100 conversational-content">
                          <MessageContent content={interaction.query} sender="user" />
                        </div>
                      </div>
                    )}
                    
                    {/* Agent Response Preview */}
                    {interaction.response && (
                      <div 
                        className="p-3 rounded-lg bg-[#23223f]/[0.32] cursor-pointer hover:bg-[#23223f]/[0.45] transition-colors border-l-4 border-indigo-400"
                        onClick={() => handleResponseClick(interaction)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-qrypto-primary">
                            {interaction.interaction_type} agent responded
                          </Badge>
                          {interaction.metadata && (
                            <div className="flex gap-1">
                              {interaction.metadata.qryptoItemsFound > 0 && (
                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                  {interaction.metadata.qryptoItemsFound} KB items
                                </Badge>
                              )}
                              {interaction.metadata.aiProvider && (
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                  {interaction.metadata.aiProvider}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Enhanced preview with conversational styling */}
                        <div className="text-sm conversational-content">
                          {interaction.response.length > 300 ? (
                            <div>
                              <p className="text-foreground leading-relaxed">
                                {processHistoricPreview(interaction.response.substring(0, 300))}...
                              </p>
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <span>Click to view full response</span>
                                {interaction.response.includes('```mermaid') && (
                                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                                    Contains diagram
                                  </Badge>
                                )}
                              </p>
                            </div>
                          ) : (
                            <MessageContent content={interaction.response} sender="agent" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center p-6">
                    <p>No {activeTab === 'learn' ? 'Learn/MonDAI' : activeTab} conversations found.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start a conversation with the {activeTab === 'learn' ? 'Learn or MonDAI' : activeTab} agent to see your history here.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <ResponseDialog 
        selectedResponse={selectedResponse}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
};

export default Profile;
