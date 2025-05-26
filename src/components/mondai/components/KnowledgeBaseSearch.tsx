
import React from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface KnowledgeBaseSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  bothTabCount: number;
  qryptoCount: number;
  metaKnytsCount: number;
}

const KnowledgeBaseSearch = ({ 
  searchTerm, 
  onSearchChange, 
  activeTab, 
  onTabChange,
  bothTabCount,
  qryptoCount,
  metaKnytsCount
}: KnowledgeBaseSearchProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search both knowledge bases..." 
            value={searchTerm} 
            onChange={e => onSearchChange(e.target.value)} 
            className="pl-10" 
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
        <TabsList className="mx-4 mt-4 grid w-full grid-cols-3">
          <TabsTrigger value="both">Both ({bothTabCount})</TabsTrigger>
          <TabsTrigger value="qrypto">{isMobile ? 'COYN' : 'QryptoCOYN'} ({qryptoCount})</TabsTrigger>
          <TabsTrigger value="metaknyts">{isMobile ? 'KNYT' : 'mẹtaKnyts'} ({metaKnytsCount})</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};

export default KnowledgeBaseSearch;
