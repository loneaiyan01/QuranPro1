import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, DisplayMode } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.ENGLISH_ONLY);
  const [arabicFontSize, setArabicFontSize] = useState<number>(64);
  const [translationFontSize, setTranslationFontSize] = useState<number>(20);

  // Effect: Update document theme classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-apple');

    if (theme === Theme.DARK) {
      root.classList.add('dark');
    } else if (theme === Theme.DARK_APPLE) {
      root.classList.add('theme-apple');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        displayMode,
        setDisplayMode,
        arabicFontSize,
        setArabicFontSize,
        translationFontSize,
        setTranslationFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
