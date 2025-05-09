
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useUserInteractions } from '@/hooks/use-user-interactions';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const { interactions, loading: interactionsLoading } = useUserInteractions();
  
  // Email update state
  const [email, setEmail] = useState(user?.email || '');
  const [emailUpdating, setEmailUpdating] = useState(false);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
  const [isWalletConnected, setIsWalletConnected] = useState(true);
  const [newWalletAddress, setNewWalletAddress] = useState("");
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date);
  };
  
  const handleEmailUpdate = async () => {
    // Email validation
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setEmailUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, you would use Auth API to update the email
      toast.success('Email updated successfully');
    } catch (error) {
      toast.error('Failed to update email');
      console.error('Email update error:', error);
    } finally {
      setEmailUpdating(false);
    }
  };
  
  const handleConnectWallet = async () => {
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsWalletConnected(true);
      toast.success('Wallet connected successfully');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Wallet connection error:', error);
    }
  };
  
  const handleDisconnectWallet = async () => {
    try {
      // Simulate wallet disconnection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsWalletConnected(false);
      toast.success('Wallet disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect wallet');
      console.error('Wallet disconnection error:', error);
    }
  };
  
  const handleChangeWallet = async () => {
    if (!newWalletAddress || newWalletAddress.length < 10) {
      toast.error('Please enter a valid wallet address');
      return;
    }
    
    try {
      // Simulate wallet change
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletAddress(newWalletAddress);
      setNewWalletAddress("");
      toast.success('Wallet address updated successfully');
    } catch (error) {
      toast.error('Failed to update wallet address');
      console.error('Wallet update error:', error);
    }
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
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  disabled={emailUpdating}
                />
                <Button onClick={handleEmailUpdate} disabled={emailUpdating}>
                  {emailUpdating ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Wallet Management</h3>
              
              {isWalletConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Connected Wallet</p>
                      <p className="font-mono text-xs">{walletAddress}</p>
                    </div>
                    <Button variant="outline" onClick={handleDisconnectWallet}>
                      Disconnect
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-wallet">Change Wallet Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-wallet"
                        value={newWalletAddress}
                        onChange={(e) => setNewWalletAddress(e.target.value)}
                        placeholder="Enter new wallet address"
                      />
                      <Button onClick={handleChangeWallet}>
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-sm">No wallet connected</p>
                  <Button variant="default" onClick={handleConnectWallet}>
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
