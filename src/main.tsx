
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize the root element first to ensure it exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Failed to find the root element");
  document.body.innerHTML = '<div id="root">Loading application...</div>';
}

// Get stored theme or default to dark
const storedTheme = localStorage.getItem('theme');
if (storedTheme) {
  // Apply the stored theme class to the html element
  document.documentElement.classList.add(storedTheme);
} else {
  // Default to dark theme
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
}

// Initialize the React application immediately to prevent blank screens
console.log("Initializing React application");
createRoot(rootElement ?? document.getElementById("root")!).render(<App />);

// Handle splash page redirect after rendering to prevent issues
try {
  if (!localStorage.getItem('splashSeen') && window.location.pathname === '/') {
    console.log("Setting splash seen flag");
    localStorage.setItem('splashSeen', 'true');
    // Don't redirect, just let the router handle it
  }
} catch (error) {
  console.error("Error handling splash page logic:", error);
}
