import React from 'react';
import { Ayah, DisplayMode, Surah } from '../types';

interface VerseDisplayProps {
  arabicVerse?: Ayah;
  englishVerse?: Ayah;
  displayMode: DisplayMode;
  isLoading: boolean;
  currentSurah?: Surah | null;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({ 
  arabicVerse, 
  englishVerse, 
  displayMode,
  isLoading,
  currentSurah
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!arabicVerse || !currentSurah) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
        <p className="text-xl font-serif">Select a Surah to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto min-h-0">
      <div className="w-full max-w-4xl mx-auto space-y-12 text-center animate-fadeIn">
        
        {/* Header Info */}
        <div className="space-y-2 opacity-60">
          <h2 className="text-sm uppercase tracking-widest font-medium">
            {currentSurah.englishName} • Verse {arabicVerse.numberInSurah}
          </h2>
        </div>

        {/* Arabic Text */}
        {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ARABIC_ONLY) && (
          <div className="relative">
            <p className="font-amiri text-4xl md:text-6xl leading-[1.8] md:leading-[1.8] text-emerald-950 dark:text-emerald-50 dir-rtl" style={{ direction: 'rtl' }}>
              {arabicVerse.text}
            </p>
            {/* Basmalah placeholder logic could go here if beginning of Surah */}
          </div>
        )}

        {/* Divider if both */}
        {displayMode === DisplayMode.BOTH && (
          <div className="w-16 h-px bg-emerald-200 dark:bg-emerald-800 mx-auto"></div>
        )}

        {/* English Text */}
        {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ENGLISH_ONLY) && englishVerse && (
          <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-2xl font-light leading-relaxed text-gray-700 dark:text-emerald-100/90">
              {englishVerse.text}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerseDisplay;
