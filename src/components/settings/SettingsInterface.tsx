
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Linkedin,
  MessageCircle,
  Twitter,
  Users,
  Wallet,
  Shield,
  Bell,
  Globe,
  Check,
  Database,
  Lock,
  Key,
  Info,
  Plus
} from 'lucide-react';
import { UserSettings, MetaQube } from '@/lib/types';

interface SettingsInterfaceProps {
  userSettings: UserSettings;
  metaQube: MetaQube;
}

interface ServiceConnectionProps {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect: () => void;
}

interface ScoreBadgeProps {
  value: number;
  label: string;
  type: 'sensitivity' | 'trust' | 'risk' | 'accuracy' | 'verifiability';
}

const ScoreBadge = ({ value, label, type }: ScoreBadgeProps) => {
  // Helper function to get the appropriate color based on score and type
  const getScoreColor = () => {
    if (type === 'risk' || type === 'sensitivity') {
      // Risk and Sensitivity: 1-4 green, 5-7 amber, 8-10 red
      return value <= 4 
        ? "bg-green-500/60" 
        : value <= 7 
          ? "bg-yellow-500/60" 
          : "bg-red-500/60";
    } else if (type === 'trust') {
      // Trust: 5-10 green, 3-4 amber, 1-2 red
      return value >= 5 
        ? "bg-green-500/60" 
        : value >= 3 
          ? "bg-yellow-500/60" 
          : "bg-red-500/60";
    } else {
      // Accuracy and Verifiability: 1-3 red, 4-6 amber, 7-10 green
      return value <= 3 
        ? "bg-red-500/60" 
        : value <= 6 
          ? "bg-yellow-500/60" 
          : "bg-green-500/60";
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getScoreColor()}`}>
        {value}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
};

const ServiceConnection = ({ name, icon, connected, onConnect }: ServiceConnectionProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center">
        <div className="p-2 bg-iqube-primary/20 rounded-md mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {connected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
      <Button 
        size="sm"
        variant={connected ? "outline" : "default"}
        onClick={onConnect}
        className={connected ? "" : "bg-iqube-primary hover:bg-iqube-primary/90"}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </Button>
    </div>
  );
};

const SettingsInterface = ({ userSettings, metaQube }: SettingsInterfaceProps) => {
  const [settings, setSettings] = useState<UserSettings>({...userSettings});
  const { toast } = useToast();

  // Calculate Trust score as the average of Accuracy and Verifiability
  const trustScore = Math.round((metaQube["Accuracy-Score"] + metaQube["Verifiability-Score"]) / 2);

  const [privateData, setPrivateData] = useState({
    "Profession": "Software Developer",
    "Web3-Interests": ["DeFi", "NFTs", "DAOs"],
    "Local-City": "San Francisco",
    "Email": "user@example.com",
    "EVM-Public-Key": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    "BTC-Public-Key": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "Tokens-of-Interest": ["ETH", "BTC", "MATIC"],
    "Chain-IDs": ["1", "137"],
    "Wallets-of-Interest": ["MetaMask", "Rainbow"]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState({...privateData});
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState("kyber");

  const handleConnectService = (service: keyof UserSettings['connected']) => {
    setSettings(prev => ({
      ...prev,
      connected: {
        ...prev.connected,
        [service]: !prev.connected[service]
      }
    }));

    toast({
      title: settings.connected[service] ? `${service} disconnected` : `${service} connected`,
      description: settings.connected[service] 
        ? `Your ${service} account has been disconnected` 
        : `Your ${service} account has been successfully connected`,
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    });
  };

  const handleMintIQube = () => {
    toast({
      title: "iQube Minted",
      description: "Your iQube has been minted successfully to the blockchain",
    });
  };

  const handleSavePrivateData = () => {
    setPrivateData(editingData);
    setIsEditing(false);
    toast({
      title: "Private Data Updated",
      description: "Your private data has been updated successfully",
    });
  };

  const handleAddAccessGrant = () => {
    toast({
      title: "Access Grant Added",
      description: "New access grant has been added successfully",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Tabs defaultValue="connections">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="iqube">iQube Management</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <div className="mt-2 p-2 bg-muted/30 border rounded-md flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 text-iqube-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <span className="text-sm font-medium">{metaQube["iQube-Identifier"]}</span>
            <Badge variant="outline" className="bg-iqube-primary/10 text-iqube-primary border-iqube-primary/30">
              {metaQube["iQube-Type"]}
            </Badge>
          </div>
          <div className="flex-1 flex items-center justify-end gap-3">
            <ScoreBadge value={metaQube["Sensitivity-Score"]} label="Sensitivity" type="sensitivity" />
            <ScoreBadge value={trustScore} label="Trust" type="trust" />
            <ScoreBadge value={metaQube["Risk-Score"]} label="Risk" type="risk" />
          </div>
        </div>
        
        <TabsContent value="connections" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">External Connections</CardTitle>
              <CardDescription>
                Connect external services to enhance your iQube data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ServiceConnection 
                  name="LinkedIn"
                  icon={<Linkedin className="h-5 w-5 text-iqube-primary" />}
                  connected={settings.connected.linkedin}
                  onConnect={() => handleConnectService('linkedin')}
                />
                <ServiceConnection 
                  name="Luma"
                  icon={<Globe className="h-5 w-5 text-iqube-primary" />}
                  connected={settings.connected.luma}
                  onConnect={() => handleConnectService('luma')}
                />
                <ServiceConnection 
                  name="Telegram"
                  icon={<MessageCircle className="h-5 w-5 text-iqube-primary" />}
                  connected={settings.connected.telegram}
                  onConnect={() => handleConnectService('telegram')}
                />
                <ServiceConnection 
                  name="Twitter"
                  icon={<Twitter className="h-5 w-5 text-iqube-primary" />}
                  connected={settings.connected.twitter}
                  onConnect={() => handleConnectService('twitter')}
                />
                <ServiceConnection 
                  name="Discord"
                  icon={<Users className="h-5 w-5 text-iqube-primary" />}
                  connected={settings.connected.discord}
                  onConnect={() => handleConnectService('discord')}
                />
                <ServiceConnection 
                  name="Wallet"
                  icon={<Wallet className="h-5 w-5 text-iqube-primary" />}
                  connected={settings.connected.wallet}
                  onConnect={() => handleConnectService('wallet')}
                />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 text-sm">
                <h4 className="font-medium mb-1 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-amber-500" /> Data Privacy Notice
                </h4>
                <p className="text-muted-foreground">
                  Connecting these services will import data into your iQube. All data is encrypted and stored
                  in your private blakQube layer. You control what information is shared with the community.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iqube" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-iqube-primary" />
                  blakQube Management
                </CardTitle>
                <CardDescription>
                  Manage your private encrypted data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="private-data">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Key className="h-4 w-4 mr-2" />
                        Private Data Fields
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 py-2">
                        {!isEditing ? (
                          <>
                            {Object.entries(privateData).slice(0, 6).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center border-b pb-1">
                                <span className="text-xs font-medium">{key}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[60%] text-right">
                                  {Array.isArray(value) ? value.join(", ") : value}
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
                                <Label className="text-xs">{key}</Label>
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Wallet className="h-5 w-5 mr-2 text-iqube-accent" />
                  TokenQube Management
                </CardTitle>
                <CardDescription>
                  Manage blockchain ownership and access rights
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                        onClick={() => handleConnectService('wallet')}
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
                        onClick={handleAddAccessGrant}
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
                    onClick={handleMintIQube}
                    size="sm"
                  >
                    Mint iQube
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Application Preferences</CardTitle>
              <CardDescription>
                Control your app experience and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Interface Settings</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Theme</Label>
                      <Select defaultValue={settings.theme}>
                        <SelectTrigger className="h-8 text-xs w-24">
                          <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Language</Label>
                      <Select defaultValue={settings.language}>
                        <SelectTrigger className="h-8 text-xs w-24">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Bell className="h-4 w-4 mr-2" /> Notifications
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Email Notifications</Label>
                      <Switch checked={settings.notifications} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Push Notifications</Label>
                      <Switch checked={settings.notifications} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Connection Requests</Label>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2" /> Privacy Settings
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Share Learning Progress</Label>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Show Token Holdings</Label>
                    <Switch checked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Public Profile</Label>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Anonymous Mode</Label>
                    <Switch checked={false} />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button onClick={handleSaveSettings} className="bg-iqube-primary hover:bg-iqube-primary/90" size="sm">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsInterface;
