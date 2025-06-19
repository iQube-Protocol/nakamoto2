
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface DropdownRadioSelectorProps {
  label: string;
  value: string | string[];
  onChange: (value: string) => void;
  options: string[];
  fieldKey: string;
}

const DropdownRadioSelector = ({
  label,
  value,
  onChange,
  options,
  fieldKey
}: DropdownRadioSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Convert value to array for consistent handling
  const selectedValues = Array.isArray(value) 
    ? value 
    : value ? value.split(', ').filter(Boolean) : [];

  const handleSelectionChange = (option: string, checked: boolean) => {
    let newSelection: string[];
    
    if (checked) {
      newSelection = [...selectedValues, option];
    } else {
      newSelection = selectedValues.filter(item => item !== option);
    }
    
    // Convert back to comma-separated string
    onChange(newSelection.join(', '));
  };

  const displayValue = selectedValues.length > 0 
    ? `${selectedValues.length} selected`
    : 'Select episodes/items';

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-white">{label}</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-7 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className="text-sm">{displayValue}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover p-2 shadow-md">
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${fieldKey}-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={(checked) => 
                      handleSelectionChange(option, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`${fieldKey}-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownRadioSelector;
