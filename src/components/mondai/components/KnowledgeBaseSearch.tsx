
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface KnowledgeBaseSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const KnowledgeBaseSearch = ({ 
  searchTerm, 
  onSearchChange
}: KnowledgeBaseSearchProps) => {
  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Search iQubes and COYN knowledge bases..." 
          value={searchTerm} 
          onChange={e => onSearchChange(e.target.value)} 
          className="pl-10" 
        />
      </div>
    </div>
  );
};

export default KnowledgeBaseSearch;
