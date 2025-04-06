
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UserSettings } from '@/lib/types';

interface TokenQubeSectionProps {
  settings: UserSettings;
  onConnectWallet: () => void;
  onMintIQube: () => void;
  onAddAccessGrant: () => void;
}

const TokenQubeSection = ({ 
  settings, 
  onConnectWallet, 
  onMintIQube,
  onAddAccessGrant 
}: TokenQubeSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm">Connected Wallet</Label>
        {settings.connected.wallet ? (
          <div className="flex items-center mt-1 p-2 bg-iqube-primary/10 rounded-md border border-iqube-primary/30">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            <span className="font-mono text-xs truncate">0x71C7656EC7...8976F</span>
          </div>
        ) : (
          <Button 
            className="mt-1 w-full bg-iqube-primary hover:bg-iqube-primary/90"
            onClick={onConnectWallet}
            size="sm"
          >
            Connect Wallet
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Network</Label>
          <Select defaultValue="ethereum">
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
              <SelectItem value="optimism">Optimism</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs">Token Standard</Label>
          <Select defaultValue="erc721">
            <SelectTrigger className="mt-1 h-8 text-xs">
              <SelectValue placeholder="Select standard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="erc721">ERC-721 (NFT)</SelectItem>
              <SelectItem value="erc1155">ERC-1155</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center">
          <Label className="text-xs">Access Grants</Label>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5" 
            onClick={onAddAccessGrant}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="border rounded-md p-2 mt-1 min-h-16 space-y-1 text-xs">
          <div className="flex items-center justify-between p-1 bg-muted/50 rounded text-xs">
            <span className="font-mono truncate">0x391874...35F1</span>
            <Badge className="text-[10px] px-1 py-0 h-4 bg-green-500">Full</Badge>
          </div>
          <div className="flex items-center justify-between p-1 bg-muted/50 rounded text-xs">
            <span className="font-mono truncate">0x71C765...976F</span>
            <Badge className="text-[10px] px-1 py-0 h-4 bg-blue-500">Read</Badge>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-gradient-to-r from-iqube-primary to-iqube-accent"
        onClick={onMintIQube}
        size="sm"
      >
        Mint iQube
      </Button>
    </div>
  );
};

export default TokenQubeSection;
