
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      { value: 'manual', label: 'Manual Entry' }
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
          allSources.push({ value: 'linkedin', label: 'LinkedIn' });
          break;
        case 'twitter':
          allSources.push({ value: 'twitter', label: 'Twitter' });
          break;
        case 'telegram':
          allSources.push({ value: 'telegram', label: 'Telegram' });
          break;
        case 'discord':
          allSources.push({ value: 'discord', label: 'Discord' });
          break;
        case 'wallet':
          allSources.push({ value: 'wallet', label: 'Wallet' });
          break;
      }
    });

    return allSources;
  };

  const availableSources = getAvailableSourcesForField(sourceKey, iQubeType);

  return (
    <Select value={currentSource} onValueChange={(value) => onSourceChange(sourceKey, value)}>
      <SelectTrigger className="h-6 w-20 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableSources.map((source) => (
          <SelectItem key={source.value} value={source.value} className="text-xs">
            {source.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DataSourceSelector;
