
import { BlakQube } from '@/lib/types';

export interface PrivateData {
  [key: string]: string | string[];
}

export interface ConnectionData {
  service: string;
  connection_data: any;
}

export interface LinkedInProfile {
  firstName?: string;
  lastName?: string;
  id?: string;
  publicProfileUrl?: string;
  profileUrl?: string;
  vanityName?: string;
  headline?: string;
  locationName?: string;
  location?: {
    name?: string;
    preferredGeoPlace?: {
      name?: string;
    };
  };
  industryName?: string;
  industry?: string;
  skills?: string[];
}

export interface LinkedInConnectionData {
  profile?: LinkedInProfile;
  email?: string;
}

export interface TokenBalanceData {
  balance: string;
  formatted: string;
  lastUpdated: number;
  transactionHash?: string;
}

export interface WalletConnectionData {
  address?: string;
  signature?: string;
  message?: string;
  signedAt?: string;
  knytTokenBalance?: TokenBalanceData;
}

export interface ThirdWebConnectionData {
  address?: string;
}

export interface TwitterConnectionData {
  profile?: {
    username?: string;
  };
  interests?: string[];
}

export interface SocialConnectionData {
  profile?: {
    username?: string;
    id?: string;
  };
}
