
import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { User, Linkedin, Wallet, Database, Brain, Twitter, MessageCircle, Globe, Users } from 'lucide-react';
import PrivateDataView from './PrivateDataView';
import PrivateDataEditor from './PrivateDataEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivateDataSectionProps {
  privateData: { [key: string]: string | string[] };
  onUpdatePrivateData: (newData: { [key: string]: string | string[] }) => void;
  iQubeType: string;
  sectionTitle: string;
}

const PrivateDataSection = ({
  privateData,
  onUpdatePrivateData,
  iQubeType,
  sectionTitle
}: PrivateDataSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<{ [key: string]: string | string[] }>({...privateData});
  const [dataSources, setDataSources] = useState<{[key: string]: string}>({});

  // Update the data sources and editing data whenever iQube type or private data changes
  useEffect(() => {
    setDataSources(getDefaultDataSourcesByType(iQubeType));
    setEditingData({...privateData});
  }, [iQubeType, privateData]);

  function getDefaultDataSourcesByType(type: string): {[key: string]: string} {
    switch (type) {
      case "AgentQube":
        return {
          "AI-Capabilities": "api",
          "Model Weights": "system",
          "Training Data": "api",
          "Model-Version": "api",
          "API Key": "system",
          "Access-Control": "manual",
          "Data-Sources": "api",
          "Refresh-Interval": "system",
          "Trustworthiness": "system"
        };
      case "ToolQube":
        return {
          "Storage-Quota": "api",
          "Connected-Email": "manual",
          "Auto-Sync": "system",
          "Sharing-Permissions": "manual",
          "Cached-Files": "system",
          "API-Key": "system",
          "Last-Sync": "system",
          "Default-View": "manual",
          "File-Count": "api"
        };
      case "ContentQube":
        return {
          "Content-Type": "api",
          "Creation-Date": "system",
          "Author": "manual",
          "Keywords": "manual",
          "Version": "system",
          "License": "manual",
          "Distribution": "manual",
          "Related-Content": "api",
          "Analytics": "api"
        };
      case "ModelQube":
        return {
          "Model-Type": "api",
          "Parameters": "system",
          "Training-Dataset": "api",
          "Accuracy": "system",
          "Version": "system",
          "Creator": "manual",
          "Use-Cases": "manual",
          "Dependencies": "system",
          "Limitations": "manual"
        };
      case "DataQube":
      default:
        return {
          "Profession": "linkedin",
          "Web3-Interests": "manual",
          "Local-City": "linkedin",
          "Email": "linkedin",
          "EVM-Public-Key": "wallet",
          "BTC-Public-Key": "wallet",
          "Tokens-of-Interest": "manual",
          "Chain-IDs": "wallet",
          "Wallets-of-Interest": "wallet",
          "LinkedIn-ID": "linkedin",
          "Twitter-ID": "twitter",
          "Discord-ID": "discord",
          "Telegram-ID": "telegram",
          "Luma-ID": "luma"
        };
    }
  }

  const handleSavePrivateData = () => {
    onUpdatePrivateData(editingData);
    setIsEditing(false);
  };

  const getSourceIcon = (key: string) => {
    const source = dataSources[key] || 'manual';

    switch (iQubeType) {
      case 'AgentQube':
        switch (source) {
          case 'api':
            return <Database className="h-3 w-3 text-blue-500" />;
          case 'system':
            return <Brain className="h-3 w-3 text-purple-500" />;
          case 'manual':
          default:
            return <User className="h-3 w-3 text-gray-500" />;
        }
      case 'ToolQube':
        switch (source) {
          case 'api':
            return <Database className="h-3 w-3 text-green-500" />;
          case 'system':
            return <Brain className="h-3 w-3 text-orange-500" />;
          case 'manual':
          default:
            return <User className="h-3 w-3 text-gray-500" />;
        }
      case 'DataQube':
      default:
        switch (source) {
          case 'linkedin':
            return <Linkedin className="h-3 w-3 text-blue-500" />;
          case 'wallet':
            return <Wallet className="h-3 w-3 text-orange-500" />;
          case 'twitter':
            return <Twitter className="h-3 w-3 text-blue-400" />;
          case 'discord':
            return <Users className="h-3 w-3 text-purple-500" />;
          case 'telegram':
            return <MessageCircle className="h-3 w-3 text-blue-500" />;
          case 'luma':
            return <Globe className="h-3 w-3 text-green-500" />;
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
  };

  return (
    <AccordionItem value="private-data">
      <AccordionTrigger>
        <div className="flex items-center">
          <Key className="h-4 w-4 mr-2" />
          {sectionTitle}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 py-2">
          {!isEditing ? (
            <PrivateDataView 
              privateData={privateData} 
              onEdit={() => setIsEditing(true)}
              getSourceIcon={getSourceIcon}
            />
          ) : (
            <PrivateDataEditor 
              editingData={editingData}
              setEditingData={setEditingData}
              onSave={handleSavePrivateData}
              onCancel={() => setIsEditing(false)}
              dataSources={dataSources}
              iQubeType={iQubeType}
              onSourceChange={handleSourceChange}
            />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PrivateDataSection;
