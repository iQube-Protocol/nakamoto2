
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

// Redirect to splash page by default if user hasn't seen it yet
try {
  if (!localStorage.getItem('splashSeen') && window.location.pathname === '/') {
    localStorage.setItem('splashSeen', 'true');
    window.location.href = '/splash';
  }
} catch (error) {
  console.error("Error handling splash page redirect:", error);
}

// Initialize the React application
try {
  console.log("Initializing React application");
  createRoot(rootElement ?? document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error("Failed to render the application:", error);
  if (rootElement) {
    rootElement.innerHTML = '<div class="error">Failed to load application. Please refresh the page.</div>';
  }
}
