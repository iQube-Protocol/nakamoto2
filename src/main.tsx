
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/pwa.css'
import NavigationGuard from '@/utils/NavigationGuard';

console.log("Starting application initialization");

// Ensure root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found, creating one");
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
}

// Get stored theme or default to dark
const storedTheme = localStorage.getItem('theme');
if (storedTheme) {
  document.documentElement.classList.add(storedTheme);
} else {
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
}

// Handle mobile fullscreen
const enableFullscreen = () => {
  // Handle iOS fullscreen - type assertion to access 'standalone' property
  if ((navigator as any).standalone) {
    document.documentElement.classList.add('standalone');
  }
  
  // Prevent pull-to-refresh
  document.body.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Handle Android Chrome fullscreen
  if (window.matchMedia('(display-mode: standalone)').matches) {
    document.documentElement.classList.add('standalone');
  }
};

// Enable fullscreen when possible
if (typeof window !== 'undefined') {
  enableFullscreen();
  
  // Lock to portrait orientation if possible
  try {
    if ('screen' in window && 'orientation' in window.screen) {
      // Type assertion to access the lock method
      (window.screen.orientation as any).lock('portrait').catch(() => {
        // Silently fail if not supported
      });
    }
  } catch (e) {
    console.warn('Orientation lock not supported');
  }
}

// Initialize NavigationGuard globally
NavigationGuard.init();

// Create root and render immediately
const root = createRoot(rootElement || document.getElementById("root")!);
console.log("Rendering application...");
root.render(<App />);

// Handle splash logic after rendering
if (!localStorage.getItem('splashSeen') && window.location.pathname === '/') {
  localStorage.setItem('splashSeen', 'true');
}

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // The service worker will be automatically registered by vite-plugin-pwa
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ PWA Service Worker registered:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((error) => {
        console.log('❌ PWA Service Worker registration failed:', error);
      });
  });
}

console.log("Application initialization complete");
