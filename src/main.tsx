
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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

// Immediately render app
console.log("Starting application render");
const root = createRoot(rootElement || document.getElementById("root")!);
root.render(<App />);

// Handle splash logic after rendering
if (!localStorage.getItem('splashSeen') && window.location.pathname === '/') {
  localStorage.setItem('splashSeen', 'true');
}
