import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DisplayMode } from '../types';

interface ThemeContextType {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.ENGLISH_ONLY);
  const [arabicFontSize, setArabicFontSize] = useState<number>(64);
  const [translationFontSize, setTranslationFontSize] = useState<number>(20);

  // Effect: Update document theme classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
  }, []);

  return (
    <ThemeContext.Provider
      value={{
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
