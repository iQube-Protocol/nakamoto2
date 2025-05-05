
// Type definitions for Google APIs
interface Window {
  google?: {
    accounts?: {
      oauth2?: {
        revoke: (token: string | undefined, callback: () => void) => void;
        initTokenClient: (config: any) => any;
      };
    };
  };
  gapi?: {
    auth?: {
      setToken: (token: any) => void;
      getToken: () => { access_token: string };
    };
    client?: {
      init: (config: any) => Promise<void>;
      drive?: {
        files?: {
          list: (params: any) => Promise<any>;
          get: (params: any) => Promise<any>;
          export: (params: any) => Promise<any>;
        };
      };
    };
    load: (api: string, callback: () => void) => void;
  };
}
