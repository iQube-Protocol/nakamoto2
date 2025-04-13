
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for stored theme preference or use dark as default
    const storedTheme = localStorage.getItem('theme') as Theme;
    return storedTheme || 'dark';
  });

  // Update theme class on the document element when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the previous theme class
    root.classList.remove('dark', 'light');
    // Add the new theme class
    root.classList.add(theme);
    
    // Store the theme preference
    localStorage.setItem('theme', theme);
    
    // Update tooltip styling based on theme
    const tooltipStyle = document.createElement('style');
    tooltipStyle.id = 'tooltip-theme-styles';
    
    if (theme === 'light') {
      tooltipStyle.textContent = `
        [data-radix-popper-content-wrapper] [role="tooltip"] {
          background-color: hsl(var(--popover)) !important;
          color: hsl(var(--popover-foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
      `;
    } else {
      tooltipStyle.textContent = '';
    }
    
    const existingStyle = document.getElementById('tooltip-theme-styles');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    document.head.appendChild(tooltipStyle);
    
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
