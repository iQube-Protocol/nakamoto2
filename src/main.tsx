
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Redirect to splash page by default if user hasn't seen it yet
if (!localStorage.getItem('splashSeen') && window.location.pathname === '/') {
  localStorage.setItem('splashSeen', 'true');
  window.location.href = '/splash';
}

createRoot(document.getElementById("root")!).render(<App />);
