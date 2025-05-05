
import { useState, useEffect } from 'react';

type TabType = 'chat' | 'knowledge' | 'documents';

export const useTabManagement = (initialTab: TabType = 'chat') => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  const switchToTab = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  const switchToChatTab = () => {
    setActiveTab('chat');
  };
  
  return {
    activeTab,
    setActiveTab,
    switchToTab,
    switchToChatTab
  };
};
