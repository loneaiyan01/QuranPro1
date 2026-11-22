import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PageAyah, MushafPageData } from '../types';
import { fetchMushafPage } from '../services/api';
import { toArabicNumerals, ARABIC_JUZ_NAMES, getJuzForPage } from '../utils/mushafData';
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, Check, Copy, Share2, Sparkles, Volume2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface MushafPageViewProps {
  pageNumber: number;
  onPageChange: (newPage: number) => void;
  activeSurahNumber: number | null;
  activeAyahNumberInSurah: number | null;
  isPlaying: boolean;
  onPlayAyah: (surahNumber: number, ayahNumberInSurah: number) => void;
  onSelectAyah?: (ayah: PageAyah) => void;
  isStandMode: boolean;
  onToggleStandMode: () => void;
  isMobile: boolean;
}

export const MushafPageView: React.FC<MushafPageViewProps> = ({
  pageNumber,
  onPageChange,
  activeSurahNumber,
  activeAyahNumberInSurah,
  isPlaying,
  onPlayAyah,
  onSelectAyah,
  isStandMode,
  onToggleStandMode,
  isMobile
}) => {
  const [pageData, setPageData] = useState<MushafPageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const { showToast } = useToast();
  const activeAyahRef = useRef<HTMLSpanElement | null>(null);

  // Load Page Data
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    fetchMushafPage(pageNumber)
      .then((data) => {
        if (!isCurrent) return;
        if (data && data.ayahs.length > 0) {
          setPageData(data);
          // Auto select first ayah or currently active ayah for bottom translation
          if (onSelectAyah && data.ayahs.length > 0) {
            const currentMatch = data.ayahs.find(
              a => a.surah.number === activeSurahNumber && a.numberInSurah === activeAyahNumberInSurah
            );
            onSelectAyah(currentMatch || data.ayahs[0]);
          }
        } else {
          setError('Failed to load Mushaf page.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError('Connection error while fetching Mushaf page.');
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [pageNumber]);

  // Update selected ayah when active recitation verse changes on this page
  useEffect(() => {
    if (pageData && onSelectAyah) {
      const match = pageData.ayahs.find(
        a => a.surah.number === activeSurahNumber && a.numberInSurah === activeAyahNumberInSurah
      );
      if (match) {
        onSelectAyah(match);
      }
    }
  }, [activeSurahNumber, activeAyahNumberInSurah, pageData, onSelectAyah]);

  // Smooth scroll active ayah into view if needed
  useEffect(() => {
    if (activeAyahRef.current) {
      activeAyahRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeSurahNumber, activeAyahNumberInSurah]);

  // Navigation Handlers
  const handleNextPage = useCallback(() => {
    // In traditional Arabic Mushaf, reading is Right-to-Left, so next page is pageNumber + 1
    if (pageNumber < 604) {
      onPageChange(pageNumber + 1);
    }
  }, [pageNumber, onPageChange]);

  const handlePrevPage = useCallback(() => {
    if (pageNumber > 1) {
      onPageChange(pageNumber - 1);
    }
  }, [pageNumber, onPageChange]);

  // Touch Gesture Handling for Mobile & Tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    // Swiping Left (next page in LTR, but in Arabic physical Mushaf turning next page flips left)
    if (distance > minSwipeDistance) {
      handleNextPage();
    } else if (distance < -minSwipeDistance) {
      handlePrevPage();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Keyboard navigation (Left/Right arrows for pages when not typing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'PageDown' || (e.ctrlKey && e.key === 'ArrowRight')) {
        handleNextPage();
      } else if (e.key === 'PageUp' || (e.ctrlKey && e.key === 'ArrowLeft')) {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  // Derive Primary Page Metadata
  const primarySurah = pageData?.ayahs[0]?.surah;
  const primaryJuzNumber = pageData?.ayahs[0]?.juz || getJuzForPage(pageNumber);
  const arabicJuzName = ARABIC_JUZ_NAMES[primaryJuzNumber - 1] || `الجزء ${toArabicNumerals(primaryJuzNumber)}`;

  // Group ayahs by Surah so we can render authentic King Fahd Surah headers
  const surahSections = useMemo(() => {
    if (!pageData) return [];
    const sections: {
      surah: PageAyah['surah'];
      isSurahStart: boolean;
      ayahs: PageAyah[];
    }[] = [];

    pageData.ayahs.forEach((ayah) => {
      const lastSection = sections[sections.length - 1];
      if (!lastSection || lastSection.surah.number !== ayah.surah.number) {
        sections.push({
          surah: ayah.surah,
          isSurahStart: ayah.numberInSurah === 1,
          ayahs: [ayah]
        });
      } else {
        lastSection.ayahs.push(ayah);
      }
    });

    return sections;
  }, [pageData]);

  // Clean Bismillah prefix if ayah 1 contains it (except Surah 1 & 9)
  const cleanAyahText = (text: string, numberInSurah: number, surahNumber: number) => {
    if (numberInSurah === 1 && surahNumber !== 1 && surahNumber !== 9) {
      const bismillahPrefix = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
      if (text.startsWith(bismillahPrefix)) {
        return text.slice(bismillahPrefix.length).trim();
      }
    }
    return text;
  };

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center my-auto transition-all select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* =====================================================================
          MUSHAF PAGE FRAME (King Fahd Complex Standard Dimensions & Border)
         ===================================================================== */}
      <div
        className={`w-full relative transition-all duration-300 rounded-2xl md:rounded-3xl border ${
          isStandMode
            ? 'bg-[#181310] border-amber-900/50 shadow-2xl text-amber-50'
            : 'bg-[var(--bg-card)]/90 border-white/[0.08] shadow-2xl text-white'
        }`}
        style={{
          boxShadow: isStandMode
            ? 'inset 0 0 40px rgba(0,0,0,0.6), 0 20px 50px rgba(0,0,0,0.8)'
            : '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Ornate Double-Line Decorative Margin Frame */}
        <div
          className={`m-2 sm:m-3.5 md:m-5 p-3 sm:p-5 md:p-8 rounded-xl md:rounded-2xl border-2 relative ${
            isStandMode
              ? 'border-amber-600/35 bg-[#1C1511]/90'
              : 'border-white/[0.09] bg-black/20'
          }`}
        >
          {/* Decorative Corner Ornaments (Islamic Arabesque Medallions) */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-500/50 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-500/50 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-500/50 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-500/50 rounded-br-sm pointer-events-none" />

          {/* ===================================================================
              TOP PAGE HEADER (Surah Name Right • Page/Hizb Center • Juz Left)
             =================================================================== */}
          <header className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-amber-500/20 text-xs sm:text-sm font-semibold select-none text-muted">
            {/* Left: Juz in Arabic */}
            <div className="text-right flex items-center gap-1.5">
              <span className="font-quran text-accent text-sm sm:text-base font-bold" dir="rtl">
                {arabicJuzName}
              </span>
            </div>

            {/* Center: Page indicator / Jump Input */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono tabular-nums text-muted/70">
              <span className="hidden sm:inline">Madani Mushaf •</span>
              <span>Page {pageNumber} of 604</span>
            </div>

            {/* Right: Surah Name in Arabic */}
            <div className="text-left flex items-center gap-1.5">
              <span className="font-quran text-white text-sm sm:text-base font-bold" dir="rtl">
                {primarySurah?.name || ''}
              </span>
            </div>
          </header>

          {/* Loading Shimmer State */}
          {isLoading && (
            <div className="py-20 space-y-4 animate-in fade-in duration-200">
              <div className="h-10 skeleton-shimmer rounded-xl w-3/4 mx-auto mb-8" />
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 skeleton-shimmer rounded-lg mx-auto"
                  style={{ width: `${88 - (i % 3) * 6}%` }}
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="py-20 text-center space-y-3">
              <p className="text-red-400 text-xs">{error}</p>
              <button
                onClick={() => onPageChange(pageNumber)}
                className="px-4 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* ===================================================================
              AUTHENTIC 15-LINE KING FAHD UTHMANI TEXT FLOW
             =================================================================== */}
          {!isLoading && pageData && (
            <div
              className="font-quran text-right leading-[2.6] sm:leading-[2.9] md:leading-[3.2] text-justify px-1 sm:px-2 md:px-3"
              dir="rtl"
              style={{
                fontSize: isMobile ? '23px' : '29px',
                textAlignLast: pageNumber <= 2 ? 'center' : 'justify'
              }}
            >
              {surahSections.map((section, sIdx) => {
                const isStart = section.isSurahStart;
                const hasBismillah = isStart && section.surah.number !== 1 && section.surah.number !== 9;

                return (
                  <div key={`${section.surah.number}-${sIdx}`} className="inline">
                    {/* ---------------------------------------------------------
                        SURAH HEADER BANNER (Fawatih as-Suwar Cartouche)
                       --------------------------------------------------------- */}
                    {isStart && (
                      <div className="block my-5 sm:my-7 text-center select-none clear-both">
                        <div
                          className="relative inline-flex flex-col items-center justify-center px-6 sm:px-12 py-2 sm:py-3 rounded-2xl border-2 shadow-lg w-full max-w-lg mx-auto overflow-hidden"
                          style={{
                            background: isStandMode
                              ? 'linear-gradient(135deg, #2D1A10 0%, #3D2214 50%, #2D1A10 100%)'
                              : 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                            borderColor: 'rgba(245, 158, 11, 0.4)'
                          }}
                        >
                          {/* Inner Islamic Star Ornament Accent */}
                          <div className="text-lg sm:text-2xl font-bold font-quran text-amber-300 drop-shadow-sm">
                            {section.surah.name}
                          </div>
                          <div className="text-[11px] sm:text-xs text-amber-200/80 font-sans tracking-wide mt-0.5 tabular-nums flex items-center gap-2">
                            <span>{section.surah.englishName}</span>
                            <span>•</span>
                            <span>{section.surah.revelationType === 'Meccan' ? 'مَكِّيَّةٌ' : 'مَدَنِيَّةٌ'}</span>
                            <span>•</span>
                            <span>{toArabicNumerals(section.surah.numberOfAyahs)} آيَاتُهَا</span>
                          </div>
                        </div>

                        {/* Calligraphic Bismillah Ornament */}
                        {hasBismillah && (
                          <div className="text-xl sm:text-2xl text-amber-400/90 font-quran my-3 sm:my-4 drop-shadow-sm">
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                          </div>
                        )}
                      </div>
                    )}

                    {/* Continuous Quranic Calligraphy Verses with Real-Time Highlighting */}
                    {section.ayahs.map((ayah) => {
                      const isVerseActive =
                        activeSurahNumber === ayah.surah.number &&
                        activeAyahNumberInSurah === ayah.numberInSurah;

                      return (
                        <span
                          key={ayah.number}
                          ref={isVerseActive ? activeAyahRef : null}
                          onClick={() => {
                            onPlayAyah(ayah.surah.number, ayah.numberInSurah);
                            if (onSelectAyah) onSelectAyah(ayah);
                          }}
                          className={`cursor-pointer inline transition-all duration-200 rounded-md px-1.5 py-0.5 my-0.5 group relative ${
                            isVerseActive
                              ? 'bg-amber-400/25 text-amber-100 font-semibold shadow-[0_0_15px_rgba(251,191,36,0.4)] ring-1.5 ring-amber-400/60'
                              : 'hover:bg-white/[0.08] hover:text-white'
                          }`}
                          title={`Click to listen to Ayah ${ayah.numberInSurah}`}
                        >
                          {cleanAyahText(ayah.text, ayah.numberInSurah, ayah.surah.number)}

                          {/* Authentic King Fahd Ayah End Medallion ۝ with Eastern Arabic Numeral */}
                          <span
                            className={`inline-flex items-center justify-center mx-1 select-none font-quran text-sm sm:text-base transition-colors ${
                              isVerseActive
                                ? 'text-amber-300 font-bold scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                : 'text-amber-500/80 group-hover:text-amber-400'
                            }`}
                          >
                            <span className="font-quran">۝</span>
                            <span className="text-[11px] sm:text-xs font-mono font-bold -mr-0.5">
                              {toArabicNumerals(ayah.numberInSurah)}
                            </span>
                          </span>
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
          <footer className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono text-muted select-none">
            {/* Quick jump to Previous Page */}
            <button
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className="p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-[11px] font-semibold flex items-center gap-1 hit-area-40"
              title="Previous Page (PageUp)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev Page</span>
            </button>

            {/* Central Ornate Page Number Medallion */}
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-quran text-base sm:text-lg font-bold">
                — {toArabicNumerals(pageNumber)} —
              </span>
            </div>

            {/* Quick jump to Next Page */}
            <button
              onClick={handleNextPage}
              disabled={pageNumber >= 604}
              className="p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-[11px] font-semibold flex items-center gap-1 hit-area-40"
              title="Next Page (PageDown)"
            >
              <span className="hidden sm:inline">Next Page</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </footer>
        </div>
      </div>

      {/* Floating Left & Right Page Navigation Chevrons for Desktop/Tablet */}
      <button
        onClick={handlePrevPage}
        disabled={pageNumber <= 1}
        className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white/70 hover:text-white backdrop-blur-xl disabled:opacity-10 transition-all shadow-xl z-20 hit-area-44"
        title="Previous Page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <button
        onClick={handleNextPage}
        disabled={pageNumber >= 604}
        className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white/70 hover:text-white backdrop-blur-xl disabled:opacity-10 transition-all shadow-xl z-20 hit-area-44"
        title="Next Page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
};
