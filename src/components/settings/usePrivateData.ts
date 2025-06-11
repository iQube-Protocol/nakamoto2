
import { useState, useEffect } from 'react';
import { MetaQube } from '@/lib/types';
import { blakQubeService } from '@/services/blakqube-service';
import { useAuth } from '@/hooks/use-auth';

interface PrivateData {
  [key: string]: string | string[];
}

export const usePrivateData = (selectedIQube: MetaQube) => {
  const { user } = useAuth();
  const [privateData, setPrivateData] = useState<PrivateData>({});
  const [loading, setLoading] = useState(true);

  // Load real BlakQube data from database
  const loadBlakQubeData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading BlakQube data...');
      const blakQubeData = await blakQubeService.getBlakQubeData();
      
      if (blakQubeData) {
        console.log('BlakQube data loaded:', blakQubeData);
        // Convert BlakQube data to privateData format - First-Name and Last-Name FIRST, then the rest
        const formattedData: PrivateData = {
          "First-Name": blakQubeData["First-Name"] || "",
          "Last-Name": blakQubeData["Last-Name"] || "",
          "Profession": blakQubeData["Profession"] || "",
          "Local-City": blakQubeData["Local-City"] || "",
          "Email": blakQubeData["Email"] || "",
          "LinkedIn-ID": blakQubeData["LinkedIn-ID"] || "",
          "LinkedIn-Profile-URL": blakQubeData["LinkedIn-Profile-URL"] || "",
          "Twitter-Handle": blakQubeData["Twitter-Handle"] || "",
          "Telegram-Handle": blakQubeData["Telegram-Handle"] || "",
          "Discord-Handle": blakQubeData["Discord-Handle"] || "",
          "Instagram-Handle": blakQubeData["Instagram-Handle"] || "",
          "GitHub-Handle": blakQubeData["GitHub-Handle"] || "",
          "Web3-Interests": blakQubeData["Web3-Interests"] || [],
          "EVM-Public-Key": blakQubeData["EVM-Public-Key"] || "",
          "BTC-Public-Key": blakQubeData["BTC-Public-Key"] || "",
          "Tokens-of-Interest": blakQubeData["Tokens-of-Interest"] || [],
          "Chain-IDs": blakQubeData["Chain-IDs"] || [],
          "Wallets-of-Interest": blakQubeData["Wallets-of-Interest"] || []
        };
        setPrivateData(formattedData);
      } else {
        console.log('No BlakQube data found, using defaults');
        // Set default empty data if no BlakQube exists - First-Name and Last-Name FIRST
        setPrivateData({
          "First-Name": "",
          "Last-Name": "",
          "Profession": "",
          "Local-City": "",
          "Email": user.email || "",
          "LinkedIn-ID": "",
          "LinkedIn-Profile-URL": "",
          "Twitter-Handle": "",
          "Telegram-Handle": "",
          "Discord-Handle": "",
          "Instagram-Handle": "",
          "GitHub-Handle": "",
          "Web3-Interests": [],
          "EVM-Public-Key": "",
          "BTC-Public-Key": "",
          "Tokens-of-Interest": [],
          "Chain-IDs": [],
          "Wallets-of-Interest": []
        });
      }
    } catch (error) {
      console.error('Error loading BlakQube data:', error);
      // Fallback to empty data with First-Name and Last-Name FIRST
      setPrivateData({
        "First-Name": "",
        "Last-Name": "",
        "Profession": "",
        "Local-City": "",
        "Email": user?.email || "",
        "LinkedIn-ID": "",
        "LinkedIn-Profile-URL": "",
        "Twitter-Handle": "",
        "Telegram-Handle": "",
        "Discord-Handle": "",
        "Instagram-Handle": "",
        "GitHub-Handle": "",
        "Web3-Interests": [],
        "EVM-Public-Key": "",
        "BTC-Public-Key": "",
        "Tokens-of-Interest": [],
        "Chain-IDs": [],
        "Wallets-of-Interest": []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlakQubeData();
  }, [user]);

  // Listen for private data updates from wallet connections
  useEffect(() => {
    const handlePrivateDataUpdate = () => {
      console.log('Private data update event received, reloading BlakQube data...');
      loadBlakQubeData();
    };

    window.addEventListener('privateDataUpdated', handlePrivateDataUpdate);
    
    return () => {
      window.removeEventListener('privateDataUpdated', handlePrivateDataUpdate);
    };
  }, [user]);

  const handleUpdatePrivateData = async (newData: PrivateData) => {
    console.log('Updating private data:', newData);
    setPrivateData(newData);
    
    // Save to database using BlakQube service
    try {
      // For now, just update local state. In a real implementation, you'd save to database
      console.log('Private data updated locally');
    } catch (error) {
      console.error('Error saving private data:', error);
    }
  };

  return {
    privateData,
    handleUpdatePrivateData,
    loading,
    refreshData: loadBlakQubeData
  };
};
