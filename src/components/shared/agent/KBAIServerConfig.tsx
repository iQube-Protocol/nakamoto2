
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Settings, WifiOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { sonnerToast as toast } from '@/hooks/use-toast';

interface KBAIServerConfigProps {
  onConfigUpdate: (config: KBAIServerSettings) => void;
  currentSettings: KBAIServerSettings;
}

export interface KBAIServerSettings {
  serverUrl: string;
  authToken: string;
  kbToken: string;
}

// Simplified config component for offline mode - no external connections
export const KBAIServerConfig: React.FC<KBAIServerConfigProps> = ({ 
  onConfigUpdate, 
  currentSettings 
}) => {
  return (
    <div className="text-center p-4">
      <WifiOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        MonDAI is running in offline mode with built-in knowledge base.
      </p>
    </div>
  );
};
