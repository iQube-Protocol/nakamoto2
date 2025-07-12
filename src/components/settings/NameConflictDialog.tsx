import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NameConflictData, NamePreferenceService } from '@/services/name-preference-service';
import { useToast } from '@/hooks/use-toast';

interface NameConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictData?: NameConflictData;
  onResolved: () => void;
}

export const NameConflictDialog: React.FC<NameConflictDialogProps> = ({
  open,
  onOpenChange,
  conflictData,
  onResolved,
}) => {
  // Set default option based on persona type
  const getDefaultOption = () => {
    if (conflictData?.personaType === 'qrypto') {
      return 'linkedin'; // Qrypto defaults to LinkedIn
    }
    return 'invitation'; // KNYT defaults to invitation
  };
  
  const [selectedOption, setSelectedOption] = useState<'invitation' | 'linkedin' | 'custom'>(getDefaultOption());
  const [customFirstName, setCustomFirstName] = useState('');
  const [customLastName, setCustomLastName] = useState('');
  const { toast } = useToast();

  const handleSave = async () => {
    if (!conflictData) return;
    
    const preference = {
      persona_type: conflictData.personaType,
      name_source: selectedOption,
      linkedin_first_name: conflictData.linkedinName?.firstName,
      linkedin_last_name: conflictData.linkedinName?.lastName,
      invitation_first_name: conflictData.invitationName?.firstName,
      invitation_last_name: conflictData.invitationName?.lastName,
      ...(selectedOption === 'custom' && {
        custom_first_name: customFirstName,
        custom_last_name: customLastName,
      }),
    };

    const result = await NamePreferenceService.saveNamePreference(preference);
    
    if (result.success) {
      toast({
        title: "Name preference saved",
        description: `Your ${conflictData.personaType.toUpperCase()} profile name has been updated.`,
      });
      onResolved();
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save name preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Don't render dialog content if conflictData is undefined
  if (!conflictData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Name Management</DialogTitle>
          <DialogDescription>
            {conflictData.personaType === 'knyt' 
              ? `Your LinkedIn name differs from your invitation data for your ${conflictData.personaType.toUpperCase()} profile. Choose which name to use.`
              : `Choose the name source for your ${conflictData.personaType.toUpperCase()} profile.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={selectedOption} onValueChange={(value: any) => setSelectedOption(value)}>
            {conflictData.invitationName && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invitation" id="invitation" />
                <Label htmlFor="invitation" className="flex-1">
                  <div className="font-medium">Use invitation name</div>
                  <div className="text-sm text-muted-foreground">
                    {conflictData.invitationName.firstName} {conflictData.invitationName.lastName}
                  </div>
                </Label>
              </div>
            )}

            {conflictData.linkedinName && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="linkedin" id="linkedin" />
                <Label htmlFor="linkedin" className="flex-1">
                  <div className="font-medium">Use LinkedIn name</div>
                  <div className="text-sm text-muted-foreground">
                    {conflictData.linkedinName.firstName} {conflictData.linkedinName.lastName}
                  </div>
                </Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="flex-1">
                <div className="font-medium">Use custom name</div>
                <div className="text-sm text-muted-foreground">Enter your preferred name</div>
              </Label>
            </div>
          </RadioGroup>

          {selectedOption === 'custom' && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label htmlFor="customFirst">First Name</Label>
                <Input
                  id="customFirst"
                  value={customFirstName}
                  onChange={(e) => setCustomFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="customLast">Last Name</Label>
                <Input
                  id="customLast"
                  value={customLastName}
                  onChange={(e) => setCustomLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Preference
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};