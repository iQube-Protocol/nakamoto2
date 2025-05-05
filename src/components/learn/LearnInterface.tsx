import React, { useState } from 'react';
import { MetaQube, BlakQube } from '@/lib/types';
import ContentDisplay from './ContentDisplay';
import { defaultCourses } from './CourseList';
import { defaultCertifications } from './CertificationsList';
import { defaultAchievements } from './AchievementsList';
import AgentPanel from './AgentPanel';
import CollapsedSidebar from './CollapsedSidebar';
import TabsNavigation from './TabsNavigation';

interface LearnInterfaceProps {
  metaQube: MetaQube;
  blakQube?: BlakQube;
}

const LearnInterface = ({ metaQube, blakQube }: LearnInterfaceProps) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(true);
  
  const courses = defaultCourses;
  const certifications = defaultCertifications;
  const achievements = defaultAchievements;

  const getCurrentItems = () => {
    switch(activeTab) {
      case 'courses':
        return courses;
      case 'certifications':
        return certifications;
      case 'achievements':
        return achievements;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();
  
  const goToPrev = () => {
    setCurrentItemIndex((prevIndex) => 
      prevIndex === 0 ? currentItems.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentItemIndex((prevIndex) => 
      prevIndex === currentItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleTabClick = (value: string) => {
    // Don't toggle off the tab if it's already active - this helps maintain the Documents tab when a document is added
    if (activeTab !== value) {
      setActiveTab(value);
      setCurrentItemIndex(0);
      setIsPanelCollapsed(false);
    }
  };

  const togglePanelCollapse = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  // New function to handle document added - we'll keep the current tab active
  const handleDocumentAdded = () => {
    // Don't switch tabs, just stay on current tab
    // This ensures we remain on the Documents tab after adding a document
  };

  return (
    <div className={`grid ${isPanelCollapsed ? 'grid-cols-1 lg:grid-cols-[1fr,auto]' : 'grid-cols-1 lg:grid-cols-3'} gap-6 h-full`}>
      <AgentPanel 
        metaQube={metaQube}
        blakQube={blakQube}
        conversationId={conversationId} 
        setConversationId={setConversationId}
        isPanelCollapsed={isPanelCollapsed}
        onDocumentAdded={handleDocumentAdded}
      />

      {isPanelCollapsed ? (
        <CollapsedSidebar 
          activeTab={activeTab} 
          handleTabClick={handleTabClick} 
          togglePanelCollapse={togglePanelCollapse}
        />
      ) : (
        <div className="space-y-6 flex flex-col">
          <div className="flex-grow">
            <ContentDisplay
              activeTab={activeTab}
              currentItemIndex={currentItemIndex}
              courses={courses}
              certifications={certifications}
              achievements={achievements}
              goToPrev={goToPrev}
              goToNext={goToNext}
              onCollapse={togglePanelCollapse}
            />
          </div>
        </div>
      )}

      <div className="lg:col-span-3">
        <TabsNavigation activeTab={activeTab} handleTabClick={handleTabClick} />
      </div>
    </div>
  );
};

export default LearnInterface;
