
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
  useEffect(() => {
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
          // Convert BlakQube data to privateData format
          const formattedData: PrivateData = {
            "Profession": blakQubeData["Profession"] || "",
            "Web3-Interests": blakQubeData["Web3-Interests"] || [],
            "Local-City": blakQubeData["Local-City"] || "",
            "Email": blakQubeData["Email"] || "",
            "EVM-Public-Key": blakQubeData["EVM-Public-Key"] || "",
            "BTC-Public-Key": blakQubeData["BTC-Public-Key"] || "",
            "Tokens-of-Interest": blakQubeData["Tokens-of-Interest"] || [],
            "Chain-IDs": blakQubeData["Chain-IDs"] || [],
            "Wallets-of-Interest": blakQubeData["Wallets-of-Interest"] || []
          };
          setPrivateData(formattedData);
        } else {
          console.log('No BlakQube data found, using defaults');
          // Set default empty data if no BlakQube exists
          setPrivateData({
            "Profession": "",
            "Web3-Interests": [],
            "Local-City": "",
            "Email": user.email || "",
            "EVM-Public-Key": "",
            "BTC-Public-Key": "",
            "Tokens-of-Interest": [],
            "Chain-IDs": [],
            "Wallets-of-Interest": []
          });
        }
      } catch (error) {
        console.error('Error loading BlakQube data:', error);
        // Fallback to empty data
        setPrivateData({
          "Profession": "",
          "Web3-Interests": [],
          "Local-City": "",
          "Email": user?.email || "",
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

    loadBlakQubeData();
  }, [user]);

  const handleUpdatePrivateData = async (newData: PrivateData) => {
    console.log('Updating private data:', newData);
    setPrivateData(newData);
    
    // Here you could also save to the database if needed
    // For now, just update the local state
  };

  return {
    privateData,
    handleUpdatePrivateData,
    loading
  };
};
