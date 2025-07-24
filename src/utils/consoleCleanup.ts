// Console cleanup utility to reduce noise in production
class ConsoleManager {
  private originalConsole: Console;
  private isProduction: boolean;

  constructor() {
    this.originalConsole = { ...console };
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  init() {
    if (this.isProduction) {
      // In production, only show errors and warnings
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
    } else {
      // In development, filter out spammy logs
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        const message = args.join(' ');
        
        // Filter out repetitive auth checks
        if (message.includes('Loading MonDAI conversation history') ||
            message.includes('Fetching interactions for user') ||
            message.includes('Found 0 interactions') ||
            message.includes('No user found, skipping fetch')) {
          return; // Skip these logs
        }
        
        originalLog.apply(console, args);
      };
    }
  }

  restore() {
    Object.assign(console, this.originalConsole);
  }
}

export const consoleManager = new ConsoleManager();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  consoleManager.init();
}