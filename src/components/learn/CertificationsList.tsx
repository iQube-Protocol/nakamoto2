
import React from 'react';
import { Award } from 'lucide-react';

export interface Certification {
  id: number;
  title: string;
  description: string;
  status: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface CertificationsListProps {
  certifications: Certification[];
  currentIndex: number;
}

const CertificationsList = ({ certifications, currentIndex }: CertificationsListProps) => {
  const current = certifications[currentIndex];
  
  return (
    <div className="h-full">
      <div className="p-6 h-full flex flex-col">
        {current.icon}
        <h3 className="font-semibold mb-1 mt-4">{current.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{current.description}</p>
        <div className="text-xs text-muted-foreground mt-auto">
          {current.status}
        </div>
      </div>
    </div>
  );
};

// Default certifications data
export const defaultCertifications = [
  {
    id: 1,
    title: "Web3 Fundamentals",
    description: "Blockchain basics and smart contract fundamentals",
    status: "In progress - 65% complete",
    icon: <Award className="h-12 w-12 text-amber-500" />,
    unlocked: true,
  },
  {
    id: 2,
    title: "iQube Protocol Expert",
    description: "Master the iQube protocol architecture and implementation",
    status: "Locked - Complete prerequisites first",
    icon: <Award className="h-12 w-12 text-gray-300" />,
    unlocked: false,
  },
  {
    id: 3,
    title: "Advanced dApp Development",
    description: "Building complex decentralized applications with advanced features",
    status: "Locked - Complete prerequisites first",
    icon: <Award className="h-12 w-12 text-gray-300" />,
    unlocked: false,
  },
];

export default CertificationsList;
