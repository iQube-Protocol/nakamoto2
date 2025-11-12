import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, LogIn, LogOut, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getUserDID } from '@/services/aa-api-client';

export const DIDLogin: React.FC = () => {
  const [did, setDid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDID();
  }, []);

  const loadDID = async () => {
    setLoading(true);
    try {
      const userDid = await getUserDID();
      setDid(userDid);
    } catch (error) {
      console.error('Failed to load DID:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDID = () => {
    if (did) {
      navigator.clipboard.writeText(did);
      setCopied(true);
      toast.success('DID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would trigger wallet connection
      // and signature verification
      await loadDID();
      toast.success('Connected to JMO KNYT Aigent');
    } catch (error) {
      toast.error('Login failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setDid(null);
    toast.info('Disconnected from JMO KNYT Aigent');
  };

  if (!did) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center space-y-4">
          <UserCircle className="w-16 h-16 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Connect Your DID</h3>
            <p className="text-sm text-muted-foreground">
              Sign in with your Decentralized Identity to access JMO KNYT Aigent features
            </p>
          </div>
          <Button onClick={handleLogin} disabled={loading} className="w-full">
            <LogIn className="w-4 h-4 mr-2" />
            Connect DID
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Connected to</p>
            <p className="font-semibold">JMO KNYT Aigent</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Your DID</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
              {did}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyDID}
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    </Card>
  );
};
