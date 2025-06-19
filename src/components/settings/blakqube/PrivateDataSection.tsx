import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { User, Linkedin, Wallet, Database, Brain, Twitter, MessageCircle, Globe, Users, Youtube, Facebook } from 'lucide-react';
import PrivateDataView from './PrivateDataView';
import PrivateDataEditor from './PrivateDataEditor';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivateDataSectionProps {
  privateData: {
    [key: string]: string | string[];
  };
  onUpdatePrivateData: (newData: {
    [key: string]: string | string[];
  }) => void;
  iQubeType: string;
  sectionTitle: string;
  isKNYTPersona?: boolean;
}

const InstagramIcon = () => <svg viewBox="0 0 24 24" className="h-3/4 w-3/4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>;
const TelegramIcon = () => <svg viewBox="0 0 24 24" className="h-3/4 w-3/4" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>;
const DiscordIcon = () => <svg viewBox="0 0 24 24" className="h-3/4 w-3/4" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>;
const TikTokIcon = () => <svg viewBox="0 0 24 24" className="h-3/4 w-3/4" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-1.32-.17A6.441 6.441 0 0 0 3.589 15.71c.002.036.003.143.003.18A6.441 6.441 0 0 0 9.589 22.3a6.373 6.373 0 0 0 2.445-.49v-3.91a2.789 2.789 0 0 1-.823.13 2.897 2.897 0 0 1-2.78-2.014l-.002-.006a2.882 2.882 0 0 1-.205-.967c0-.118.014-.234.041-.347a2.896 2.896 0 0 1 5.394-1.107l-.005.011.005-.011V22.3c.002 0 .004-.002.006-.002h3.448V9.83a8.18 8.18 0 0 0 4.77 1.526V7.911a4.786 4.786 0 0 1-2.099-.475z" />
  </svg>;
const MetaKnytsIcon = () => <img src="/lovable-uploads/6f817ca0-9891-417f-8e40-7fa09f63eb3b.png" alt="metaKnyts" className="h-3/4 w-3/4 object-contain" />;

