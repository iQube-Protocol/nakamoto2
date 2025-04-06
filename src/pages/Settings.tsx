
import React from 'react';
import SettingsInterface from '@/components/settings/SettingsInterface';
import { UserSettings, MetaQube } from '@/lib/types';

// Sample metaQube data
const metaQubeData: MetaQube = {
  "iQube-Identifier": "MonDAI iQube",
  "iQube-Type": "DataQube",
  "iQube-Designer": "Aigent MonDAI",
  "iQube-Use": "For learning, earning and networking in web3 communities",
  "Owner-Type": "Person",
  "Owner-Identifiability": "Semi-Identifiable",
  "Date-Minted": new Date().toISOString(),
  "Related-iQubes": ["ContentQube1", "AgentQube1"],
  "X-of-Y": "5 of 20",
  "Sensitivity-Score": 4,
  "Verifiability-Score": 5,
  "Accuracy-Score": 5,
  "Risk-Score": 4
};

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
  theme: 'dark',
  language: 'en'
};

const Settings = () => {
  return (
    <div className="container p-2">
      <div className="flex flex-col md:flex-row justify-between items-center mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <SettingsInterface userSettings={userSettings} metaQube={metaQubeData} />
    </div>
  );
};

export default Settings;
