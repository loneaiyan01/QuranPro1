import React, { useEffect, useRef, useState } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import { X, Play, Pause, SkipBack, SkipForward, Type, List, Tv, Maximize2, Minimize2, Clock, Lock, Unlock } from 'lucide-react';

const FullscreenTranslationView: React.FC = () => {
  const { currentSurah, surahText, surahs, actions: quranActions } = useQuran();
  const {
    isPlaying,
    currentTime,
    duration,
    currentAyahIndex,
    progress,
    isBuffering,
    isFullSurahAudio,
    sleepTimer,
    actions: { togglePlay, nextAyah, prevAyah, seek, setSleepTimer }
  } = useAudio();

  const {
    translationFontSize,
    setTranslationFontSize,
    fullscreenLayoutMode,
    setFullscreenLayoutMode,
    setIsFullscreenTranslation
  } = useTheme();

  // local UI states
  const [showHUD, setShowHUD] = useState<boolean>(true);
  const [userFocusedIndex, setUserFocusedIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showUnlockButton, setShowUnlockButton] = useState<boolean>(false);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);

  const englishAyahs = surahText?.english?.ayahs || [];

  // Estimate active verse when there is no verse-by-verse sync
  const estimatedAyahIndex = (isFullSurahAudio && duration > 0)
    ? Math.min(Math.floor((currentTime / duration) * englishAyahs.length), Math.max(0, englishAyahs.length - 1))
    : currentAyahIndex;

  const activeIndex = userFocusedIndex !== null ? userFocusedIndex : estimatedAyahIndex;
  const currentEnglishAyah = englishAyahs[activeIndex];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const displayFontSize = isMobile ? Math.min(translationFontSize, 24) : translationFontSize;

  // Reset focus when surah changes
  useEffect(() => {
    setUserFocusedIndex(null);
  }, [currentSurah]);

  // Reset lock when exiting fullscreen
  useEffect(() => {
    return () => {
      setIsLocked(false);
      setShowUnlockButton(false);
    };
  }, []);

  // Mouse/Touch idle detection and lock overlay controls
  useEffect(() => {
    const handleInteraction = (e: Event) => {
      if (isLocked) {
        return; // Don't show HUD when locked
      }
      setShowHUD(true);
      if (hudTimeoutRef.current) {
        clearTimeout(hudTimeoutRef.current);
      }
      hudTimeoutRef.current = setTimeout(() => {
        setShowHUD(false);
      }, 3000);
    };

    const handleWindowClick = () => {
      if (isLocked) {
        // Accidental tap protection: show the unlock button temporarily
        setShowUnlockButton(true);
        if (unlockTimeoutRef.current) {
          clearTimeout(unlockTimeoutRef.current);
        }
        unlockTimeoutRef.current = setTimeout(() => {
          setShowUnlockButton(false);
        }, 3000);
      }
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('pointermove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('click', handleWindowClick);

    // Initial trigger
    if (!isLocked) {
      setShowHUD(true);
      if (hudTimeoutRef.current) {
        clearTimeout(hudTimeoutRef.current);
      }
      hudTimeoutRef.current = setTimeout(() => {
        setShowHUD(false);
      }, 3000);
    }

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('pointermove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleWindowClick);
      if (hudTimeoutRef.current) {
        clearTimeout(hudTimeoutRef.current);
      }
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, [isLocked]);

  // Scrolling behavior for scroll mode (auto-sync to playing audio)
  useEffect(() => {
    if (fullscreenLayoutMode === 'scroll' && scrollContainerRef.current && userFocusedIndex === null) {
      const activeElement = verseRefs.current[estimatedAyahIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [estimatedAyahIndex, fullscreenLayoutMode, userFocusedIndex]);

  // Scrolling behavior for manual clicks
  useEffect(() => {
    if (fullscreenLayoutMode === 'scroll' && scrollContainerRef.current && userFocusedIndex !== null) {
      const activeElement = verseRefs.current[userFocusedIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [userFocusedIndex, fullscreenLayoutMode]);

  // If reciter has no verse sync, default to scroll mode
  useEffect(() => {
    if (isFullSurahAudio) {
      setFullscreenLayoutMode('scroll');
    }
  }, [isFullSurahAudio, setFullscreenLayoutMode]);

  // Adjust font size helpers
  const increaseFontSize = () => {
    setTranslationFontSize(Math.min(translationFontSize + 2, 64));
  };

  const decreaseFontSize = () => {
    setTranslationFontSize(Math.max(translationFontSize - 2, 16));
  };

  const handleSleepTimerToggle = () => {
    // Cycle: null -> 15 -> 30 -> 45 -> 60 -> null
    if (sleepTimer === null) {
      setSleepTimer(15);
    } else if (sleepTimer === 15) {
      setSleepTimer(30);
    } else if (sleepTimer === 30) {
      setSleepTimer(45);
    } else if (sleepTimer === 45) {
      setSleepTimer(60);
    } else {
      setSleepTimer(null);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSurah || !surahText) return null;

  return (
    <div
      className={`fixed inset-0 w-screen h-screen bg-black text-white z-[9999] relative select-none transition-all duration-500 overflow-hidden ${
        showHUD ? 'cursor-default' : 'cursor-none'
      }`}
    >
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Custom timeline track styling */
        .hud-slider::-webkit-slider-runnable-track {
          height: 4px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
        }
        .hud-slider::-webkit-slider-thumb {
          margin-top: -6px;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          -webkit-appearance: none;
        }
        /* Hide scrollbars in fullscreen mode */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* TOP HEADER (HUD) */}
      <header
        className={`absolute top-0 inset-x-0 flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 gap-3 sm:gap-0 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-500 z-50 ${
          showHUD ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Info */}
        <div className="flex flex-col gap-1 text-center sm:text-left items-center sm:items-start">
          {/* Surah Selector Dropdown */}
          <div className="relative inline-block text-left">
            <select
              value={currentSurah.number}
              onChange={(e) => {
                const surah = surahs.find(s => s.number === Number(e.target.value));
                if (surah) {
                  quranActions.selectSurah(surah);
                  setUserFocusedIndex(null);
                }
              }}
              className="bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg pl-3 pr-8 py-1 text-xs md:text-sm font-semibold outline-none cursor-pointer appearance-none transition-colors"
            >
              {surahs.map(surah => (
                <option key={surah.number} value={surah.number} className="bg-neutral-900 text-white">
                  {surah.number}. {surah.englishName}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-neutral-400">▼</span>
          </div>
          <p className="text-[10px] md:text-xs text-neutral-400">
            Verse {currentEnglishAyah ? currentEnglishAyah.numberInSurah : activeIndex + 1} of {currentSurah.numberOfAyahs}
          </p>
        </div>

        {/* HUD Toolbar Options */}
        <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
          {/* Toggle Layout Modes */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setFullscreenLayoutMode('single')}
              className={`p-1.5 rounded-md transition-colors ${
                fullscreenLayoutMode === 'single'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Focus Mode (Single Verse)"
            >
              <Tv className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFullscreenLayoutMode('scroll')}
              className={`p-1.5 rounded-md transition-colors ${
                fullscreenLayoutMode === 'scroll'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Cinematic Scroll Mode"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Font Sizes */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 gap-1 px-2 text-neutral-400">
            <Type className="w-3.5 h-3.5" />
            <button
              onClick={decreaseFontSize}
              className="p-1 hover:text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
              title="Decrease Font Size"
            >
              -
            </button>
            <span className="text-xs font-mono text-white min-w-[28px] text-center">
              {translationFontSize}px
            </span>
            <button
              onClick={increaseFontSize}
              className="p-1 hover:text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
              title="Increase Font Size"
            >
              +
            </button>
          </div>

          {/* Lock Screen Button */}
          <button
            onClick={() => {
              setIsLocked(true);
              setShowHUD(false);
              // Show unlock floating guide momentarily
              setShowUnlockButton(true);
              if (unlockTimeoutRef.current) {
                clearTimeout(unlockTimeoutRef.current);
              }
              unlockTimeoutRef.current = setTimeout(() => {
                setShowUnlockButton(false);
              }, 3000);
            }}
            className="p-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-lg border border-white/10 text-neutral-400 hover:text-white"
            title="Lock Controls"
          >
            <Lock className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Exit Button */}
          <button
            onClick={() => setIsFullscreenTranslation(false)}
            className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-lg border border-white/10"
            title="Exit Fullscreen Translation"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        </div>
      </header>

      {/* CORE DISPLAY CANVAS */}
      <main className="w-full h-full flex flex-col justify-center items-center px-4 md:px-24 relative z-10">
        {fullscreenLayoutMode === 'single' ? (
          /* FOCUS MODE (SINGLE VERSE) */
          <div className="flex flex-col items-center justify-center text-center max-w-4xl h-full py-6">
            {currentEnglishAyah ? (
              <div
                key={activeIndex}
                className="animate-slide-up text-white leading-relaxed font-sans px-4"
                style={{ fontSize: `${displayFontSize}px` }}
              >
                <p className="font-light tracking-wide max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar select-text animate-fade-in no-scrollbar">
                  {currentEnglishAyah.text}
                </p>
                
                {/* Subtle contextual metadata */}
                <p className="mt-6 md:mt-8 text-[10px] md:text-xs font-mono text-neutral-500 tracking-widest opacity-60">
                  {currentSurah.englishName} • {currentEnglishAyah.numberInSurah}
                </p>
              </div>
            ) : (
              <p className="text-neutral-500 italic">No translation data</p>
            )}
          </div>
        ) : (
          /* CINEMATIC SCROLL MODE */
          <div
            ref={scrollContainerRef}
            className="w-full h-full overflow-y-auto py-[30vh] md:py-[40vh] space-y-12 md:space-y-24 scroll-smooth px-4 max-w-4xl no-scrollbar"
          >
            {englishAyahs.map((ayah, index) => {
              const isActive = index === activeIndex;
              const isNext = index === activeIndex + 1;
              const isPrev = index === activeIndex - 1;

              let opacityClass = 'opacity-25 text-neutral-600';
              if (isActive) {
                opacityClass = 'opacity-100 text-white font-normal scale-[1.01] md:scale-[1.03]';
              } else if (isNext || isPrev) {
                opacityClass = 'opacity-50 text-neutral-400';
              }

              return (
                <div
                  key={ayah.number}
                  ref={(el) => {
                    verseRefs.current[index] = el;
                  }}
                  onClick={() => {
                    if (isLocked) return;
                    setUserFocusedIndex(index);
                  }}
                  className={`text-center leading-relaxed font-sans cursor-pointer transition-all duration-700 py-3 md:py-4 ${opacityClass}`}
                  style={{ fontSize: `${displayFontSize}px` }}
                >
                  <p className="font-light select-text">{ayah.text}</p>
                  <p className={`mt-2 md:mt-3 text-[9px] md:text-[10px] font-mono tracking-widest transition-opacity duration-500 ${
                    isActive ? 'opacity-40 text-neutral-400' : 'opacity-0'
                  }`}>
                    Verse {ayah.numberInSurah}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Resume Sync Pill */}
        {userFocusedIndex !== null && !isLocked && (
          <button
            onClick={() => setUserFocusedIndex(null)}
            className="absolute bottom-6 md:bottom-12 bg-white text-black font-semibold text-[11px] md:text-xs py-2 px-4 rounded-full shadow-2xl border border-neutral-200 flex items-center gap-1.5 hover:bg-neutral-200 active:scale-95 transition-all z-[100] animate-bounce"
          >
            <Maximize2 className="w-3.5 h-3.5 rotate-45" />
            <span>Sync to Audio</span>
          </button>
        )}
      </main>

      {/* FLOATING BOTTOM CONTROLS HUD */}
      <footer
        className={`absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-3 md:gap-4 items-center transition-opacity duration-500 z-50 ${
          showHUD ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber and timings */}
        <div className="w-full max-w-3xl flex items-center gap-2 md:gap-4 text-[10px] md:text-xs font-mono text-neutral-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1 relative group cursor-pointer h-1 flex items-center">
            {/* Range Scrubber */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="hud-slider w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Sleep Timer Button */}
          <button
            onClick={handleSleepTimerToggle}
            className={`p-2 md:p-3 transition-colors relative active:scale-95 transition-transform ${
              sleepTimer 
                ? 'text-white' 
                : 'text-neutral-400 hover:text-white'
            }`}
            aria-label="Toggle sleep timer"
            title={sleepTimer ? `Sleep timer: ${sleepTimer} mins remaining` : 'Set sleep timer'}
          >
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            {sleepTimer && (
              <span className="absolute top-0.5 right-0.5 text-[8px] md:text-[9px] font-mono bg-white text-black rounded-full w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center border border-black shadow-sm">
                {sleepTimer}
              </span>
            )}
          </button>

          <button
            onClick={prevAyah}
            className="p-2 md:p-3 text-neutral-400 hover:text-white transition-colors active:scale-95"
            title="Previous Verse"
          >
            <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isBuffering}
            className="w-10 h-10 md:w-12 md:h-12 bg-white text-black hover:bg-neutral-200 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current text-black" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5 ml-0.5 fill-current text-black" />
            )}
          </button>

          <button
            onClick={nextAyah}
            className="p-2 md:p-3 text-neutral-400 hover:text-white transition-colors active:scale-95"
            title="Next Verse"
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </footer>

      {/* FLOATING UNLOCK BUTTON FOR LOCKED MODE */}
      {isLocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLocked(false);
            setShowHUD(true);
            setShowUnlockButton(false);
          }}
          className={`fixed bottom-6 right-6 px-4 py-3 bg-black/80 hover:bg-black/90 text-white rounded-full shadow-2xl border border-white/20 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 z-[10000] ${
            showUnlockButton ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
          }`}
          title="Unlock Controls"
        >
          <Unlock className="w-4 h-4 md:w-5 md:h-5 text-[var(--accent)]" />
          <span className="text-xs font-semibold pr-1">Unlock Screen</span>
        </button>
      )}
    </div>
  );
};

export default FullscreenTranslationView;
