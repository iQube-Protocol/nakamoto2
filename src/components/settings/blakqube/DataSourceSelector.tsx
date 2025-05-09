
import React from 'react';
import { User, Database, Brain, Linkedin, Wallet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface DataSourceSelectorProps {
  sourceKey: string;
  currentSource: string;
  iQubeType: string;
  onSourceChange: (key: string, source: string) => void;
}

const DataSourceSelector = ({ 
  sourceKey, 
  currentSource, 
  iQubeType, 
  onSourceChange 
}: DataSourceSelectorProps) => {
  // Get the appropriate icon based on the source and iQube type
  const getSourceIcon = () => {
    switch (iQubeType) {
      case 'AgentQube':
        switch (currentSource) {
          case 'api':
            return <Database className="h-3 w-3 text-blue-500" />;
          case 'system':
            return <Brain className="h-3 w-3 text-purple-500" />;
          case 'manual':
          default:
            return <User className="h-3 w-3 text-gray-500" />;
        }
      case 'ToolQube':
        switch (currentSource) {
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
        switch (currentSource) {
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

  // Generate dropdown options based on iQube type
  const getDropdownContent = () => {
    switch (iQubeType) {
      case 'AgentQube':
      case 'ToolQube':
        return (
          <>
            <DropdownMenuItem onClick={() => onSourceChange(sourceKey, 'manual')}>
              <User className="h-3.5 w-3.5 mr-2" /> Manual Entry
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSourceChange(sourceKey, 'api')}>
              <Database className="h-3.5 w-3.5 mr-2" /> API Source
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSourceChange(sourceKey, 'system')}>
              <Brain className="h-3.5 w-3.5 mr-2" /> System Generated
            </DropdownMenuItem>
          </>
        );
      case 'DataQube':
      default:
        return (
          <>
            <DropdownMenuItem onClick={() => onSourceChange(sourceKey, 'manual')}>
              <User className="h-3.5 w-3.5 mr-2" /> Manual Entry
            </DropdownMenuItem>
            {['Profession', 'Local-City', 'Email'].includes(sourceKey) && (
              <DropdownMenuItem onClick={() => onSourceChange(sourceKey, 'linkedin')}>
                <Linkedin className="h-3.5 w-3.5 mr-2" /> LinkedIn
              </DropdownMenuItem>
            )}
            {['EVM-Public-Key', 'BTC-Public-Key', 'Chain-IDs', 'Wallets-of-Interest'].includes(sourceKey) && (
              <DropdownMenuItem onClick={() => onSourceChange(sourceKey, 'wallet')}>
                <Wallet className="h-3.5 w-3.5 mr-2" /> Wallet
              </DropdownMenuItem>
            )}
          </>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          {getSourceIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {getDropdownContent()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DataSourceSelector;
