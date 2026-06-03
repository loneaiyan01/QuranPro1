import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DisplayMode, Theme, FullscreenLayoutMode } from '../types';

interface ThemeContextType {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (size: number) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isFullscreenTranslation: boolean;
  setIsFullscreenTranslation: (active: boolean) => void;
  fullscreenLayoutMode: FullscreenLayoutMode;
  setFullscreenLayoutMode: (mode: FullscreenLayoutMode) => void;
}

export const THEME_VARIABLES: Record<Theme, Record<string, string>> = {
  [Theme.ROSE_GOLD]: {
    '--bg-main': '#191213',
    '--bg-sidebar': '#241B1C',
    '--bg-card-active': '#2D2224',
    '--accent': '#E0A899', // Rose Gold
    '--accent-muted': 'rgba(224, 168, 153, 0.15)',
    '--border': '#352729',
    '--border-active': '#E0A899',
    '--ring': 'rgba(224, 168, 153, 0.3)',
    '--glass-bg': 'rgba(36, 27, 28, 0.65)'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    return DisplayMode.ENGLISH_ONLY;
  });
  
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('tarteela_arabicFontSize');
    return saved !== null ? Number(saved) : 64;
  });
  
  const [translationFontSize, setTranslationFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('tarteela_translationFontSize');
    return saved !== null ? Number(saved) : 20;
  });

  const [theme, setTheme] = useState<Theme>(Theme.ROSE_GOLD);

  const [isFullscreenTranslation, setIsFullscreenTranslation] = useState<boolean>(false);
  const [fullscreenLayoutMode, setFullscreenLayoutMode] = useState<FullscreenLayoutMode>(() => {
    const saved = localStorage.getItem('tarteela_fullscreenLayoutMode');
    return saved !== null ? (saved as FullscreenLayoutMode) : 'single';
  });

  // Persist settings to localStorage on change
  useEffect(() => {
    localStorage.setItem('tarteela_displayMode', displayMode);
  }, [displayMode]);

  useEffect(() => {
    localStorage.setItem('tarteela_arabicFontSize', String(arabicFontSize));
  }, [arabicFontSize]);

  useEffect(() => {
    localStorage.setItem('tarteela_translationFontSize', String(translationFontSize));
  }, [translationFontSize]);

  useEffect(() => {
    localStorage.setItem('tarteela_selected_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tarteela_fullscreenLayoutMode', fullscreenLayoutMode);
  }, [fullscreenLayoutMode]);

  // Listen for browser native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement || 
                                (document as any).webkitFullscreenElement || 
                                (document as any).mozFullScreenElement || 
                                (document as any).msFullscreenElement;
      const isBrowserFullscreen = !!fullscreenElement;
      if (!isBrowserFullscreen && isFullscreenTranslation) {
        setIsFullscreenTranslation(false);
      }
    };

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, [isFullscreenTranslation]);

  // Synchronize internal state with native browser fullscreen
  useEffect(() => {
    const fullscreenElement = document.fullscreenElement || 
                              (document as any).webkitFullscreenElement || 
                              (document as any).mozFullScreenElement || 
                              (document as any).msFullscreenElement;
    if (isFullscreenTranslation) {
      if (!fullscreenElement) {
        const docEl = document.documentElement as any;
        const requestFS = docEl.requestFullscreen || 
                          docEl.webkitRequestFullscreen || 
                          docEl.mozRequestFullScreen || 
                          docEl.msRequestFullscreen;
        if (requestFS) {
          try {
            const p = requestFS.call(docEl);
            if (p && typeof p.catch === 'function') {
              p.catch((err: any) => console.warn('Fullscreen request rejected:', err));
            }
          } catch (err) {
            console.warn('Error requesting fullscreen:', err);
          }
        } else {
          console.info('Native Fullscreen API is not supported on this device/browser.');
        }
      }
    } else {
      if (fullscreenElement) {
        const doc = document as any;
        const exitFS = doc.exitFullscreen || 
                       doc.webkitExitFullscreen || 
                       doc.mozCancelFullScreen || 
                       doc.msExitFullscreen;
        if (exitFS) {
          try {
            const p = exitFS.call(doc);
            if (p && typeof p.catch === 'function') {
              p.catch((err: any) => console.warn('Fullscreen exit rejected:', err));
            }
          } catch (err) {
            console.warn('Error exiting fullscreen:', err);
          }
        }
      }
    }
  }, [isFullscreenTranslation]);

  // Effect: Update document theme classes and CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');

    const variables = THEME_VARIABLES[theme];
    Object.entries(variables).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        displayMode,
        setDisplayMode,
        arabicFontSize,
        setArabicFontSize,
        translationFontSize,
        setTranslationFontSize,
        theme,
        setTheme,
        isFullscreenTranslation,
        setIsFullscreenTranslation,
        fullscreenLayoutMode,
        setFullscreenLayoutMode,
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
