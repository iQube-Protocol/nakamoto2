
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Shield, Sun, Moon } from 'lucide-react';
import { UserSettings } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';


interface PreferencesTabProps {
  settings: UserSettings;
  onSaveSettings: () => void;
}

const PreferencesTab = ({ settings, onSaveSettings }: PreferencesTabProps) => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleThemeChange = (value: string) => {
    if (value === 'dark' || value === 'light') {
      setTheme(value);
      toast({
        title: "Theme Changed",
        description: `Theme set to ${value} mode`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Application Preferences</CardTitle>
        <CardDescription>
          Control your app experience and notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Interface Settings</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs flex items-center">
                  Theme
                  {theme === 'dark' ? (
                    <Moon className="h-3.5 w-3.5 ml-1 text-iqube-secondary" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 ml-1 text-amber-500" />
                  )}
                </Label>
                <Select 
                  defaultValue={settings.theme} 
                  value={theme} 
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger className="h-8 text-xs w-24">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Language</Label>
                <Select defaultValue={settings.language}>
                  <SelectTrigger className="h-8 text-xs w-24">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              <Bell className="h-4 w-4 mr-2" /> Notifications
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Email Notifications</Label>
                <Switch checked={settings.notifications} />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Push Notifications</Label>
                <Switch checked={settings.notifications} />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-xs">Connection Requests</Label>
                <Switch checked={true} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center">
            <Shield className="h-4 w-4 mr-2" /> Privacy Settings
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Share Learning Progress</Label>
              <Switch checked={true} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Token Holdings</Label>
              <Switch checked={false} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Public Profile</Label>
              <Switch checked={true} />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs">Anonymous Mode</Label>
              <Switch checked={false} />
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <Button onClick={onSaveSettings} className="bg-iqube-primary hover:bg-iqube-primary/90" size="sm">
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default PreferencesTab;
