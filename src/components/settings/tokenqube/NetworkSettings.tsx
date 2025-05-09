
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NetworkSettingsProps {
  defaultNetwork?: string;
  defaultTokenStandard?: string;
}

const NetworkSettings = ({ 
  defaultNetwork = "ethereum", 
  defaultTokenStandard = "erc721" 
}: NetworkSettingsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-xs">Network</Label>
        <Select defaultValue={defaultNetwork}>
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
        <Select defaultValue={defaultTokenStandard}>
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
  );
};

export default NetworkSettings;
