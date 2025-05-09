
import React from 'react';
import { Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface EncryptionSettingsProps {
  encryptionAlgorithm: string;
  setEncryptionAlgorithm: (value: string) => void;
}

const EncryptionSettings = ({ 
  encryptionAlgorithm, 
  setEncryptionAlgorithm 
}: EncryptionSettingsProps) => {
  return (
    <AccordionItem value="encryption">
      <AccordionTrigger>
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Encryption Settings
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 py-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Algorithm</Label>
            <Select value={encryptionAlgorithm} onValueChange={setEncryptionAlgorithm}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kyber">Kyber (Quantum-resistant)</SelectItem>
                <SelectItem value="ntru">NTRU (Quantum-resistant)</SelectItem>
                <SelectItem value="aes256">AES-256</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="rotate-keys" className="text-xs">Auto-rotate keys</Label>
            <Switch id="rotate-keys" checked={true} />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default EncryptionSettings;
