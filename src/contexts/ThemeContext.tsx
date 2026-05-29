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
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    const saved = localStorage.getItem('tarteela_displayMode');
    return saved !== null ? (saved as DisplayMode) : DisplayMode.ENGLISH_ONLY;
  });
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('tarteela_arabicFontSize');
    return saved !== null ? Number(saved) : 64;
  });
  const [translationFontSize, setTranslationFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('tarteela_translationFontSize');
    return saved !== null ? Number(saved) : 20;
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('tarteela_displayMode', displayMode);
  }, [displayMode]);

  useEffect(() => {
    localStorage.setItem('tarteela_arabicFontSize', String(arabicFontSize));
  }, [arabicFontSize]);

  useEffect(() => {
    localStorage.setItem('tarteela_translationFontSize', String(translationFontSize));
  }, [translationFontSize]);

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
