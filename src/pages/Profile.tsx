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
  const {
    user
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'learn' | 'earn' | 'connect' | 'mondai'>('learn');
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    interactions,
    refreshInteractions
  } = useUserInteractions(activeTab as any);

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

  const processHistoricPreview = (content: string) => {
    return content
    .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/^\* /gm, '• ').replace(/^- /gm, '• ').replace(/^### (.+)$/gm, '$1:').replace(/^## (.+)$/gm, '$1:').replace(/^# (.+)$/gm, '$1:')
    .replace(/\n\n+/g, ' ').trim();
  };
  
  if (!user) return null;
  
  return (
    <div className="container max-w-full px-4 sm:px-6 py-4 sm:py-6">
      <div className="grid gap-4 sm:gap-6">
        {/* User info section - mobile optimized */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-lg">User Profile</div>
              <Badge variant="outline" className="text-xs sm:text-sm truncate max-w-full">
                {user.email}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground text-sm">User ID:</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">
                  {user.id.substring(0, 8)}...
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground text-sm">Last Sign In:</span>
                <span className="text-sm">{getRelativeTime(new Date(user.last_sign_in_at || ''))}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground text-sm">Account Created:</span>
                <span className="text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-muted-foreground text-sm">Status:</span>
                <Badge variant={user.email_confirmed_at ? "secondary" : "destructive"} className="bg-qrypto-primary w-fit">
                  {user.email_confirmed_at ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interaction history section - mobile optimized */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-medium text-lg">History</CardTitle>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveTab('learn')} 
                className={`px-3 py-2 text-sm rounded transition-colors flex-shrink-0 ${
                  activeTab === 'learn' ? 'bg-qrypto-primary text-white' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Learn
              </button>
              <button 
                onClick={() => setActiveTab('mondai')} 
                className={`px-3 py-2 text-sm rounded transition-colors flex-shrink-0 ${
                  activeTab === 'mondai' ? 'bg-qrypto-primary text-white' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Nakamoto
              </button>
              <button 
                onClick={() => setActiveTab('earn')} 
                className={`px-3 py-2 text-sm rounded transition-colors flex-shrink-0 ${
                  activeTab === 'earn' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Earn
              </button>
              <button 
                onClick={() => setActiveTab('connect')} 
                className={`px-3 py-2 text-sm rounded transition-colors flex-shrink-0 ${
                  activeTab === 'connect' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Connect
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-4">
              <div className="space-y-4">
                {interactions && interactions.length > 0 ? interactions.map(interaction => (
                  <div key={interaction.id} className="space-y-3 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow historic-content">
                    {/* User Query */}
                    {interaction.query && (
                      <div className="p-3 rounded-lg bg-[#2d1f17]/45 border-l-4 border-orange-400">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-orange-200 bg-gray-500 border-orange-400 w-fit">
                            You asked
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(interaction.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-100 conversational-content break-words">
                          <MessageContent content={interaction.query} sender="user" />
                        </div>
                      </div>
                    )}
                    
                    {/* Agent Response Preview */}
                    {interaction.response && (
                      <div className="p-3 rounded-lg bg-[#23223f]/[0.32] cursor-pointer hover:bg-[#23223f]/[0.45] transition-colors border-l-4 border-indigo-400" onClick={() => handleResponseClick(interaction)}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-qrypto-primary w-fit">
                            {interaction.interaction_type} agent responded
                          </Badge>
                          {interaction.metadata && (
                            <div className="flex flex-wrap gap-1">
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
                        
                        <div className="text-sm conversational-content break-words">
                          {interaction.response.length > 300 ? (
                            <div>
                              <p className="text-foreground leading-relaxed">
                                {processHistoricPreview(interaction.response.substring(0, 300))}...
                              </p>
                              <p className="text-xs text-muted-foreground mt-2 flex flex-col sm:flex-row sm:items-center gap-1">
                                <span>Click to view full response</span>
                                {interaction.response.includes('```mermaid') && (
                                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 w-fit">
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
                    <p className="text-sm sm:text-base">
                      No {activeTab === 'learn' ? 'Learn/MonDAI' : activeTab === 'mondai' ? 'MonDAI' : activeTab} conversations found.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start a conversation with the {activeTab === 'learn' ? 'Learn or MonDAI' : activeTab === 'mondai' ? 'MonDAI' : activeTab} agent to see your history here.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <ResponseDialog selectedResponse={selectedResponse} isOpen={isDialogOpen} onClose={handleDialogClose} />
    </div>
  );
};

export default Profile;