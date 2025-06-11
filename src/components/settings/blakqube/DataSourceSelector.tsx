
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Linkedin, Wallet, Twitter, MessageCircle, MessageSquare, Users, Globe } from 'lucide-react';

interface DataSourceSelectorProps {
  sourceKey: string;
  currentSource: string;
  iQubeType: string;
  onSourceChange: (key: string, value: string) => void;
}

const DataSourceSelector = ({ sourceKey, currentSource, iQubeType, onSourceChange }: DataSourceSelectorProps) => {
  const getAvailableSourcesForField = (key: string, type: string) => {
    // Base sources available for all fields
    const baseSources = [
      { 
        value: 'manual', 
        label: 'Manual Entry',
        icon: <User className="h-3 w-3" />
      }
    ];

    // Define which fields can be populated from which services
    const serviceSourceMap: { [key: string]: string[] } = {
      'First-Name': ['linkedin'],
      'Last-Name': ['linkedin'],
      'Profession': ['linkedin'],
      'Local-City': ['linkedin'],
      'Email': ['linkedin'],
      'LinkedIn-ID': ['linkedin'],
      'LinkedIn-Profile-URL': ['linkedin'],
      'Twitter-Handle': ['twitter'],
      'Telegram-Handle': ['telegram'],
      'Discord-Handle': ['discord'],
      'Instagram-Handle': ['manual'], // Only manual for now
      'GitHub-Handle': ['manual'], // Only manual for now
      'EVM-Public-Key': ['wallet'],
      'BTC-Public-Key': ['wallet'],
      'Chain-IDs': ['wallet'],
      'Wallets-of-Interest': ['wallet'],
      'Web3-Interests': ['linkedin', 'twitter'],
      'Tokens-of-Interest': ['manual'], // Only manual for now
    };

    // Get service sources for this field
    const serviceSources = serviceSourceMap[key] || [];
    
    // Add service sources to base sources
    const allSources = [...baseSources];
    
    serviceSources.forEach(service => {
      switch (service) {
        case 'linkedin':
          allSources.push({ 
            value: 'linkedin', 
            label: 'LinkedIn',
            icon: <Linkedin className="h-3 w-3" />
          });
          break;
        case 'twitter':
          allSources.push({ 
            value: 'twitter', 
            label: 'Twitter',
            icon: <Twitter className="h-3 w-3" />
          });
          break;
        case 'telegram':
          allSources.push({ 
            value: 'telegram', 
            label: 'Telegram',
            icon: <MessageCircle className="h-3 w-3" />
          });
          break;
        case 'discord':
          allSources.push({ 
            value: 'discord', 
            label: 'Discord',
            icon: <Users className="h-3 w-3" />
          });
          break;
        case 'wallet':
          allSources.push({ 
            value: 'wallet', 
            label: 'Wallet',
            icon: <Wallet className="h-3 w-3" />
          });
          break;
      }
    });

    return allSources;
  };

  const availableSources = getAvailableSourcesForField(sourceKey, iQubeType);
  const currentSourceData = availableSources.find(source => source.value === currentSource);

  return (
    <Select value={currentSource} onValueChange={(value) => onSourceChange(sourceKey, value)}>
      <SelectTrigger className="h-6 w-20 text-xs">
        <SelectValue>
          {currentSourceData && (
            <div className="flex items-center gap-1">
              {currentSourceData.icon}
              <span className="hidden sm:inline">{currentSourceData.label.split(' ')[0]}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableSources.map((source) => (
          <SelectItem key={source.value} value={source.value} className="text-xs">
            <div className="flex items-center gap-2">
              {source.icon}
              <span>{source.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DataSourceSelector;
