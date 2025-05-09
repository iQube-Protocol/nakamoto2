
import React, { useEffect } from 'react';
import { MetaQube } from '@/lib/types';
import { toast } from 'sonner';
import { useSidebarState } from '@/hooks/use-sidebar-state';

interface IQubeSelectorProps {
  selectedIQube: MetaQube;
  setSelectedIQube: React.Dispatch<React.SetStateAction<MetaQube>>;
  qubeData: {
    [key: string]: MetaQube;
  };
}

const IQubeSelector = ({ 
  selectedIQube, 
  setSelectedIQube, 
  qubeData 
}: IQubeSelectorProps) => {
  const { selectIQube } = useSidebarState();
  
  // Listen for iQube selection events from sidebar
  useEffect(() => {
    const handleIQubeSelected = (e: CustomEvent) => {
      const iQubeId = e.detail?.iqubeId;
      const shouldSelectTab = e.detail?.selectTab || false;
      console.log("iQube selection event received:", iQubeId, "select tab:", shouldSelectTab);
      
      if (iQubeId === "MonDAI" || iQubeId === "MonDAI iQube") {
        setSelectedIQube(qubeData.monDai);
        selectIQube("MonDAI");
      } else if ((iQubeId === "Metis" || iQubeId === "Metis iQube")) {
        setSelectedIQube(qubeData.metis);
        selectIQube("Metis");
      } else if (iQubeId === "GDrive" || iQubeId === "GDrive iQube") {
        setSelectedIQube(qubeData.gdrive);
        selectIQube("GDrive");
      } else if (iQubeId === "Content" || iQubeId === "Content iQube") {
        setSelectedIQube(qubeData.content);
      } else if (iQubeId === "Model" || iQubeId === "Model iQube") {
        setSelectedIQube(qubeData.model);
      }
      
      // If selectTab is true, select the iQube tab in the settings interface
      if (shouldSelectTab) {
        const tabRef = document.querySelector(`[data-tab="iqube"]`);
        if (tabRef) {
          // @ts-ignore
          tabRef.click();
        }
      }
    };

    // Use type assertion for CustomEvent
    window.addEventListener('iqubeSelected', handleIQubeSelected as EventListener);
    
    return () => {
      window.removeEventListener('iqubeSelected', handleIQubeSelected as EventListener);
    };
  }, [qubeData, setSelectedIQube, selectIQube]);

  return null; // This is a logic-only component, no UI
};

export default IQubeSelector;
