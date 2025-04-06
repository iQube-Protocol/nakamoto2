
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  Key
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

  // Sample private key for demo purposes
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

  // Mock function for connecting to services
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

  // Mock function for saving settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    });
  };

  // Mock function for minting an iQube
  const handleMintIQube = () => {
    toast({
      title: "iQube Minted",
      description: "Your iQube has been minted successfully to the blockchain",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>
              Manage your iQube settings, connections, and privacy preferences
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Tabs defaultValue="connections">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="iqube">iQube Management</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections" className="mt-4">
            <Card>
              <CardHeader>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MetaQube Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Database className="h-5 w-5 mr-2 text-iqube-accent" /> 
                    metaQube Management
                  </CardTitle>
                  <CardDescription>
                    Edit public metadata for your iQube
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="iqube-identifier">iQube Identifier</Label>
                    <Input 
                      id="iqube-identifier" 
                      value={metaQube["iQube-Identifier"]}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iqube-use">iQube Use</Label>
                    <Textarea 
                      id="iqube-use"
                      defaultValue={metaQube["iQube-Use"]}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner-identifiability">Owner Identifiability</Label>
                    <Select defaultValue={metaQube["Owner-Identifiability"].toLowerCase()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select identifiability level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anonymous">Anonymous</SelectItem>
                        <SelectItem value="semi-identifiable">Semi-Identifiable</SelectItem>
                        <SelectItem value="identifiable">Identifiable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Related iQubes</Label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                      {metaQube["Related-iQubes"].map((qube, i) => (
                        <Badge key={i} variant="outline" className="bg-iqube-primary/10">
                          {qube}
                        </Badge>
                      ))}
                      <Button variant="outline" size="sm" className="h-6">
                        + Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* blakQube Management */}
              <Card>
                <CardHeader>
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
                        <div className="space-y-4 py-2">
                          {Object.entries(privateData).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <Label htmlFor={key}>{key}</Label>
                              {Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                                  {value.map((item, i) => (
                                    <Badge key={i} variant="outline" className="bg-muted">
                                      {item}
                                    </Badge>
                                  ))}
                                  <Button variant="outline" size="sm" className="h-6">
                                    + Add
                                  </Button>
                                </div>
                              ) : (
                                <Input 
                                  id={key}
                                  defaultValue={value}
                                />
                              )}
                            </div>
                          ))}
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
                        <div className="space-y-4 py-2">
                          <div className="space-y-2">
                            <Label htmlFor="encryption-algorithm">Encryption Algorithm</Label>
                            <Select defaultValue="kyber">
                              <SelectTrigger>
                                <SelectValue placeholder="Select algorithm" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kyber">Kyber (Quantum-resistant)</SelectItem>
                                <SelectItem value="ntru">NTRU (Quantum-resistant)</SelectItem>
                                <SelectItem value="aes">AES-256</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="rotate-keys" className="flex-1">Auto-rotate encryption keys</Label>
                            <Switch id="rotate-keys" checked={true} />
                          </div>
                          <div className="bg-iqube-primary/10 border border-iqube-primary/30 rounded-md p-3 text-xs text-muted-foreground">
                            Quantum-resistant encryption protects your data against future quantum computing attacks
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium">Access Controls</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-sm">Agent Access</Label>
                          <p className="text-xs text-muted-foreground">Allow AI agents to access your data</p>
                        </div>
                        <Switch checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-sm">Third-party Applications</Label>
                          <p className="text-xs text-muted-foreground">Allow trusted dApps to access data</p>
                        </div>
                        <Switch checked={false} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-sm">Public Analytics</Label>
                          <p className="text-xs text-muted-foreground">Allow anonymized data for analytics</p>
                        </div>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* TokenQube Management */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-iqube-accent" />
                    TokenQube Management
                  </CardTitle>
                  <CardDescription>
                    Manage blockchain ownership and access rights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">Connected Wallet</Label>
                        {settings.connected.wallet ? (
                          <div className="flex items-center mt-2 p-2 bg-iqube-primary/10 rounded-md border border-iqube-primary/30">
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-mono text-xs truncate">0x71C7656EC7...8976F</span>
                          </div>
                        ) : (
                          <Button 
                            className="mt-2 w-full bg-iqube-primary hover:bg-iqube-primary/90"
                            onClick={() => handleConnectService('wallet')}
                          >
                            Connect Wallet
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="blockchain-network">Blockchain Network</Label>
                        <Select defaultValue="ethereum">
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethereum">Ethereum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="solana">Solana</SelectItem>
                            <SelectItem value="optimism">Optimism</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="token-standard">Token Standard</Label>
                        <Select defaultValue="erc721">
                          <SelectTrigger>
                            <SelectValue placeholder="Select standard" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="erc721">ERC-721 (NFT)</SelectItem>
                            <SelectItem value="erc1155">ERC-1155 (Multi-token)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="access-grants">Access Grants</Label>
                        <div className="border rounded-md p-2 min-h-24 space-y-2">
                          <div className="flex items-center justify-between p-1 bg-muted/50 rounded text-xs">
                            <span className="font-mono truncate">0x391874...35F1</span>
                            <Badge className="text-[10px] px-1 py-0 h-4 bg-green-500">Full Access</Badge>
                          </div>
                          <div className="flex items-center justify-between p-1 bg-muted/50 rounded text-xs">
                            <span className="font-mono truncate">0x71C765...976F</span>
                            <Badge className="text-[10px] px-1 py-0 h-4 bg-blue-500">Read Only</Badge>
                          </div>
                          <Button variant="outline" size="sm" className="w-full text-xs h-7">
                            + Add Access
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-sm">Transfer Lock</Label>
                          <p className="text-xs text-muted-foreground">Prevent token transfers</p>
                        </div>
                        <Switch checked={true} />
                      </div>
                      
                      <Button 
                        className="w-full mt-3 bg-gradient-to-r from-iqube-primary to-iqube-accent"
                        onClick={handleMintIQube}
                      >
                        Mint iQube
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 text-sm">
                      <h4 className="font-medium mb-1 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-yellow-500" /> Important
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        Minting your iQube to the blockchain creates an immutable record of ownership.
                        Gas fees will apply based on the selected network. Your private data (blakQube)
                        remains encrypted and is only referenced on-chain, not stored directly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Preferences</CardTitle>
                <CardDescription>
                  Control your app experience and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Interface Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select defaultValue={settings.theme}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue={settings.language}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <Bell className="h-4 w-4 mr-2" /> Notification Preferences
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive important updates via email</p>
                      </div>
                      <Switch checked={settings.notifications} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
                      </div>
                      <Switch checked={settings.notifications} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">Connection Requests</Label>
                        <p className="text-xs text-muted-foreground">Notify when someone wants to connect</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">Events & Announcements</Label>
                        <p className="text-xs text-muted-foreground">Updates about community events</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2" /> Privacy Settings
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">Share Learning Progress</Label>
                        <p className="text-xs text-muted-foreground">Make your learning journey visible</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">Show Token Holdings</Label>
                        <p className="text-xs text-muted-foreground">Display your token balances to others</p>
                      </div>
                      <Switch checked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">Public Profile</Label>
                        <p className="text-xs text-muted-foreground">Make profile visible in community</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">Anonymous Mode</Label>
                        <p className="text-xs text-muted-foreground">Hide all identifiable information</p>
                      </div>
                      <Switch checked={false} />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSaveSettings} className="bg-iqube-primary hover:bg-iqube-primary/90">
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsInterface;
