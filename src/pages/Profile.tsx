
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { User, Clock, MessageSquare, Layers, RefreshCw, Loader2, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'learn' | 'earn' | 'connect'>('learn');
  const { interactions, loading, refreshInteractions, error } = useUserInteractions(activeTab);
  const [debugMode, setDebugMode] = useState(false);
  
  // Debug current user info
  useEffect(() => {
    console.log("Profile component - Current user:", user);
    
    // Check database connection to ensure we can access data
    async function checkConnection() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_interactions')
            .select('count(*)')
            .eq('user_id', user.id)
            .single();
          
          console.log("Direct DB check - Interactions count:", data);
          if (error) console.error("Direct DB error:", error);
          
          // Also fetch some raw data to diagnose issues
          const { data: rawData, error: rawError } = await supabase
            .from('user_interactions')
            .select('*')
            .eq('user_id', user.id)
            .limit(5);
            
          console.log("Raw interaction data:", rawData);
          if (rawError) console.error("Raw interaction data error:", rawError);
        } catch (e) {
          console.error("Failed to check interactions count:", e);
        }
      }
    }
    
    checkConnection();
  }, [user, activeTab]); // Add activeTab as dependency to re-check on tab change
  
  // Force refresh interactions whenever tab changes or component mounts
  useEffect(() => {
    if (user) {
      console.log(`Profile: Force refreshing ${activeTab} interactions for user ${user.id}`);
      refreshInteractions();
    }
  }, [activeTab, user, refreshInteractions]);

  // Log any errors or interactions for debugging
  useEffect(() => {
    if (error) {
      console.error('Profile: Error loading interactions:', error);
      toast.error(`Error loading interactions: ${error.message}`);
    }
    if (interactions) {
      console.log(`Profile: Loaded ${interactions?.length || 0} ${activeTab} interactions`);
      console.log('Profile: Interactions data:', interactions);
    }
  }, [interactions, error, activeTab]);
  
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
  
  const handleRefresh = async () => {
    toast.success('Refreshing your interaction history');
    await refreshInteractions();
  };
  
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };
  
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
              
              <Button
                variant="outline"
                className="mt-2 w-full"
                size="sm"
                onClick={toggleDebugMode}
              >
                <Bug className="h-4 w-4 mr-1" />
                {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Interaction History */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" /> Interaction History
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                    </>
                  )}
                </Button>
              </div>
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
                    <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Loading your {activeTab} history...</p>
                    </div>
                  ) : error ? (
                    <div className="py-8 text-center text-red-500">
                      <p>Error loading interactions: {error.message}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                        className="mt-2"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : interactions && interactions.length > 0 ? (
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try using the {activeTab} feature to create some interactions
                      </p>
                      {debugMode && (
                        <div className="mt-4 p-4 border border-dashed rounded-md text-left">
                          <h3 className="font-bold mb-2">Debug Information</h3>
                          <p className="text-sm mb-2">Current user ID: {user?.id || 'Not logged in'}</p>
                          <p className="text-sm mb-2">Active tab: {activeTab}</p>
                          <p className="text-sm mb-2">Loading state: {loading ? 'Loading' : 'Not loading'}</p>
                          <p className="text-sm mb-2">Error: {error?.message || 'No error'}</p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                            onClick={handleRefresh}
                          >
                            Force Refresh
                          </Button>
                        </div>
                      )}
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