const PrivateDataSection = ({
  privateData,
  onUpdatePrivateData,
  iQubeType,
  sectionTitle,
  isKNYTPersona = false
}: PrivateDataSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<{
    [key: string]: string | string[];
  }>({
    ...privateData
  });
  const [dataSources, setDataSources] = useState<{
    [key: string]: string;
  }>({});

  // Update the data sources and editing data whenever iQube type or private data changes
  useEffect(() => {
    setDataSources(getDefaultDataSourcesByType(iQubeType, isKNYTPersona));
    setEditingData({
      ...privateData
    });
  }, [iQubeType, privateData, isKNYTPersona]);
  function getDefaultDataSourcesByType(type: string, isKNYT: boolean): {
    [key: string]: string;
  } {
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
        if (isKNYT) {
          return {
            "First-Name": "metaknyts",
            "Last-Name": "metaknyts",
            "Qrypto-ID": "metaknyts",
            "Profession": "linkedin",
            // Default to linkedin, but will show both options
            "Local-City": "metaknyts",
            "Email": "metaknyts",
            "EVM-Public-Key": "wallet",
            "BTC-Public-Key": "wallet",
            "ThirdWeb-Public-Key": "thirdweb",
            "LinkedIn-ID": "linkedin",
            "LinkedIn-Profile-URL": "linkedin",
            "Twitter-Handle": "twitter",
            "Telegram-Handle": "telegram",
            "Discord-Handle": "discord",
            "Instagram-Handle": "instagram",
            "Luma-ID": "luma",
            "YouTube-ID": "youtube",
            "Facebook-ID": "facebook",
            "TikTok-Handle": "tiktok",
            "Web3-Interests": "manual",
            "Tokens-of-Interest": "manual",
            "Chain-IDs": "manual",
            // Associated Public Keys mapped to Chain-IDs
            "KNYT-ID": "metaknyts",
            "Phone-Number": "metaknyts",
            "Age": "manual",
            "Address": "metaknyts",
            "OM-Member-Since": "metaknyts",
            "OM-Tier-Status": "metaknyts",
            "Metaiye-Shares-Owned": "metaknyts",
            "Total-Invested": "manual",
            "KNYT-COYN-Owned": "metaknyts",
            "MetaKeep-Public-Key": "metaknyts",
            "Motion-Comics-Owned": "wallet",
            "Paper-Comics-Owned": "manual",
            "Digital-Comics-Owned": "wallet",
            "KNYT-Posters-Owned": "manual",
            "KNYT-Cards-Owned": "manual",
            "Characters-Owned": "manual"
          };
        } else {
          // Default DataQube mappings for Qrypto Persona
          return {
            "First-Name": "linkedin",
            "Last-Name": "linkedin",
            "Qrypto-ID": "manual",
            "Profession": "linkedin",
            "Local-City": "linkedin",
            "Email": "linkedin",
            "LinkedIn-ID": "linkedin",
            "LinkedIn-Profile-URL": "linkedin",
            "Twitter-Handle": "twitter",
            "Telegram-Handle": "telegram",
            "Discord-Handle": "discord",
            "Instagram-Handle": "instagram",
            "GitHub-Handle": "manual",
            "YouTube-ID": "youtube",
            "Facebook-ID": "facebook",
            "TikTok-Handle": "tiktok",
            "Web3-Interests": "manual",
            "EVM-Public-Key": "wallet",
            "BTC-Public-Key": "wallet",
            "Chain-IDs": "wallet",
            "Wallets-of-Interest": "wallet",
            "Tokens-of-Interest": "manual"
          };
        }
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
            return <Database className="h-3/4 w-3/4 text-blue-500" />;
          case 'system':
            return <Brain className="h-3/4 w-3/4 text-purple-500" />;
          case 'manual':
          default:
            return <User className="h-3/4 w-3/4 text-gray-500" />;
        }
      case 'ToolQube':
        switch (source) {
          case 'api':
            return <Database className="h-3/4 w-3/4 text-green-500" />;
          case 'system':
            return <Brain className="h-3/4 w-3/4 text-orange-500" />;
          case 'manual':
          default:
            return <User className="h-3/4 w-3/4 text-gray-500" />;
        }
      case 'DataQube':
      default:
        switch (source) {
          case 'linkedin':
            return <Linkedin className="h-3/4 w-3/4" />;
          case 'wallet':
            return <Wallet className="h-3/4 w-3/4 text-orange-500" />;
          case 'twitter':
            return <Twitter className="h-3/4 w-3/4 text-blue-400" />;
          case 'discord':
            return <DiscordIcon />;
          case 'telegram':
            return <TelegramIcon />;
          case 'instagram':
            return <InstagramIcon />;
          case 'luma':
            return <Globe className="h-3/4 w-3/4 text-green-500" />;
          case 'youtube':
            return <Youtube className="h-3/4 w-3/4 text-red-500" />;
          case 'facebook':
            return <Facebook className="h-3/4 w-3/4 text-blue-600" />;
          case 'tiktok':
            return <TikTokIcon />;
          case 'thirdweb':
            return <Wallet className="h-3/4 w-3/4 text-purple-500" />;
          case 'metaknyts':
            return <MetaKnytsIcon />;
          case 'manual':
          default:
            return <User className="h-3/4 w-3/4 text-gray-500" />;
        }
    }
  };
  const handleSourceChange = (key: string, value: string) => {
    setDataSources({
      ...dataSources,
      [key]: value
    });
  };
  return <AccordionItem value="private-data">
      <AccordionTrigger>
        <div className="flex items-center">
          <Key className="h-4 w-4 mr-2" />
          {sectionTitle}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 py-2">
          {!isEditing ? <PrivateDataView privateData={privateData} onEdit={() => setIsEditing(true)} getSourceIcon={getSourceIcon} /> : <PrivateDataEditor editingData={editingData} setEditingData={setEditingData} onSave={handleSavePrivateData} onCancel={() => setIsEditing(false)} dataSources={dataSources} iQubeType={iQubeType} onSourceChange={handleSourceChange} isKNYTPersona={isKNYTPersona} />}
        </div>
      </AccordionContent>
    </AccordionItem>;
};
export default PrivateDataSection;
