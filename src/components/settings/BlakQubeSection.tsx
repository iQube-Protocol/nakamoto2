
import React, { useState } from 'react';
import { Accordion } from '@/components/ui/accordion';
import { MetaQube } from '@/lib/types';
import { toast } from 'sonner';
import PrivateDataSection from './blakqube/PrivateDataSection';
import EncryptionSettings from './blakqube/EncryptionSettings';
import AccessControls from './blakqube/AccessControls';

interface PrivateData {
  [key: string]: string | string[];
}

interface BlakQubeSectionProps {
  privateData: PrivateData;
  onUpdatePrivateData: (newData: PrivateData) => void;
  metaQube?: MetaQube;
}

const BlakQubeSection = ({ privateData, onUpdatePrivateData, metaQube }: BlakQubeSectionProps) => {
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState("kyber");
  
  const iQubeType = metaQube?.["iQube-Type"] || "DataQube";
  
  // Check if this is KNYT Persona based on the metaQube identifier
  const isKNYTPersona = metaQube?.["iQube-Identifier"] === "KNYT Persona";
  
  // Get the appropriate title for the blakQube section based on iQube type
  const getBlakQubeTitle = () => {
    switch (iQubeType) {
      case 'DataQube':
        return 'Private Data Fields';
      case 'ContentQube':
        return 'Private Content Fields';
      case 'ToolQube':
        return 'Private Tool Fields';
      case 'ModelQube':
        return 'Private Model Fields';
      case 'AgentQube':
        return 'Private Agent Fields';
      default:
        return `Private ${iQubeType.replace("Qube", "")} Fields`;
    }
  };

  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
        <PrivateDataSection 
          privateData={privateData}
          onUpdatePrivateData={onUpdatePrivateData}
          iQubeType={iQubeType}
          sectionTitle={getBlakQubeTitle()}
          isKNYTPersona={isKNYTPersona}
        />
        
        <EncryptionSettings 
          encryptionAlgorithm={encryptionAlgorithm}
          setEncryptionAlgorithm={setEncryptionAlgorithm}
        />
      </Accordion>
    
      <AccessControls />
    </div>
  );
};

export default BlakQubeSection;
