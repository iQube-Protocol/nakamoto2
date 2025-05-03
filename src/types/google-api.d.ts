
// Type definitions for Google APIs on window object
interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize?: (config: any) => void;
        renderButton?: (element: HTMLElement, config: any) => void;
        prompt?: (config?: any) => void;
        disableAutoSelect?: () => void;
        cancel?: () => void;
      };
      oauth2?: {
        initTokenClient?: (config: any) => any;
        revoke?: (token: string, callback?: () => void) => void;
      };
    };
  };
  gapi?: {
    load?: (api: string, callback: () => void) => void;
    client?: {
      init?: (config: any) => Promise<void>;
      setToken?: (token: any) => void;
      getToken?: () => any;
      drive?: {
        files?: {
          list?: (config: any) => Promise<any>;
        };
        about?: {
          get?: (config: any) => Promise<any>;
        };
      };
    };
    auth2?: {
      getAuthInstance?: () => {
        signOut?: () => Promise<any>;
      };
    };
  };
}
