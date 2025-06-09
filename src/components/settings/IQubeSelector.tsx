
import React, { useEffect } from 'react';
import { MetaQube } from '@/lib/types';

interface IQubeSelectorProps {
  selectedIQube: MetaQube;
  setSelectedIQube: React.Dispatch<React.SetStateAction<MetaQube>>;
  qubeData: { [key: string]: MetaQube };
}

const IQubeSelector = ({ selectedIQube, setSelectedIQube, qubeData }: IQubeSelectorProps) => {
  // Listen for iQube selection events from sidebar
  useEffect(() => {
    const handleIQubeSelected = (e: CustomEvent) => {
      const { iqubeId } = e.detail || {};
      console.log('iQube selection event received:', iqubeId, 'select tab:', e.detail?.selectTab);
      
      if (iqubeId && qubeData[iqubeId]) {
        console.log('Setting selected iQube to:', iqubeId);
        setSelectedIQube(qubeData[iqubeId]);
      } else {
        console.warn('iQube data not found for:', iqubeId, 'Available keys:', Object.keys(qubeData));
        // Fallback to default (Qrypto Persona) if the requested iQube is not found
        if (qubeData["Qrypto Persona"]) {
          console.log('Falling back to Qrypto Persona');
          setSelectedIQube(qubeData["Qrypto Persona"]);
        }
      }
    };
    
    window.addEventListener('iqubeSelected', handleIQubeSelected as EventListener);
    
    return () => {
      window.removeEventListener('iqubeSelected', handleIQubeSelected as EventListener);
    };
  }, [setSelectedIQube, qubeData]);

  return null; // This is a logic-only component, no UI
};

export default IQubeSelector;
