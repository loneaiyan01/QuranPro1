import React, { useState, useEffect, useRef, useCallback } from 'react';
import { KfgqpcPageData, KfgqpcWord, KfgqpcLine } from '../types';
import { fetchKfgqpcPage } from '../services/api';
import { toArabicNumerals, ARABIC_JUZ_NAMES, getJuzForPage, SURAH_META } from '../utils/mushafData';
import { ChevronLeft, ChevronRight, Sun, Moon, Volume2 } from 'lucide-react';

interface MushafPageViewProps {
  pageNumber: number;
  onPageChange: (newPage: number) => void;
  activeVerseKey: string | null; // e.g. "1:1", "18:2"
  isPlaying: boolean;
  onPlayVerseKey: (verseKey: string) => void;
  onActiveTranslationChange?: (translation: string, verseKey: string) => void;
  isMobile: boolean;
  pageTheme?: 'cream' | 'dark';
  onTogglePageTheme?: () => void;
}

export const MushafPageView: React.FC<MushafPageViewProps> = ({
  pageNumber,
  onPageChange,
  activeVerseKey,
  isPlaying,
  onPlayVerseKey,
  onActiveTranslationChange,
  isMobile,
  pageTheme = 'cream',
  onTogglePageTheme
}) => {
  const [pageData, setPageData] = useState<KfgqpcPageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Load KFGQPC V2 Page Data
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    fetchKfgqpcPage(pageNumber)
      .then((data) => {
        if (!isCurrent) return;
        if (data && data.lines.length > 0) {
          setPageData(data);

          // Update active translation for the current verse or first verse on page
          if (onActiveTranslationChange && data.verses.length > 0) {
            const currentVerse = data.verses.find(v => v.verseKey === activeVerseKey);
            const target = currentVerse || data.verses[0];
            onActiveTranslationChange(target.translation, target.verseKey);
          }
        } else {
          setError('Failed to load page data.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError('Connection error loading King Fahd Mushaf page.');
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [pageNumber]);

  // Update translation when active verse changes
  useEffect(() => {
    if (pageData && activeVerseKey && onActiveTranslationChange) {
      const match = pageData.verses.find(v => v.verseKey === activeVerseKey);
      if (match) {
        onActiveTranslationChange(match.translation, match.verseKey);
      }
    }
  }, [activeVerseKey, pageData, onActiveTranslationChange]);

  // Smooth scroll active verse into view
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeVerseKey]);

  // Navigation Handlers (Physical Mushaf flips left for next page)
  const handleNextPage = useCallback(() => {
    if (pageNumber < 604) onPageChange(pageNumber + 1);
  }, [pageNumber, onPageChange]);

  const handlePrevPage = useCallback(() => {
    if (pageNumber > 1) onPageChange(pageNumber - 1);
  }, [pageNumber, onPageChange]);

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      handleNextPage();
    } else if (distance < -50) {
      handlePrevPage();
    }
    setTouchStartX(null);
  };

  const isCream = pageTheme === 'cream';
  const primarySurah = SURAH_META[pageData?.primarySurahNumber || 1];
  const primaryJuzNumber = pageData?.juzNumber || getJuzForPage(pageNumber);
  const arabicJuzName = ARABIC_JUZ_NAMES[primaryJuzNumber - 1] || `الجزء ${toArabicNumerals(primaryJuzNumber)}`;

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center select-none py-2 transition-all duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* =====================================================================
          KING FAHD GLORIOUS QURAN PRINTING COMPLEX (KFGQPC V2) MUSHAF PAGE
         ===================================================================== */}
      <div
        className={`w-full max-w-[780px] rounded-2xl shadow-2xl transition-all duration-200 border-2 relative overflow-hidden ${
          isCream
            ? 'bg-[#FCFBF7] text-[#141210] border-[#C5A059]/40 shadow-[0_20px_50px_rgba(0,0,0,0.35)]'
            : 'bg-[#0E0F13] text-[#EDE8DF] border-[#C5A059]/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Outer Ornate King Fahd Gold & Teal Border Frame */}
        <div
          className={`m-2 sm:m-4 md:m-5 p-2 sm:p-4 md:p-6 rounded-xl border-2 relative ${
            isCream
              ? 'border-[#C5A059] bg-[#FAF7EE]'
              : 'border-[#C5A059]/60 bg-[#121318]'
          }`}
          style={{
            boxShadow: isCream
              ? 'inset 0 0 15px rgba(197, 160, 89, 0.12)'
              : 'inset 0 0 20px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Classical Arabesque Corner Ornaments */}
          <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#C5A059] pointer-events-none" />
          <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#C5A059] pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#C5A059] pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#C5A059] pointer-events-none" />

          {/* ===================================================================
              TOP PAGE HEADER (Surah Name Right • Page/Hizb Center • Juz Left)
             =================================================================== */}
          <header className="flex items-center justify-between pb-2 mb-2 sm:mb-3 border-b border-[#C5A059]/30 text-xs sm:text-sm font-semibold select-none">
            {/* Left: Juz in Arabic */}
            <div className="text-right flex items-center gap-1.5">
              <span
                className={`font-quran text-sm sm:text-base font-bold ${
                  isCream ? 'text-[#1B3B48]' : 'text-amber-400'
                }`}
                dir="rtl"
              >
                {arabicJuzName}
              </span>
            </div>

            {/* Center: Mushaf Info & Theme Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono tabular-nums opacity-60">
                مصحف المدينة النبوية • {pageNumber}
              </span>
              {onTogglePageTheme && (
                <button
                  onClick={onTogglePageTheme}
                  className={`p-1 rounded-full transition-colors border ${
                    isCream
                      ? 'bg-amber-100/70 border-amber-300 text-amber-900 hover:bg-amber-200'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                  title={isCream ? 'Switch to Night Mode' : 'Switch to Original Cream Parchment'}
                >
                  {isCream ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3 text-amber-300" />}
                </button>
              )}
            </div>

            {/* Right: Surah Name in Arabic */}
            <div className="text-left flex items-center gap-1.5">
              <span
                className={`font-quran text-sm sm:text-base font-bold ${
                  isCream ? 'text-[#1B3B48]' : 'text-amber-400'
                }`}
                dir="rtl"
              >
                {primarySurah?.name || ''}
              </span>
            </div>
          </header>

          {/* Loading Shimmer State */}
          {isLoading && (
            <div className="py-24 space-y-4 animate-in fade-in duration-200">
              <div className="h-10 skeleton-shimmer rounded-xl w-3/4 mx-auto mb-6" />
              {[...Array(13)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 skeleton-shimmer rounded-lg mx-auto"
                  style={{ width: `${92 - (i % 4) * 4}%` }}
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="py-24 text-center space-y-3">
              <p className="text-red-400 text-xs">{error}</p>
              <button
                onClick={() => onPageChange(pageNumber)}
                className="px-4 py-1.5 bg-[#C5A059] text-white rounded-lg text-xs font-semibold"
              >
                Retry Loading
              </button>
            </div>
          )}

          {/* ===================================================================
              THE EXACT 15-LINE KING FAHD COMPLEX (KFGQPC V2) MUSHAF LAYOUT
             =================================================================== */}
          {!isLoading && pageData && (
            <div
              className="flex flex-col justify-between w-full select-none"
              dir="rtl"
              style={{
                fontFamily: 'KFGQPC_V2, Uthmani_Hafs, serif',
                minHeight: isMobile ? '480px' : '580px'
              }}
            >
              {pageData.lines.map((line: KfgqpcLine) => {
                // 1. Surah Opening Header Cartouche Banner
                if (line.type === 'surah_header') {
                  const s = SURAH_META[line.surahNumber || 1];
                  return (
                    <div
                      key={`line-${line.lineNumber}`}
                      className="my-1 sm:my-1.5 text-center select-none w-full flex items-center justify-center"
                    >
                      <div
                        className={`w-full py-1.5 sm:py-2 px-4 rounded-xl border-2 flex items-center justify-between shadow-sm relative overflow-hidden ${
                          isCream
                            ? 'bg-[#EFE8D6] border-[#C5A059] text-[#1B3B48]'
                            : 'bg-[#181B22] border-[#C5A059]/70 text-amber-300'
                        }`}
                      >
                        {/* Right: Ayahs count */}
                        <div className="text-[10px] sm:text-xs font-quran font-bold opacity-80 tabular-nums">
                          {toArabicNumerals(s?.numberOfAyahs || line.numberOfAyahs || 0)} آيَاتُهَا
                        </div>

                        {/* Center: Surah Title */}
                        <div className="text-base sm:text-xl font-bold font-quran drop-shadow-xs">
                          {s?.name || line.surahName || ''}
                        </div>

                        {/* Left: Makkiyyah / Madaniyyah */}
                        <div className="text-[10px] sm:text-xs font-quran font-bold opacity-80">
                          {s?.revelationType === 'Meccan' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}
                        </div>
                      </div>
                    </div>
                  );
                }

                // 2. Calligraphic Bismillah Ornament Line
                if (line.type === 'bismillah') {
                  return (
                    <div
                      key={`line-${line.lineNumber}`}
                      className={`text-center my-0.5 sm:my-1 font-quran text-lg sm:text-2xl font-bold select-none ${
                        isCream ? 'text-[#1B3B48]' : 'text-amber-400'
                      }`}
                    >
                      بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                    </div>
                  );
                }

                // 3. Regular 15-Line Quranic Text Line
                const words = line.words || [];
                // Center short lines at the end of surahs or pages 1 & 2
                const isCentered = pageNumber <= 2 || words.length <= 4;

                return (
                  <div
                    key={`line-${line.lineNumber}`}
                    className={`w-full flex items-center leading-normal py-0.5 my-[1px] transition-all ${
                      isCentered ? 'justify-center gap-3 sm:gap-4' : 'justify-between'
                    }`}
                    style={{
                      fontSize: isMobile ? '19px' : '25px'
                    }}
                  >
                    {words.map((word: KfgqpcWord, wIdx: number) => {
                      const isVerseActive = activeVerseKey === word.verseKey;
                      const isEnd = word.charTypeName === 'end';

                      return (
                        <span
                          key={`${word.id}-${wIdx}`}
                          ref={isVerseActive && wIdx === 0 ? activeWordRef : null}
                          onClick={() => onPlayVerseKey(word.verseKey)}
                          className={`cursor-pointer inline-flex items-center justify-center transition-all duration-150 rounded px-0.5 ${
                            isVerseActive
                              ? isCream
                                ? 'bg-amber-300/45 text-[#000000] font-bold shadow-[0_0_8px_rgba(245,158,11,0.5)] ring-1 ring-amber-500/60'
                                : 'bg-amber-400/35 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/60'
                              : isCream
                              ? 'hover:bg-amber-200/40 text-[#161311]'
                              : 'hover:bg-white/10 text-[#EDE8DF]'
                          }`}
                          title={`Click to listen to Ayah ${word.verseKey}`}
                        >
                          {isEnd ? (
                            <span
                              className={`inline-flex items-center justify-center mx-0.5 font-quran select-none text-[15px] sm:text-[19px] ${
                                isVerseActive
                                  ? 'text-amber-600 font-bold'
                                  : isCream
                                  ? 'text-[#C5A059]'
                                  : 'text-amber-400/90'
                              }`}
                            >
                              ۝{toArabicNumerals(parseInt(word.text, 10) || word.position)}
                            </span>
                          ) : (
                            <span>{word.text}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===================================================================
              BOTTOM PAGE FOOTER (Page Number Center in Eastern Numerals)
             =================================================================== */}
          <footer className="pt-2 mt-2 sm:mt-3 border-t border-[#C5A059]/30 flex items-center justify-between text-xs font-mono select-none">
            {/* Quick jump to Previous Page */}
            <button
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className={`p-1 sm:px-2.5 sm:py-1 rounded-lg transition-colors text-[11px] font-semibold flex items-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed ${
                isCream ? 'hover:bg-black/5 text-[#1B3B48]' : 'hover:bg-white/10 text-muted hover:text-white'
              }`}
              title="Previous Page (PageUp)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev Page</span>
            </button>

            {/* Central Ornate Page Number Medallion */}
            <div className="flex items-center gap-2">
              <span
                className={`font-quran text-base sm:text-lg font-bold ${
                  isCream ? 'text-[#C5A059]' : 'text-amber-400'
                }`}
              >
                — {toArabicNumerals(pageNumber)} —
              </span>
            </div>

            {/* Quick jump to Next Page */}
            <button
              onClick={handleNextPage}
              disabled={pageNumber >= 604}
              className={`p-1 sm:px-2.5 sm:py-1 rounded-lg transition-colors text-[11px] font-semibold flex items-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed ${
                isCream ? 'hover:bg-black/5 text-[#1B3B48]' : 'hover:bg-white/10 text-muted hover:text-white'
              }`}
              title="Next Page (PageDown)"
            >
              <span className="hidden sm:inline">Next Page</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </footer>
        </div>
      </div>

      {/* Floating Left & Right Page Navigation Chevrons for Desktop */}
      <button
        onClick={handlePrevPage}
        disabled={pageNumber <= 1}
        className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 text-white/80 hover:text-white backdrop-blur-xl disabled:opacity-10 transition-all shadow-xl z-20 hit-area-44"
        title="Previous Page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        onClick={handleNextPage}
        disabled={pageNumber >= 604}
        className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 text-white/80 hover:text-white backdrop-blur-xl disabled:opacity-10 transition-all shadow-xl z-20 hit-area-44"
        title="Next Page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
};
