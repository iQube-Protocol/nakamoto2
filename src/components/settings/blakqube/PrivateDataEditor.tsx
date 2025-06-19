
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DataSourceSelector from './DataSourceSelector';
import ReadOnlyInputWithTooltip from './ReadOnlyInputWithTooltip';
import { User, Linkedin, Wallet, Database, Brain, Twitter, MessageCircle, Globe, Users, Youtube, Facebook } from 'lucide-react';

interface PrivateDataEditorProps {
  editingData: { [key: string]: string | string[] };
  setEditingData: React.Dispatch<React.SetStateAction<{ [key: string]: string | string[] }>>;
  onSave: () => void;
  onCancel: () => void;
  dataSources: { [key: string]: string };
  iQubeType: string;
  onSourceChange: (key: string, value: string) => void;
  isKNYTPersona?: boolean;
}

// Custom icon components to match PrivateDataSection
const InstagramIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>;

const TelegramIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>;

const DiscordIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>;

const TikTokIcon = () => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-1.32-.17A6.441 6.441 0 0 0 3.589 15.71c.002.036.003.143.003.18A6.441 6.441 0 0 0 9.589 22.3a6.373 6.373 0 0 0 2.445-.49v-3.91a2.789 2.789 0 0 1-.823.13 2.897 2.897 0 0 1-2.78-2.014l-.002-.006a2.882 2.882 0 0 1-.205-.967c0-.118.014-.234.041-.347a2.896 2.896 0 0 1 5.394-1.107l-.005.011.005-.011V22.3c.002 0 .004-.002.006-.002h3.448V9.83a8.18 8.18 0 0 0 4.77 1.526V7.911a4.786 4.786 0 0 1-2.099-.475z" />
  </svg>;

const MetaKnytsIcon = () => <img alt="metaKnyts" className="h-4 w-4 object-contain" src="/lovable-uploads/54159ae5-c001-492c-ae34-849d5492cc78.png" />;

// Function to calculate OM Tier Status based on investment amount
const calculateOMTierStatus = (totalInvested: string): string => {
  if (!totalInvested) return '';
  
  // Extract numeric value from string (remove $ and commas)
  const numericValue = parseFloat(totalInvested.replace(/[$,]/g, ''));
  
  if (isNaN(numericValue)) return '';
  
  if (numericValue >= 999) return 'ZeroJ+KNYT';
  if (numericValue >= 499) return 'FirstKNYT';
  if (numericValue >= 299) return 'KejiKNYT';
  if (numericValue >= 100) return 'KetaKNYT';
  
  return '';
};

const PrivateDataEditor = ({
  editingData,
  setEditingData,
  onSave,
  onCancel,
  dataSources,
  iQubeType,
  onSourceChange,
  isKNYTPersona = false
}: PrivateDataEditorProps) => {
  // Fields that should be read-only for KNYT Persona
  const knytReadOnlyFields = ['OM-Member-Since', 'Metaiye-Shares-Owned', 'Total-Invested', 'OM-Tier-Status'];
  
  const isReadOnlyField = (key: string) => {
    return isKNYTPersona && knytReadOnlyFields.includes(key);
  };

  const formatValue = (key: string, value: string | string[]) => {
    if (key === 'Total-Invested' && typeof value === 'string' && value) {
      // Format as dollar amount if not already formatted
      const numericValue = value.replace(/[$,]/g, '');
      if (!isNaN(Number(numericValue)) && numericValue !== '') {
        return `$${Number(numericValue).toLocaleString()}`;
      }
    }
    return Array.isArray(value) ? value.join(', ') : value;
  };

  const getSourceIcon = (key: string) => {
    const source = dataSources[key] || 'manual';
    switch (iQubeType) {
      case 'AgentQube':
        switch (source) {
          case 'api':
            return <Database className="h-4 w-4 text-blue-500" />;
          case 'system':
            return <Brain className="h-4 w-4 text-purple-500" />;
          case 'manual':
          default:
            return <User className="h-4 w-4 text-gray-500" />;
        }
      case 'ToolQube':
        switch (source) {
          case 'api':
            return <Database className="h-4 w-4 text-green-500" />;
          case 'system':
            return <Brain className="h-4 w-4 text-orange-500" />;
          case 'manual':
          default:
            return <User className="h-4 w-4 text-gray-500" />;
        }
      case 'DataQube':
      default:
        switch (source) {
          case 'linkedin':
            return <Linkedin className="h-4 w-4" />;
          case 'wallet':
            return <Wallet className="h-4 w-4 text-orange-500" />;
          case 'twitter':
            return <Twitter className="h-4 w-4 text-blue-400" />;
          case 'discord':
            return <DiscordIcon />;
          case 'telegram':
            return <TelegramIcon />;
          case 'instagram':
            return <InstagramIcon />;
          case 'luma':
            return <Globe className="h-4 w-4 text-green-500" />;
          case 'youtube':
            return <Youtube className="h-4 w-4 text-red-500" />;
          case 'facebook':
            return <Facebook className="h-4 w-4 text-blue-600" />;
          case 'tiktok':
            return <TikTokIcon />;
          case 'thirdweb':
            return <Wallet className="h-4 w-4 text-purple-500" />;
          case 'metaknyts':
            return <MetaKnytsIcon />;
          case 'manual':
          default:
            return <User className="h-4 w-4 text-gray-500" />;
        }
    }
  };

  const handleInputChange = (key: string, newValue: string) => {
    const updatedData = {
      ...editingData,
      [key]: newValue
    };

    // If this is KNYT Persona and Total-Invested changed, recalculate OM-Tier-Status
    if (isKNYTPersona && key === 'Total-Invested') {
      const calculatedTier = calculateOMTierStatus(newValue);
      if (calculatedTier) {
        updatedData['OM-Tier-Status'] = calculatedTier;
      }
    }

    setEditingData(updatedData);
  };

  const handleArrayInputChange = (key: string, newValue: string) => {
    setEditingData({
      ...editingData,
      [key]: newValue.split(',').map(item => item.trim())
    });
  };

  return (
    <>
      <div className="max-h-[220px] overflow-y-auto pr-2">
        {Object.entries(editingData).map(([key, value]) => (
          <div key={key} className="space-y-1 border-b pb-2 mb-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-white">{key}</Label>
              <DataSourceSelector 
                sourceKey={key}
                currentSource={dataSources[key] || 'manual'}
                iQubeType={iQubeType}
                onSourceChange={onSourceChange}
                isKNYTPersona={isKNYTPersona}
              />
            </div>
            {isReadOnlyField(key) ? (
              <ReadOnlyInputWithTooltip 
                value={formatValue(key, value)}
                className="h-7 text-sm"
              />
            ) : Array.isArray(value) ? (
              <Input
                value={value.join(', ')}
                onChange={(e) => handleArrayInputChange(key, e.target.value)}
                className="h-7 text-sm"
              />
            ) : (
              <Input
                value={value as string}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="h-7 text-sm"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="bg-iqube-primary" onClick={onSave}>
          Save Changes
        </Button>
      </div>
    </>
  );
};

export default PrivateDataEditor;
