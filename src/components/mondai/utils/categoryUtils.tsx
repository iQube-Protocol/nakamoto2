
import { BookOpen, Users, Lightbulb, Coins } from 'lucide-react';

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tokenomics':
    case 'economics':
      return <Coins className="h-4 w-4" />;
    case 'characters':
      return <Users className="h-4 w-4" />;
    case 'technology':
    case 'technical':
      return <Lightbulb className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'tokenomics':
    case 'economics':
      return 'bg-green-100/70 text-green-800 border-green-300/70';
    case 'characters':
      return 'bg-purple-100/70 text-purple-800 border-purple-300/70';
    case 'technology':
    case 'technical':
      return 'bg-blue-100/70 text-blue-800 border-blue-300/70';
    case 'worldbuilding':
      return 'bg-orange-100/70 text-orange-800 border-orange-300/70';
    case 'philosophy':
      return 'bg-indigo-100/70 text-indigo-800 border-indigo-300/70';
    case 'narrative':
      return 'bg-pink-100/70 text-pink-800 border-pink-300/70';
    case 'education':
      return 'bg-yellow-100/70 text-yellow-800 border-yellow-300/70';
    default:
      return 'bg-gray-100/70 text-gray-800 border-gray-300/70';
  }
};
