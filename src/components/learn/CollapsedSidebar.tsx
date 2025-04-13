
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Award, Trophy, ChevronLeft } from 'lucide-react';

interface CollapsedSidebarProps {
  activeTab: string | null;
  handleTabClick: (value: string) => void;
  togglePanelCollapse: () => void;
}

const CollapsedSidebar = ({ 
  activeTab, 
  handleTabClick, 
  togglePanelCollapse 
}: CollapsedSidebarProps) => {
  return (
    <div className="flex flex-col items-center space-y-6 border-l pl-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePanelCollapse}
        className="mt-4"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant={activeTab === 'courses' ? 'secondary' : 'ghost'}
        size="icon"
        className={`p-2 ${activeTab === 'courses' ? 'bg-iqube-primary/20' : ''}`}
        onClick={() => handleTabClick('courses')}
        title="Courses"
      >
        <BookOpen className="h-6 w-6" />
      </Button>
      
      <Button
        variant={activeTab === 'certifications' ? 'secondary' : 'ghost'}
        size="icon"
        className={`p-2 ${activeTab === 'certifications' ? 'bg-iqube-primary/20' : ''}`}
        onClick={() => handleTabClick('certifications')}
        title="Certifications"
      >
        <Award className="h-6 w-6" />
      </Button>
      
      <Button
        variant={activeTab === 'achievements' ? 'secondary' : 'ghost'}
        size="icon"
        className={`p-2 ${activeTab === 'achievements' ? 'bg-iqube-primary/20' : ''}`}
        onClick={() => handleTabClick('achievements')}
        title="Achievements"
      >
        <Trophy className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default CollapsedSidebar;
