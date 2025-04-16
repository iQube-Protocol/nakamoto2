import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Key, Shield, Info, Linkedin, User, Wallet, Database, Brain } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MetaQube } from '@/lib/types';

interface PrivateData {
  [key: string]: string | string[];
}

interface DataSource {
  [key: string]: string;
}

interface BlakQubeSectionProps {
  privateData: PrivateData;
  onUpdatePrivateData: (newData: PrivateData) => void;
  metaQube?: MetaQube;
}

const BlakQubeSection = ({ privateData, onUpdatePrivateData, metaQube }: BlakQubeSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<PrivateData>({...privateData});
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState("kyber");
  
  const isAgentQube = metaQube?.["iQube-Type"] === "AgentQube";
  
  const defaultDataSources = isAgentQube ? 
    {
      "AI-Capabilities": "api",
      "Integration-APIs": "manual",
      "Security-Level": "system",
      "Model-Version": "api",
      "API-Key-Hash": "system",
      "Access-Control": "manual",
      "Data-Sources": "api",
      "Refresh-Interval": "system",
      "Trustworthiness": "system"
    } : 
    {
      "Profession": "linkedin",
      "Web3-Interests": "manual",
      "Local-City": "linkedin",
      "Email": "linkedin",
      "EVM-Public-Key": "wallet",
      "BTC-Public-Key": "wallet",
      "Tokens-of-Interest": "manual",
      "Chain-IDs": "wallet",
      "Wallets-of-Interest": "wallet"
    };

  const [dataSources, setDataSources] = useState<DataSource>(defaultDataSources);
  const { toast } = useToast();

  const handleSavePrivateData = () => {
    onUpdatePrivateData(editingData);
    setIsEditing(false);
    toast({
      title: "Private Data Updated",
      description: `Your ${isAgentQube ? 'agent' : 'private'} data has been updated successfully`,
    });
  };

  const getSourceIcon = (key: string) => {
    const source = dataSources[key] || 'manual';

    if (isAgentQube) {
      switch (source) {
        case 'api':
          return <Database className="h-3 w-3 text-blue-500" />;
        case 'system':
          return <Brain className="h-3 w-3 text-purple-500" />;
        case 'manual':
        default:
          return <User className="h-3 w-3 text-gray-500" />;
      }
    } else {
      switch (source) {
        case 'linkedin':
          return <Linkedin className="h-3 w-3 text-blue-500" />;
        case 'wallet':
          return <Wallet className="h-3 w-3 text-orange-500" />;
        case 'manual':
        default:
          return <User className="h-3 w-3 text-gray-500" />;
      }
    }
  };

  const handleSourceChange = (key: string, value: string) => {
    setDataSources({
      ...dataSources,
      [key]: value
    });
    
    toast({
      title: "Data Source Updated",
      description: `The data source for ${key} has been updated to ${value}`,
    });
  };

  const getSourceOptions = (key: string) => {
    if (isAgentQube) {
      return (
        <>
          <DropdownMenuItem onClick={() => handleSourceChange(key, 'manual')}>
            <User className="h-3.5 w-3.5 mr-2" /> Manual Entry
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSourceChange(key, 'api')}>
            <Database className="h-3.5 w-3.5 mr-2" /> API Source
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSourceChange(key, 'system')}>
            <Brain className="h-3.5 w-3.5 mr-2" /> System Generated
          </DropdownMenuItem>
        </>
      );
    } else {
      return (
        <>
          <DropdownMenuItem onClick={() => handleSourceChange(key, 'manual')}>
            <User className="h-3.5 w-3.5 mr-2" /> Manual Entry
          </DropdownMenuItem>
          {['Profession', 'Local-City', 'Email'].includes(key) && (
            <DropdownMenuItem onClick={() => handleSourceChange(key, 'linkedin')}>
              <Linkedin className="h-3.5 w-3.5 mr-2" /> LinkedIn
            </DropdownMenuItem>
          )}
          {['EVM-Public-Key', 'BTC-Public-Key', 'Chain-IDs', 'Wallets-of-Interest'].includes(key) && (
            <DropdownMenuItem onClick={() => handleSourceChange(key, 'wallet')}>
              <Wallet className="h-3.5 w-3.5 mr-2" /> Wallet
            </DropdownMenuItem>
          )}
        </>
      );
    }
  };

  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="private-data">
          <AccordionTrigger>
            <div className="flex items-center">
              <Key className="h-4 w-4 mr-2" />
              {isAgentQube ? 'Agent Data Fields' : 'Private Data Fields'}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 py-2">
              {!isEditing ? (
                <>
                  {Object.entries(privateData).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center border-b pb-1">
                      <span className="text-xs font-medium">
                        {key}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[60%] text-right flex items-center justify-end">
                        {Array.isArray(value) ? value.join(", ") : value}
                        <span className="ml-1.5">{getSourceIcon(key)}</span>
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsEditing(true)}>
                      <Info className="h-3.5 w-3.5 mr-1" /> Edit Data
                    </Button>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Info className="h-3.5 w-3.5 mr-1" /> View All
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {Object.entries(editingData).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="space-y-1 border-b pb-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">{key}</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              {getSourceIcon(key)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {getSourceOptions(key)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {Array.isArray(value) ? (
                        <Input
                          value={value.join(', ')}
                          onChange={(e) => setEditingData({
                            ...editingData,
                            [key]: e.target.value.split(',').map(item => item.trim())
                          })}
                          className="h-7 text-xs"
                        />
                      ) : (
                        <Input
                          value={value as string}
                          onChange={(e) => setEditingData({
                            ...editingData,
                            [key]: e.target.value
                          })}
                          className="h-7 text-xs"
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="mt-2 bg-iqube-primary" onClick={handleSavePrivateData}>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="encryption">
          <AccordionTrigger>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Encryption Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 py-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Algorithm</Label>
                <Select value={encryptionAlgorithm} onValueChange={setEncryptionAlgorithm}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kyber">Kyber (Quantum-resistant)</SelectItem>
                    <SelectItem value="ntru">NTRU (Quantum-resistant)</SelectItem>
                    <SelectItem value="aes256">AES-256</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="rotate-keys" className="text-xs">Auto-rotate keys</Label>
                <Switch id="rotate-keys" checked={true} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-medium">Access Controls</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Agent Access</Label>
            <Switch checked={true} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs">Third-party Apps</Label>
            <Switch checked={false} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs">Public Analytics</Label>
            <Switch checked={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlakQubeSection;
