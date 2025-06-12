
import { UserSettings } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

export function useSettingsData() {
  const { theme } = useTheme();

  // Sample user settings
  const userSettings: UserSettings = {
    connected: {
      linkedin: false,
      luma: false,
      telegram: true,
      twitter: false,
      discord: true,
      wallet: false
    },
    dataSync: true,
    notifications: true,
    theme: theme as 'dark' | 'light',
    language: 'en'
  };

  return {
    userSettings
  };
}
