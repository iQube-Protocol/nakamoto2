
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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
if (!localStorage.getItem('splashSeen') && window.location.pathname === '/') {
  localStorage.setItem('splashSeen', 'true');
  window.location.href = '/splash';
}

createRoot(document.getElementById("root")!).render(<App />);
