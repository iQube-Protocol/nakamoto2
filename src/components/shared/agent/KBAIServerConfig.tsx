
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Settings, WifiOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { getKBAIDirectService } from '@/integrations/kbai/KBAIDirectService';

interface KBAIServerConfigProps {
  onConfigUpdate: (config: KBAIServerSettings) => void;
  currentSettings: KBAIServerSettings;
}

export interface KBAIServerSettings {
  serverUrl: string;
  authToken: string;
  kbToken: string;
}

export const KBAIServerConfig: React.FC<KBAIServerConfigProps> = ({ 
  onConfigUpdate, 
  currentSettings 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const form = useForm<KBAIServerSettings>({
    defaultValues: {
      serverUrl: currentSettings.serverUrl || 'https://api.kbai.org/MCP/sse',
      authToken: currentSettings.authToken || '',
      kbToken: currentSettings.kbToken || ''
    }
  });

  const handleSubmit = async (values: KBAIServerSettings) => {
    try {
      // Save settings to local storage
      localStorage.setItem('kbai_server_url', values.serverUrl);
      localStorage.setItem('kbai_auth_token', values.authToken);
      localStorage.setItem('kbai_kb_token', values.kbToken);

      // Update settings in the app
      onConfigUpdate(values);

      // Reset the KBAI Direct Service to use new settings
      const kbaiService = getKBAIDirectService();
      kbaiService.updateServerConfig(values);

      toast.success('KBAI server settings updated', {
        description: 'New connection settings will be used for future requests.'
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save KBAI server settings:', error);
      toast.error('Failed to save settings', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const testConnection = async () => {
    const values = form.getValues();
    setIsTesting(true);

    try {
      // Get service and update config temporarily
      const kbaiService = getKBAIDirectService();
      kbaiService.updateServerConfig({
        serverUrl: values.serverUrl,
        authToken: values.authToken,
        kbToken: values.kbToken
      });

      const isHealthy = await kbaiService.checkApiHealth(true);
      
      if (isHealthy) {
        toast.success('Connection successful!', {
          description: 'KBAI server is reachable with these settings.'
        });
      } else {
        toast.error('Connection test failed', {
          description: 'Could not connect to KBAI server with these settings.'
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Connection test failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      serverUrl: 'https://api.kbai.org/MCP/sse',
      authToken: '85abed95769d4b2ea1cb6bfaa8a67193',
      kbToken: 'KB00000001_CRPTMONDS'
    };

    form.reset(defaultSettings);
    toast.info('Default settings loaded', {
      description: 'Click Save to apply these settings.'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings size={16} />
          Configure KBAI Server
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>KBAI Server Configuration</DialogTitle>
          <DialogDescription>
            Update the connection settings for the Knowledge Base AI service.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="serverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.kbai.org/MCP/sse" {...field} />
                  </FormControl>
                  <FormDescription>
                    The KBAI MCP server endpoint URL
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="authToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Token</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter authentication token" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your KBAI authentication token
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="kbToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Knowledge Base Token</FormLabel>
                  <FormControl>
                    <Input placeholder="KB00000001_CRPTMONDS" {...field} />
                  </FormControl>
                  <FormDescription>
                    The identifier for your knowledge base
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={testConnection} 
                disabled={isTesting}
                className="w-full"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={resetToDefaults}
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
