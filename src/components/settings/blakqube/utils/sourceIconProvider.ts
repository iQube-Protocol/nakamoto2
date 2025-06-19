
import React from 'react';
import { User, Linkedin, Wallet, Database, Brain, Twitter, Youtube, Facebook } from 'lucide-react';
import { InstagramIcon, TelegramIcon, DiscordIcon, TikTokIcon, MetaKnytsIcon } from '../icons/CustomIcons';

export const getSourceIcon = (key: string, dataSources: { [key: string]: string }, iQubeType: string) => {
  const source = dataSources[key] || 'manual';
  
  switch (iQubeType) {
    case 'AgentQube':
      switch (source) {
        case 'api':
          return React.createElement(Database, { className: "h-4 w-4 text-blue-500" });
        case 'system':
          return React.createElement(Brain, { className: "h-4 w-4 text-purple-500" });
        case 'manual':
        default:
          return React.createElement(User, { className: "h-4 w-4 text-gray-500" });
      }
    case 'ToolQube':
      switch (source) {
        case 'api':
          return React.createElement(Database, { className: "h-4 w-4 text-green-500" });
        case 'system':
          return React.createElement(Brain, { className: "h-4 w-4 text-orange-500" });
        case 'manual':
        default:
          return React.createElement(User, { className: "h-4 w-4 text-gray-500" });
      }
    case 'DataQube':
    default:
      switch (source) {
        case 'linkedin':
          return React.createElement(Linkedin, { className: "h-4 w-4" });
        case 'wallet':
          return React.createElement(Wallet, { className: "h-4 w-4 text-orange-500" });
        case 'twitter':
          return React.createElement(Twitter, { className: "h-4 w-4 text-blue-400" });
        case 'discord':
          return React.createElement(DiscordIcon);
        case 'telegram':
          return React.createElement(TelegramIcon);
        case 'instagram':
          return React.createElement(InstagramIcon);
        case 'luma':
          return React.createElement('svg', {
            viewBox: "0 0 24 24",
            className: "h-4 w-4 text-green-500",
            fill: "currentColor",
            children: React.createElement('path', {
              d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
            })
          });
        case 'youtube':
          return React.createElement(Youtube, { className: "h-4 w-4 text-red-500" });
        case 'facebook':
          return React.createElement(Facebook, { className: "h-4 w-4 text-blue-600" });
        case 'tiktok':
          return React.createElement(TikTokIcon);
        case 'thirdweb':
          return React.createElement(Wallet, { className: "h-4 w-4 text-purple-500" });
        case 'metaknyts':
          return React.createElement(MetaKnytsIcon);
        case 'manual':
        default:
          return React.createElement(User, { className: "h-4 w-4 text-gray-500" });
      }
  }
};
