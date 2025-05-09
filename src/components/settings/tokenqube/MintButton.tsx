
import React from 'react';
import { Button } from '@/components/ui/button';

interface MintButtonProps {
  onMintIQube: () => void;
}

const MintButton = ({ onMintIQube }: MintButtonProps) => {
  return (
    <Button 
      className="w-full bg-gradient-to-r from-iqube-primary to-iqube-accent"
      onClick={onMintIQube}
      size="sm"
    >
      Mint iQube
    </Button>
  );
};

export default MintButton;
