
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabsNavigationProps {
  activeTab: string | null;
  handleTabClick: (value: string) => void;
}

const TabsNavigation = ({ activeTab, handleTabClick }: TabsNavigationProps) => {
  return (
    <Tabs value={activeTab || ''}>
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger 
          value="courses" 
          onClick={() => handleTabClick('courses')}
          data-state={activeTab === 'courses' ? 'active' : ''}
        >
          Courses
        </TabsTrigger>
        <TabsTrigger 
          value="certifications" 
          onClick={() => handleTabClick('certifications')}
          data-state={activeTab === 'certifications' ? 'active' : ''}
        >
          Certifications
        </TabsTrigger>
        <TabsTrigger 
          value="achievements" 
          onClick={() => handleTabClick('achievements')}
          data-state={activeTab === 'achievements' ? 'active' : ''}
        >
          Achievements
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TabsNavigation;
