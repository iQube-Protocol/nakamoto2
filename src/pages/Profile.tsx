import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserInteractionsOptimized } from '@/hooks/use-user-interactions-optimized';
import { getRelativeTime } from '@/lib/utils';
import ResponseDialog from '@/components/profile/ResponseDialog';
import NavigationAwareMessageContent from '@/components/profile/NavigationAwareMessageContent';
import { NameManagementSection } from '@/components/settings/NameManagementSection';
import { useSidebarState } from '@/hooks/use-sidebar-state';

const Profile = () => {
  const {
    user
  } = useAuth();
  const { selectedIQube } = useSidebarState();
  const [activeTab, setActiveTab] = useState<'learn' | 'earn' | 'connect' | 'mondai'>('mondai');
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Determine persona type from selected iQube
  const getPersonaType = (): 'knyt' | 'qrypto' | null => {
    if (selectedIQube === 'KNYT Persona') return 'knyt';
    if (selectedIQube === 'Qrypto Persona') return 'qrypto';
    return null;
  };

  const {
    interactions,
    loading,
    hasMore,
    loadMoreInteractions,
    refreshInteractions
  } = useUserInteractionsOptimized(activeTab as any, {
    batchSize: 10,
    enableProgressiveLoading: true,
    deferDuringNavigation: true
  });

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

  const getAgentName = (interactionType: string) => {
    switch (interactionType) {
      case 'mondai':
        return 'Nakamoto';
      case 'learn':
        return 'Learning';
      case 'earn':
        return 'Earning';
      case 'connect':
        return 'Connection';
      default:
        return interactionType;
    }
  };

  const processHistoricPreview = (content: string) => {
    return content
    .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/^\* /gm, '• ').replace(/^- /gm, '• ').replace(/^### (.+)$/gm, '$1:').replace(/^## (.+)$/gm, '$1:').replace(/^# (.+)$/gm, '$1:')
    .replace(/\n\n+/g, ' ').trim();
  };
  
  if (!user) return null;
  
  return (
    <TooltipProvider>
      <div className="min-h-screen w-full overflow-x-hidden">
        <div className="max-w-full px-3 sm:px-6 py-3 sm:py-6 space-y-4">
          {/* User info section - compressed */}
          <Card className="w-full">
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  {user.email.length > 25 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="font-mono bg-muted px-1 py-0.5 rounded text-xs break-all cursor-help mt-1">
                          {user.email.substring(0, 20)}...
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div className="font-mono bg-muted px-1 py-0.5 rounded text-xs mt-1">
                      {user.email}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <div className="font-mono bg-muted px-1 py-0.5 rounded text-xs break-all mt-1">
                    {user.id.substring(0, 8)}...
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Sign In:</span>
                  <div className="break-words mt-1">{getRelativeTime(new Date(user.last_sign_in_at || ''))}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <div className="break-words mt-1">{new Date(user.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Name Management Section */}
          <NameManagementSection filterPersonaType={getPersonaType()} />

        {/* Interaction history section - compressed */}
        <Card className="w-full">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">History</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <button 
                onClick={() => setActiveTab('mondai')} 
                className={`px-3 py-1.5 text-xs sm:text-sm rounded transition-colors ${
                  activeTab === 'mondai' ? 'bg-qrypto-primary text-white' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Nakamoto
              </button>
              <button 
                onClick={() => setActiveTab('learn')} 
                className={`px-3 py-1.5 text-xs sm:text-sm rounded transition-colors ${
                  activeTab === 'learn' ? 'bg-qrypto-primary text-white' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Learn
              </button>
              <button 
                onClick={() => setActiveTab('earn')} 
                className={`px-3 py-1.5 text-xs sm:text-sm rounded transition-colors ${
                  activeTab === 'earn' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Earn
              </button>
              <button 
                onClick={() => setActiveTab('connect')} 
                className={`px-3 py-1.5 text-xs sm:text-sm rounded transition-colors ${
                  activeTab === 'connect' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Connect
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3">
            <ScrollArea className="h-[250px] sm:h-[300px] w-full">
              <div className="space-y-3 pr-2">
                {interactions && interactions.length > 0 ? interactions.map(interaction => (
                  <div key={interaction.id} className="w-full overflow-hidden">
                    {/* User Query */}
                    {interaction.query && (
                       <div className="p-2 sm:p-3 rounded-lg bg-[#2d1f17]/45 border-l-4 border-orange-400 mb-2 overflow-hidden">
                         <div className="flex flex-col gap-1 mb-2">
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-orange-200 bg-gray-500 border-orange-400 w-fit text-xs">
                               You asked
                             </Badge>
                             <span className="text-xs text-muted-foreground">
                               {new Date(interaction.created_at).toLocaleString()}
                             </span>
                           </div>
                         </div>
                         <div className="text-xs sm:text-sm text-zinc-100 break-words overflow-wrap-anywhere">
                           <div className="max-w-full overflow-hidden">
                             <NavigationAwareMessageContent content={interaction.query} sender="user" />
                           </div>
                         </div>
                      </div>
                    )}
                    
                    {/* Agent Response Preview */}
                    {interaction.response && (
                      <div className="p-2 sm:p-3 rounded-lg bg-[#23223f]/[0.32] cursor-pointer hover:bg-[#23223f]/[0.45] transition-colors border-l-4 border-indigo-400 overflow-hidden" onClick={() => handleResponseClick(interaction)}>
                         <div className="flex flex-col gap-1 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-qrypto-primary w-fit text-xs">
                                Nakamoto
                              </Badge>
                              {interaction.metadata?.aiProvider && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 w-fit text-xs">
                                  {interaction.metadata.aiProvider === 'Venice AI (Uncensored)' ? 'Venice AI' : interaction.metadata.aiProvider}
                                </Badge>
                              )}
                              {interaction.metadata?.modelUsed && (
                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                  {interaction.metadata.modelUsed}
                                </Badge>
                              )}
                            </div>
                           {interaction.metadata && (
                             <div className="flex flex-wrap gap-1">
                               {interaction.metadata.qryptoItemsFound > 0 && (
                                 <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                   {interaction.metadata.qryptoItemsFound} KB items
                                 </Badge>
                               )}
                             </div>
                           )}
                         </div>
                        
                        <div className="text-xs sm:text-sm break-words overflow-wrap-anywhere">
                          {interaction.response.length > 200 ? (
                            <div className="max-w-full overflow-hidden">
                              <p className="text-foreground leading-relaxed">
                                {processHistoricPreview(interaction.response.substring(0, 200))}...
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                <span>Click to view full response</span>
                                {interaction.response.includes('```mermaid') && (
                                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 ml-1">
                                    Contains diagram
                                  </Badge>
                                )}
                              </p>
                            </div>
                           ) : (
                             <div className="max-w-full overflow-hidden">
                                <NavigationAwareMessageContent 
                                  content={interaction.response} 
                                  sender="agent" 
                                  messageId={interaction.id}
                                />
                             </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                 )) : loading ? (
                   <div className="text-center p-4">
                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                     <p className="text-xs sm:text-sm text-muted-foreground">Loading conversations...</p>
                   </div>
                 ) : (
                   <div className="text-center p-4">
                      <p className="text-xs sm:text-sm">
                        No {activeTab === 'learn' ? 'Learn/Nakamoto' : activeTab === 'mondai' ? 'Nakamoto' : activeTab} conversations found.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start a conversation with the {activeTab === 'learn' ? 'Learn or Nakamoto' : activeTab === 'mondai' ? 'Nakamoto' : activeTab} agent to see your history here.
                      </p>
                   </div>
                 )}
                 
                 {/* Progressive loading button */}
                 {hasMore && !loading && (
                   <div className="text-center p-4">
                     <button
                       onClick={loadMoreInteractions}
                       className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                     >
                       Load More Conversations
                     </button>
                   </div>
                 )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        </div>

        <ResponseDialog selectedResponse={selectedResponse} isOpen={isDialogOpen} onClose={handleDialogClose} />
      </div>
    </TooltipProvider>
  );
};

export default Profile;