
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery, onSearch }: SearchBarProps) => {
  return (
    <form onSubmit={onSearch} className="relative mt-3">
      <Input
        placeholder="Search knowledge base..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pr-10"
      />
      <Button 
        type="submit" 
        variant="ghost" 
        size="icon" 
        className="absolute right-0 top-0"
      >
        <Search size={18} />
      </Button>
    </form>
  );
};

export default SearchBar;
