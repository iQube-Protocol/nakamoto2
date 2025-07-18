
/**
 * Browser detection utilities for handling browser-specific compatibility issues
 */

export interface BrowserInfo {
  name: string;
  isBrave: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  version?: string;
}

export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  const isBrave = !!(navigator as any).brave && typeof (navigator as any).brave.isBrave === 'function';
  
  return {
    name: isBrave ? 'Brave' : 
          userAgent.includes('Chrome') ? 'Chrome' :
          userAgent.includes('Firefox') ? 'Firefox' :
          userAgent.includes('Safari') ? 'Safari' : 'Unknown',
    isBrave,
    isChrome: userAgent.includes('Chrome') && !isBrave,
    isFirefox: userAgent.includes('Firefox'),
    isSafari: userAgent.includes('Safari') && !userAgent.includes('Chrome'),
  };
};

export const getBraveCompatibilityInstructions = (): string[] => [
  "Click the Brave Shield icon (🛡️) in the address bar",
  "Toggle 'Shields' to OFF for this site",
  "Refresh the page and try signing in again",
  "Alternatively, disable 'Block cookies' in Brave Shield settings"
];

export const shouldShowBraveWarning = (): boolean => {
  return detectBrowser().isBrave;
};
