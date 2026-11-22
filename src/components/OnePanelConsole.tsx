import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio, VersePauseDelay } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { RangeModal } from './RangeModal';
import FullscreenTranslationView from './FullscreenTranslationView';
import { MushafPageView } from './MushafPageView';
import { MushafBottomBar } from './MushafBottomBar';
import { formatTime, getRepeatText } from '../utils/formatTime';
import { JUZ_LIST } from '../utils/juzData';
import { HIZB_LIST } from '../utils/hizbData';
import { SURAH_START_PAGES, JUZ_START_PAGES, getJuzForPage } from '../utils/mushafData';
import { DisplayMode, Surah, Reciter, Ayah, Bookmark } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Clock,
  Hourglass,
  SlidersHorizontal,
  X,
  Search,
  Bookmark as BookmarkIcon,
  Check,
  Copy,
  Share2,
  Radio,
  Settings,
  Tv,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  PanelLeft,
  Trash2,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';

export const OnePanelConsole: React.FC = () => {
  // Contexts
  const {
    surahs,
    reciters,
    currentSurah,
    selectedReciter,
    surahText,
    isLoadingContent,
    contentError,
    bookmarks,
    isRadioMode,
    actions: quranActions
  } = useQuran();

  const {
    isPlaying,
    progress,
    buffered,
    currentTime,
    duration,
    isBuffering,
    currentAyahIndex,
    verseRepeatLimit,
    versePauseDelay,
    isPausingBetweenVerses,
    pauseCountdown,
    isFullSurahAudio,
    sleepTimer,
    playbackRange,
    speed,
    actions: audioActions
  } = useAudio();

  const {
    displayMode,
    setDisplayMode,
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize,
    readingWidth,
    setReadingWidth,
    horizontalPadding,
    setHorizontalPadding,
    isFullscreenTranslation,
    setIsFullscreenTranslation
  } = useTheme();

  const { showToast } = useToast();
  const isMobile = useIsMobile();

  // Local UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryTab, setDirectoryTab] = useState<'surahs' | 'juz' | 'saved'>('surahs');

  // Reciter Popover with Entrance/Exit Animation
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);
  const [isReciterMenuMounted, setIsReciterMenuMounted] = useState(false);
  const [isReciterMenuExiting, setIsReciterMenuExiting] = useState(false);

  // Settings Slide-over Drawer with Entrance/Exit Animation
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsMounted, setIsSettingsMounted] = useState(false);
  const [isSettingsExiting, setIsSettingsExiting] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapse
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);

  const reciterMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserInteracting = useRef(false);
  const isAutoScrolling = useRef(false);
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Open/Close Reciter Popover with 150ms Exit Animation
  const openReciterMenu = useCallback(() => {
    setIsReciterMenuMounted(true);
    setIsReciterMenuExiting(false);
    setIsReciterMenuOpen(true);
  }, []);

  const closeReciterMenu = useCallback(() => {
    setIsReciterMenuExiting(true);
    setIsReciterMenuOpen(false);
    setTimeout(() => {
      setIsReciterMenuMounted(false);
      setIsReciterMenuExiting(false);
    }, 150);
  }, []);

  const toggleReciterMenu = useCallback(() => {
    if (isReciterMenuOpen) {
      closeReciterMenu();
    } else {
      openReciterMenu();
    }
  }, [isReciterMenuOpen, closeReciterMenu, openReciterMenu]);

  // Open/Close Settings Drawer with 200ms Exit Animation
  const openSettings = useCallback(() => {
    setIsSettingsMounted(true);
    setIsSettingsExiting(false);
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsExiting(true);
    setIsSettingsOpen(false);
    setTimeout(() => {
      setIsSettingsMounted(false);
      setIsSettingsExiting(false);
    }, 200);
  }, []);

  // Close reciter menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (reciterMenuRef.current && !reciterMenuRef.current.contains(e.target as Node)) {
        closeReciterMenu();
      }
    };
    if (isReciterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isReciterMenuOpen, closeReciterMenu]);

  // Sidebar toggle handler (desktop & mobile)
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  }, [isMobile]);

  // Jakob's Law: Escape Closes the Topmost Layer
  const handleEscape = useCallback(() => {
    if (isSettingsOpen) {
      closeSettings();
      return true;
    }
    if (isRangeModalOpen) {
      setIsRangeModalOpen(false);
      return true;
    }
    if (isReciterMenuOpen) {
      closeReciterMenu();
      return true;
    }
    if (searchQuery) {
      setSearchQuery('');
      return true;
    }
    return false;
  }, [isSettingsOpen, closeSettings, isRangeModalOpen, isReciterMenuOpen, closeReciterMenu, searchQuery]);

  // Keyboard Shortcuts
  const toggleFullscreen = useCallback(() => setIsFullscreenTranslation(!isFullscreenTranslation), [isFullscreenTranslation, setIsFullscreenTranslation]);
  useKeyboardShortcuts({
    togglePlay: audioActions.togglePlay,
    prevAyah: audioActions.prevAyah,
    nextAyah: audioActions.nextAyah,
    toggleSidebar,
    toggleFullscreen,
    onEscape: handleEscape
  });

  // Derived data
  const arabicSurah = surahText?.arabic;
  const englishSurah = surahText?.english;
  const isVerseByVerse = !isFullSurahAudio;
  const verseNumber = arabicSurah?.ayahs[currentAyahIndex]?.numberInSurah;

  // Filtered lists
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.toLowerCase().trim();
    return surahs.filter(s =>
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.number.toString() === q ||
      s.name.includes(q)
    );
  }, [surahs, searchQuery]);

  const filteredJuzs = useMemo(() => {
    if (!searchQuery.trim()) return JUZ_LIST;
    const q = searchQuery.toLowerCase().trim();
    return JUZ_LIST.filter(j =>
      j.number.toString() === q ||
      j.nameEnglish.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const q = searchQuery.toLowerCase().trim();
    return bookmarks.filter(b =>
      b.surahEnglishName.toLowerCase().includes(q) ||
      b.ayahNumberInSurah.toString() === q
    );
  }, [bookmarks, searchQuery]);

  // Reciter Selection Handler
  const handleSelectReciter = (reciter: Reciter) => {
    quranActions.selectReciter(reciter);
    closeReciterMenu();
  };

  // View Mode: 'mushaf' (default) or 'cards'
  const [viewMode, setViewMode] = useState<'mushaf' | 'cards'>(() => {
    const saved = localStorage.getItem('tarteela_view_mode');
    return saved === 'cards' ? 'cards' : 'mushaf';
  });

  // Mushaf Page Theme: 'cream' (default authentic) or 'dark'
  const [pageTheme, setPageTheme] = useState<'cream' | 'dark'>(() => {
    const saved = localStorage.getItem('tarteela_mushaf_theme');
    return saved === 'dark' ? 'dark' : 'cream';
  });

  const togglePageTheme = useCallback(() => {
    setPageTheme(prev => {
      const next = prev === 'cream' ? 'dark' : 'cream';
      localStorage.setItem('tarteela_mushaf_theme', next);
      showToast(next === 'cream' ? 'King Fahd Cream Mushaf' : 'Night Dark Mushaf', { type: 'info' });
      return next;
    });
  }, [showToast]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const next = prev === 'mushaf' ? 'cards' : 'mushaf';
      localStorage.setItem('tarteela_view_mode', next);
      showToast(next === 'mushaf' ? 'Madani Mushaf Page View' : 'Verse Cards View', { type: 'info' });
      return next;
    });
  }, [showToast]);

  // Mushaf Page State (1 to 604)
  const [mushafPage, setMushafPage] = useState<number>(() => {
    const saved = localStorage.getItem('tarteela_mushaf_page');
    const num = saved ? parseInt(saved, 10) : 1;
    return num >= 1 && num <= 604 ? num : 1;
  });

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= 604) {
      setMushafPage(newPage);
      localStorage.setItem('tarteela_mushaf_page', String(newPage));
    }
  }, []);

  const [activeTranslationText, setActiveTranslationText] = useState<string | null>(null);

  // Active Verse Key (e.g. "1:1", "18:2")
  const activeVerseKey = useMemo(() => {
    return currentSurah ? `${currentSurah.number}:${currentAyahIndex + 1}` : null;
  }, [currentSurah, currentAyahIndex]);

  // Sync active ayah and page when recitation progresses
  useEffect(() => {
    if (currentSurah && surahText?.arabic?.ayahs?.[currentAyahIndex]) {
      const currentAyah = surahText.arabic.ayahs[currentAyahIndex];
      const currentEnglish = surahText.english?.ayahs?.[currentAyahIndex];

      if (currentAyah) {
        if (currentAyah.page && currentAyah.page !== mushafPage) {
          setMushafPage(currentAyah.page);
        }

        if (currentEnglish?.text) {
          setActiveTranslationText(currentEnglish.text);
        }
      }
    }
  }, [currentAyahIndex, currentSurah, surahText, mushafPage]);

  const handlePlayVerseKey = useCallback(async (verseKey: string) => {
    const [sStr, aStr] = verseKey.split(':');
    const surahNum = parseInt(sStr, 10);
    const ayahNum = parseInt(aStr, 10);
    if (!surahNum || !ayahNum) return;

    if (!currentSurah || currentSurah.number !== surahNum) {
      const targetSurah = surahs.find(s => s.number === surahNum);
      if (targetSurah) {
        await quranActions.selectSurah(targetSurah);
      }
    }
    audioActions.playVerse(ayahNum - 1);
  }, [currentSurah, surahs, quranActions, audioActions]);

  const handleActiveTranslationChange = useCallback((translation: string, _verseKey: string) => {
    setActiveTranslationText(translation);
  }, []);

  // Surah Selection Handler
  const handleSelectSurah = async (surah: Surah) => {
    if (isRadioMode) {
      quranActions.toggleRadioMode(false);
    }
    const startPage = SURAH_START_PAGES[surah.number] || 1;
    setMushafPage(startPage);
    await quranActions.selectSurah(surah);
    audioActions.setAyahIndex(0);
    if (isMobile) setIsSidebarOpen(false);
    setTimeout(() => {
      audioActions.play();
    }, 250);
  };

  // Juz Selection Handler
  const handleSelectJuz = async (juz: typeof JUZ_LIST[0]) => {
    if (isRadioMode) {
      quranActions.toggleRadioMode(false);
    }
    const startPage = JUZ_START_PAGES[juz.number - 1] || 1;
    setMushafPage(startPage);
    const targetSurah = surahs.find(s => s.number === juz.startSurahNumber);
    if (targetSurah) {
      await quranActions.selectSurah(targetSurah);
      audioActions.setAyahIndex(juz.startAyahNumber - 1);
      if (isMobile) setIsSidebarOpen(false);
      setTimeout(() => {
        audioActions.play();
      }, 250);
    }
  };

  // Bookmark Jump Handler
  const handleSelectBookmark = async (bookmark: Bookmark) => {
    if (isRadioMode) {
      quranActions.toggleRadioMode(false);
    }
    const targetSurah = surahs.find(s => s.number === bookmark.surahNumber);
    if (targetSurah) {
      await quranActions.selectSurah(targetSurah);
      audioActions.setAyahIndex(bookmark.ayahNumberInSurah - 1);
      if (isMobile) setIsSidebarOpen(false);
      setTimeout(() => {
        audioActions.play();
      }, 250);
    }
  };

  // Handle Radio Mode Toggle
  const handleToggleRadio = () => {
    quranActions.toggleRadioMode(!isRadioMode);
  };

  // Repeat and Sleep Timer Cycle Handlers
  const handleRepeatToggle = () => {
    if (verseRepeatLimit === 1) audioActions.setVerseRepeatLimit(3);
    else if (verseRepeatLimit === 3) audioActions.setVerseRepeatLimit(5);
    else if (verseRepeatLimit === 5) audioActions.setVerseRepeatLimit(-1);
    else audioActions.setVerseRepeatLimit(1);
  };

  const handleSleepTimerToggle = () => {
    if (sleepTimer === null) audioActions.setSleepTimer(15);
    else if (sleepTimer <= 15) audioActions.setSleepTimer(30);
    else if (sleepTimer <= 30) audioActions.setSleepTimer(45);
    else if (sleepTimer <= 45) audioActions.setSleepTimer(60);
    else audioActions.setSleepTimer(null);
  };

  // Manual Scroll Detection
  const handleScroll = useCallback(() => {
    if (isAutoScrolling.current) {
      isAutoScrolling.current = false;
      return;
    }
    isUserInteracting.current = true;
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => {
      isUserInteracting.current = false;
    }, 4000);
  }, []);

  // Time-Synced Auto Scroll to Active Verse
  useEffect(() => {
    if (!isVerseByVerse || isUserInteracting.current || isRadioMode) return;
    const activeVerse = verseRefs.current[currentAyahIndex];
    if (activeVerse && containerRef.current) {
      isAutoScrolling.current = true;
      activeVerse.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentAyahIndex, isVerseByVerse, isRadioMode]);

  // Copy Verse Text with Confident Feedback
  const handleCopyVerse = async (e: React.MouseEvent, ayah: Ayah, englishAyah?: Ayah) => {
    e.stopPropagation();
    let text = ayah.text;
    if (englishAyah?.text) text += '\n\n' + englishAyah.text;
    text += `\n\n— ${currentSurah?.englishName} [${ayah.numberInSurah}]`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAyahNumber(ayah.numberInSurah);
      showToast(`Ayah ${ayah.numberInSurah} copied to clipboard`, { type: 'success' });
      setTimeout(() => setCopiedAyahNumber(null), 2000);
    } catch {
      showToast(`Unable to copy to clipboard`, { type: 'info' });
    }
  };

  // Share Verse
  const handleShareVerse = async (e: React.MouseEvent, ayah: Ayah, englishAyah?: Ayah) => {
    e.stopPropagation();
    let text = ayah.text;
    if (englishAyah?.text) text += '\n\n' + englishAyah.text;
    text += `\n\n— ${currentSurah?.englishName} [${ayah.numberInSurah}]`;
    if (navigator.share) {
      try {
        await navigator.share({ title: currentSurah?.englishName, text });
      } catch { /* cancelled */ }
    } else {
      handleCopyVerse(e, ayah, englishAyah);
    }
  };

  // Dynamic Responsive Font Sizes
  const displayArabicSize = isMobile ? Math.min(arabicFontSize, 38) : arabicFontSize;
  const displayTranslationSize = isMobile ? Math.min(translationFontSize, 17) : translationFontSize;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden select-none font-sans">
      {/* Fullscreen Translation Overlay */}
      {isFullscreenTranslation && <FullscreenTranslationView />}

      {/* Range Selection Modal */}
      <RangeModal isOpen={isRangeModalOpen} onClose={() => setIsRangeModalOpen(false)} />

      {/* =========================================================================
          1. TOP APP BAR: Apple-Inspired Header Bar (Height: 56px)
         ========================================================================= */}
      <header className="h-14 px-3 sm:px-6 bg-[var(--bg-sidebar)]/85 backdrop-blur-2xl border-b border-[var(--border)] z-30 flex items-center justify-between gap-3 shadow-xs flex-shrink-0">
        {/* Left: Sidebar Toggle & Brand Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-xl transition-colors btn-press hit-area-40 flex items-center justify-center border ${
              isSidebarCollapsed
                ? 'bg-accent/15 border-accent/40 text-accent'
                : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-muted hover:text-white'
            }`}
            title={isSidebarCollapsed ? "Expand Sidebar (⌘B)" : "Collapse Sidebar (⌘B)"}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-base tracking-tight text-white cursor-default select-none">
            HearQuran
          </span>
        </div>

        {/* Center: Spotlight Search Pill */}
        <div className="flex-1 max-w-xs sm:max-w-md relative mx-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={isMobile ? "Search..." : "Search Surah, number, or Juz..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-8 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] border border-[var(--border)] focus:border-accent/50 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent/40 text-white placeholder-muted/70 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-white rounded-full hover:bg-white/10 transition-colors hit-area-40"
              title="Clear search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* View Mode Toggle (Madani Mushaf Page vs Cards) */}
          <button
            onClick={toggleViewMode}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors btn-press hit-area-40 border ${
              viewMode === 'mushaf'
                ? 'bg-accent/20 border-accent/40 text-accent font-bold'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white border-white/[0.08]'
            }`}
            title={viewMode === 'mushaf' ? "Switch to Verse Cards List View" : "Switch to Madani Mushaf Page View"}
          >
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">{viewMode === 'mushaf' ? 'Mushaf' : 'Cards'}</span>
          </button>

          {/* Mushaf Page Theme (Original Cream vs Night Dark) */}
          {viewMode === 'mushaf' && (
            <button
              onClick={togglePageTheme}
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors btn-press hit-area-40 border ${
                pageTheme === 'cream'
                  ? 'bg-amber-100/90 text-amber-950 border-amber-300 font-bold shadow-xs'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white border-white/[0.08]'
              }`}
              title={pageTheme === 'cream' ? "Switch to Night Dark Mushaf Mode" : "Switch to Authentic King Fahd Cream Mode"}
            >
              {pageTheme === 'cream' ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
              <span className="hidden md:inline">{pageTheme === 'cream' ? 'Cream' : 'Dark'}</span>
            </button>
          )}

          {/* Live Radio Toggle */}
          <button
            onClick={handleToggleRadio}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors btn-press hit-area-40 border ${
              isRadioMode
                ? 'bg-accent text-white border-accent shadow-md shadow-accent/30'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white border-white/[0.08]'
            }`}
            title={isRadioMode ? "Listening to Live Radio (Click to exit)" : "Turn on 24/7 Quran Live Radio"}
          >
            <Radio className={`w-3.5 h-3.5 ${isRadioMode ? 'animate-pulse text-white' : 'text-accent'}`} />
            <span className="hidden sm:inline">{isRadioMode ? 'Radio Live' : 'Live Radio'}</span>
          </button>

          {/* Range Button */}
          <button
            onClick={() => setIsRangeModalOpen(true)}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors btn-press hit-area-40 border ${
              playbackRange
                ? 'bg-accent/20 border-accent/40 text-accent font-bold'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white border-white/[0.08]'
            }`}
            title="Custom Ayah Range Loop (Hifz Memorization)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
            <span className="hidden md:inline">Range</span>
          </button>

          {/* Reading Mode Segmented Pill */}
          <div className="hidden xl:flex items-center bg-white/[0.04] p-0.5 rounded-full border border-white/[0.08] text-[11px] font-medium">
            <button
              onClick={() => setDisplayMode(DisplayMode.BOTH)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                displayMode === DisplayMode.BOTH
                  ? 'bg-accent text-white shadow-xs font-semibold'
                  : 'text-muted hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setDisplayMode(DisplayMode.ARABIC_ONLY)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                displayMode === DisplayMode.ARABIC_ONLY
                  ? 'bg-accent text-white shadow-xs font-semibold'
                  : 'text-muted hover:text-white'
              }`}
            >
              Arabic
            </button>
            <button
              onClick={() => setDisplayMode(DisplayMode.ENGLISH_ONLY)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                displayMode === DisplayMode.ENGLISH_ONLY
                  ? 'bg-accent text-white shadow-xs font-semibold'
                  : 'text-muted hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Fullscreen TV Mode */}
          <button
            onClick={() => setIsFullscreenTranslation(true)}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white border border-white/[0.08] btn-press hit-area-40 transition-colors"
            title="Immersive Fullscreen TV Mode (F)"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>

          {/* Preferences Settings Gear */}
          <button
            onClick={openSettings}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white border border-white/[0.08] btn-press hit-area-40 transition-colors"
            title="Open Audio & Reading Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN STAGE: Split View Console (Directory Left + Reading/Listening Right)
         ========================================================================= */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Mobile Sidebar Overlay Backdrop (Paired with drawer for smooth exit) */}
        {isMobile && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200 ${
              isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            style={{
              transitionTimingFunction: isSidebarOpen ? 'var(--ease-apple-out)' : 'var(--ease-apple-in)'
            }}
          />
        )}

        {/* -----------------------------------------------------------------------
            LEFT PANEL: Minimizable Surah & Reciter Directory
           ----------------------------------------------------------------------- */}
        <aside
          className={`bg-[var(--bg-sidebar)]/95 md:bg-[var(--bg-sidebar)]/70 backdrop-blur-xl border-r border-[var(--border)] flex flex-col transition-[width,transform,opacity] duration-250 flex-shrink-0 ${
            // Mobile behaviour: sliding drawer
            isMobile
              ? `fixed inset-y-0 left-0 w-80 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : // Desktop behaviour: minimizable width
              isSidebarCollapsed
                ? 'w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none'
                : 'w-80 sm:w-84 xl:w-88 z-20 opacity-100'
          }`}
          style={{
            transitionTimingFunction: 'var(--ease-apple-in-out)'
          }}
        >
          {/* Header of Sidebar: Reciter Picker Card */}
          <div className="p-3 border-b border-[var(--border)] relative" ref={reciterMenuRef}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Recitation By</span>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-muted hover:text-white rounded-md hit-area-44"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={toggleReciterMenu}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-accent/40 transition-colors text-left"
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="text-xs font-semibold text-white truncate">
                  {selectedReciter?.englishName || 'Select Reciter'}
                </div>
                <div className="text-[10px] text-muted truncate">
                  {selectedReciter?.name} • {selectedReciter?.isVerseByVerse ? 'Verse Sync' : 'Full Audio'}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 flex-shrink-0 ${isReciterMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Reciter Dropdown Popover with Origin-Top & Proper Exit */}
            {isReciterMenuMounted && (
              <div
                className={`absolute top-full left-3 right-3 mt-1 bg-[var(--bg-card-active)]/95 backdrop-blur-2xl border border-[var(--border)] rounded-2xl shadow-2xl z-50 p-1.5 max-h-72 overflow-y-auto custom-scrollbar origin-top transition-[transform,opacity] ${
                  isReciterMenuExiting
                    ? 'opacity-0 scale-95 -translate-y-1'
                    : 'opacity-100 scale-100 translate-y-0'
                }`}
                style={{
                  transitionDuration: isReciterMenuExiting ? '150ms' : '200ms',
                  transitionTimingFunction: isReciterMenuExiting ? 'var(--ease-apple-in)' : 'var(--ease-apple-out)'
                }}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-white/[0.06] mb-1">
                  Choose Reciter ({reciters.length})
                </div>
                {reciters.map((reciter) => {
                  const isSelected = selectedReciter?.identifier === reciter.identifier;
                  return (
                    <button
                      key={reciter.identifier}
                      onClick={() => handleSelectReciter(reciter)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors text-xs mb-0.5 ${
                        isSelected
                          ? 'bg-accent text-white font-semibold shadow-xs'
                          : 'text-muted hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="font-medium truncate">{reciter.englishName}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                          {reciter.name}
                        </div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold flex-shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-muted'
                      }`}>
                        {reciter.isVerseByVerse ? 'VBV' : 'Full'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Directory Navigation Tabs (Clean Minimalist Text Pills) */}
          <div className="px-3 pt-2 pb-1.5 flex items-center gap-1 border-b border-[var(--border)] bg-white/[0.01]">
            <button
              onClick={() => setDirectoryTab('surahs')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors text-center ${
                directoryTab === 'surahs'
                  ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                  : 'text-muted hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Surahs ({surahs.length})
            </button>
            <button
              onClick={() => setDirectoryTab('juz')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors text-center ${
                directoryTab === 'juz'
                  ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                  : 'text-muted hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Juz (30)
            </button>
            <button
              onClick={() => setDirectoryTab('saved')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors text-center ${
                directoryTab === 'saved'
                  ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                  : 'text-muted hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Saved ({bookmarks.length})
            </button>
          </div>

          {/* Directory Content List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {directoryTab === 'surahs' && (
              filteredSurahs.length > 0 ? (
                filteredSurahs.map((surah, sIdx) => {
                  const isActive = currentSurah?.number === surah.number && !isRadioMode;
                  return (
                    <button
                      key={surah.number}
                      onClick={() => handleSelectSurah(surah)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors group stagger-arrive ${
                        isActive
                          ? 'bg-accent/15 border border-accent/40 text-white font-medium shadow-xs'
                          : 'hover:bg-white/[0.05] border border-transparent text-muted hover:text-white'
                      }`}
                      style={{
                        animationDelay: sIdx < 6 ? `${sIdx * 35}ms` : '210ms'
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-mono tabular-nums flex items-center justify-center font-bold flex-shrink-0 transition-colors ${
                          isActive
                            ? 'bg-accent text-white shadow-xs'
                            : 'bg-white/[0.06] text-muted group-hover:text-white group-hover:bg-white/10'
                        }`}>
                          {surah.number.toString().padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-semibold truncate ${isActive ? 'text-accent' : 'text-white'}`}>
                            {surah.englishName}
                          </div>
                          <div className="text-[10px] text-muted truncate">
                            {surah.englishNameTranslation} • {surah.numberOfAyahs}v
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 text-right">
                        <span className="font-quran text-xs opacity-80" dir="rtl">
                          {surah.name}
                        </span>
                        {isActive && isPlaying && (
                          <div className="flex gap-0.5 items-end h-3 ml-1">
                            <div className="w-0.5 bg-accent animate-[music-bar_0.8s_ease-in-out_infinite] h-full" />
                            <div className="w-0.5 bg-accent animate-[music-bar_1.2s_ease-in-out_infinite] h-2" />
                            <div className="w-0.5 bg-accent animate-[music-bar_1.0s_ease-in-out_infinite] h-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-12 px-4 text-xs text-muted">
                  No Surahs match "{searchQuery}"
                </div>
              )
            )}

            {directoryTab === 'juz' && (
              filteredJuzs.map((juz, jIdx) => (
                <button
                  key={juz.number}
                  onClick={() => handleSelectJuz(juz)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-colors text-muted hover:text-white group stagger-arrive"
                  style={{
                    animationDelay: jIdx < 6 ? `${jIdx * 35}ms` : '210ms'
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-lg text-[10px] font-mono tabular-nums bg-white/[0.06] text-accent flex items-center justify-center font-bold flex-shrink-0">
                      {juz.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate">
                        {juz.nameEnglish}
                      </div>
                      <div className="text-[10px] text-muted truncate">
                        {juz.description}
                      </div>
                    </div>
                  </div>
                  <span className="font-quran text-xs opacity-75 text-accent" dir="rtl">
                    {juz.nameArabic}
                  </span>
                </button>
              ))
            )}

            {directoryTab === 'saved' && (
              bookmarks.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2 text-muted">
                  <BookmarkIcon className="w-6 h-6 mx-auto opacity-40 text-accent" />
                  <p className="text-xs">No saved verses yet.</p>
                  <p className="text-[10px]">Tap the bookmark icon on any verse while listening to save it here.</p>
                </div>
              ) : (
                filteredBookmarks.map((bookmark) => (
                  <div
                    key={`${bookmark.surahNumber}-${bookmark.ayahNumberInSurah}`}
                    onClick={() => handleSelectBookmark(bookmark)}
                    className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer group flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white group-hover:text-accent transition-colors truncate">
                        {bookmark.surahEnglishName}
                      </div>
                      <div className="text-[10px] text-muted tabular-nums">
                        Ayah {bookmark.ayahNumberInSurah}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const removedBookmark = bookmark;
                          quranActions.toggleBookmark(removedBookmark.surahNumber, removedBookmark.surahEnglishName, removedBookmark.ayahNumberInSurah);
                          showToast(`Removed Ayah ${removedBookmark.ayahNumberInSurah} of ${removedBookmark.surahEnglishName}`, {
                            type: 'undo',
                            undoAction: () => {
                              quranActions.toggleBookmark(removedBookmark.surahNumber, removedBookmark.surahEnglishName, removedBookmark.ayahNumberInSurah);
                            }
                          });
                        }}
                        className="p-1.5 text-muted hover:text-red-400 rounded-lg transition-colors hit-area-44"
                        title="Remove bookmark (with Undo)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </aside>

        {/* -----------------------------------------------------------------------
            CENTER STAGE: Focused Listening & Time-Synced Verse Display
           ----------------------------------------------------------------------- */}
        <main
          ref={containerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto pt-4 sm:pt-6 custom-scrollbar scroll-smooth ${
            viewMode === 'mushaf' ? 'pb-36 sm:pb-40' : 'pb-28'
          }`}
          style={{
            paddingLeft: isMobile ? '12px' : `${horizontalPadding}px`,
            paddingRight: isMobile ? '12px' : `${horizontalPadding}px`
          }}
        >
          {/* Conditional Center Stage: Radio Mode vs Standard Verse View */}
          {isRadioMode ? (
            /* ===================================================================
               PURE APPLE RADIO MODE VIEW
               =================================================================== */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 space-y-8 relative min-h-[65vh] animate-in fade-in zoom-in-95 duration-300 ease-[var(--ease-apple-out)]">
              {/* Ambient Radiant Glow */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="w-[500px] h-[500px] rounded-full bg-accent/10 blur-[130px] animate-pulse" />
              </div>

              {/* Radio Identity Header */}
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold tracking-wide shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  <span>Quran Live Radio • 24/7 Stream</span>
                </div>

                <h1 className="font-quran text-4xl sm:text-6xl text-white tracking-wide pt-2" dir="rtl">
                  {currentSurah?.name}
                </h1>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentSurah?.englishName}
                </h2>
                <p className="text-xs sm:text-sm text-muted tabular-nums">
                  Ayah {currentAyahIndex + 1} of {currentSurah?.numberOfAyahs} • Recited by {selectedReciter?.englishName}
                </p>
              </div>

              {/* Ambient Highlighted Verse Card */}
              {arabicSurah?.ayahs[currentAyahIndex] && (
                <div className="relative z-10 w-full max-w-4xl p-6 sm:p-10 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
                  <p
                    className="font-quran text-2xl sm:text-4xl text-white leading-[2.2] text-center"
                    dir="rtl"
                    style={{ fontSize: `${displayArabicSize}px` }}
                  >
                    {arabicSurah.ayahs[currentAyahIndex].text}
                  </p>
                  {englishSurah?.ayahs[currentAyahIndex] && (
                    <p
                      className="font-sans text-sm sm:text-lg text-muted text-center leading-relaxed max-w-2xl mx-auto"
                      style={{ fontSize: `${displayTranslationSize}px` }}
                    >
                      {englishSurah.ayahs[currentAyahIndex].text}
                    </p>
                  )}
                </div>
              )}

              {/* Radio Actions */}
              <div className="relative z-10 pt-2">
                <button
                  onClick={() => quranActions.toggleRadioMode(false)}
                  className="px-5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-muted hover:text-white border border-white/[0.1] btn-press hit-area-44 transition-colors shadow-sm"
                >
                  Exit Radio Mode
                </button>
              </div>
            </div>
          ) : viewMode === 'mushaf' ? (
            /* ===================================================================
               KING FAHD MADANI MUSHAF PAGE VIEW (KFGQPC V2 15-LINE FORMAT)
               =================================================================== */
            <div className="w-full mx-auto max-w-5xl py-2 sm:py-4 animate-in fade-in duration-300">
              <MushafPageView
                pageNumber={mushafPage}
                onPageChange={handlePageChange}
                activeVerseKey={activeVerseKey}
                isPlaying={isPlaying}
                onPlayVerseKey={handlePlayVerseKey}
                onActiveTranslationChange={handleActiveTranslationChange}
                pageTheme={pageTheme}
                onTogglePageTheme={togglePageTheme}
                isMobile={isMobile}
              />
            </div>
          ) : (
            /* ===================================================================
               STANDARD TIME-SYNCED READING VIEW (Controlled via Preferences)
               =================================================================== */
            <div
              className="w-full mx-auto space-y-6"
              style={{
                maxWidth: readingWidth >= 1800 ? '100%' : `${readingWidth}px`
              }}
            >
              {playbackRange && (
                <div className="p-3 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-between gap-3 text-xs text-accent animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 truncate">
                    <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate tabular-nums">
                      Active Range Loop: {currentSurah?.englishName} (v{playbackRange.startAyahIndex + 1} – v{playbackRange.endAyahIndex + 1})
                    </span>
                  </div>
                  <button
                    onClick={() => audioActions.setPlaybackRange(null)}
                    className="p-1.5 text-accent hover:text-white rounded-md hit-area-44 transition-colors"
                    title="Clear loop"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {isPausingBetweenVerses && (
                <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-center text-xs text-accent font-medium flex items-center justify-center gap-2 animate-pulse tabular-nums">
                  <Hourglass className="w-3.5 h-3.5 animate-spin" />
                  <span>Reflection Pause: {pauseCountdown}s remaining</span>
                </div>
              )}

              {/* Editorial Surah Header */}
              {currentSurah && (
                <header className="text-center space-y-3 pt-2 pb-6 border-b border-[var(--border)]">
                  <h2 className="font-quran text-3xl sm:text-5xl text-white tracking-wide" dir="rtl">
                    {currentSurah.name}
                  </h2>
                  <div className="space-y-1">
                    <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                      {currentSurah.englishName}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted tabular-nums">
                      {currentSurah.englishNameTranslation} • {currentSurah.numberOfAyahs} Verses • {currentSurah.revelationType}
                    </p>
                  </div>

                  {/* Bismillah calligraphy ornament (omitted for Surah 1 & 9) */}
                  {currentSurah.number !== 1 && currentSurah.number !== 9 && (
                    <div className="pt-4 font-quran text-xl sm:text-2xl text-accent opacity-90" dir="rtl">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>
                  )}
                </header>
              )}

              {/* Doherty Threshold Past 1s: Quran Verse Card Skeletons */}
              {isLoadingContent && (
                <div className="space-y-4 pb-12 animate-in fade-in duration-300">
                  {[1, 2, 3].map((sIndex) => (
                    <div
                      key={sIndex}
                      className="p-5 sm:p-7 md:p-9 rounded-2xl md:rounded-3xl border border-white/[0.04] bg-white/[0.02] space-y-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg skeleton-shimmer" />
                        <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-md skeleton-shimmer" />
                          <div className="w-5 h-5 rounded-md skeleton-shimmer" />
                        </div>
                      </div>
                      <div className="space-y-3 pt-1">
                        <div className="h-7 skeleton-shimmer rounded-xl w-[90%] ml-auto" />
                        <div className="h-7 skeleton-shimmer rounded-xl w-[68%] ml-auto" />
                      </div>
                      <div className="space-y-2.5 pt-3">
                        <div className="h-4 skeleton-shimmer rounded-lg w-[80%]" />
                        <div className="h-4 skeleton-shimmer rounded-lg w-[52%]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {contentError && (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3 max-w-sm mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                  <div className="text-xs text-muted">{contentError}</div>
                  <button
                    onClick={() => quranActions.retryLoadContent()}
                    className="px-4 py-2 bg-accent text-white text-xs font-semibold rounded-xl btn-press hit-area-44 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Time-Synced Apple Music Lyric Verses */}
              {!isLoadingContent && arabicSurah && (
                <div className="space-y-4 pb-12">
                  {arabicSurah.ayahs.map((ayah, index) => {
                    const isActive = currentAyahIndex === index;
                    const englishAyah = englishSurah?.ayahs[index];
                    const isBookmarked = quranActions.isBookmarked(currentSurah?.number || 1, ayah.numberInSurah);

                    return (
                      <div
                        key={ayah.number}
                        ref={(el) => { verseRefs.current[index] = el; }}
                        onClick={() => {
                          if (isVerseByVerse) {
                            audioActions.setAyahIndex(index);
                            audioActions.play();
                          }
                        }}
                        className={`group p-5 sm:p-7 md:p-9 rounded-2xl md:rounded-3xl border stagger-arrive ${
                          isVerseByVerse ? 'cursor-pointer' : ''
                        } ${
                          isActive
                            ? 'bg-white/[0.04] border-accent/40 shadow-2xl border-l-4 border-l-accent'
                            : 'bg-transparent border-transparent border-l-4 border-l-transparent opacity-40 hover:opacity-90 hover:bg-white/[0.02]'
                        }`}
                        style={{
                          transitionProperty: 'background-color, border-color, opacity, box-shadow',
                          transitionDuration: '250ms',
                          transitionTimingFunction: 'var(--ease-apple-out)',
                          animationDelay: index < 6 ? `${index * 40}ms` : '240ms'
                        }}
                      >
                        {/* Verse Header Info */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-7 h-7 rounded-lg text-xs font-mono tabular-nums font-semibold flex items-center justify-center transition-colors ${
                              isActive
                                ? 'bg-accent text-white shadow-md shadow-accent/30'
                                : 'bg-white/[0.06] text-muted'
                            }`}>
                              {ayah.numberInSurah}
                            </span>
                            {isActive && isPlaying && (
                              <div className="flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase tracking-wider">
                                {isBuffering ? (
                                  <span className="animate-pulse">Buffering...</span>
                                ) : (
                                  <div className="flex gap-0.5 items-end h-2.5">
                                    <div className="w-0.5 bg-accent animate-[music-bar_0.8s_ease-in-out_infinite] h-full" />
                                    <div className="w-0.5 bg-accent animate-[music-bar_1.2s_ease-in-out_infinite] h-1.5" />
                                    <div className="w-0.5 bg-accent animate-[music-bar_1.0s_ease-in-out_infinite] h-2.5" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Interactive Controls (Active or Hover) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentSurah) {
                                  quranActions.toggleBookmark(currentSurah.number, currentSurah.englishName, ayah.numberInSurah);
                                  if (!isBookmarked) {
                                    showToast(`Saved Ayah ${ayah.numberInSurah} to Bookmarks`, { type: 'success' });
                                  }
                                }
                              }}
                              className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors hit-area-44 ${
                                isBookmarked ? 'text-accent' : 'text-muted hover:text-white'
                              }`}
                              title={isBookmarked ? "Remove bookmark" : "Bookmark this verse"}
                            >
                              <BookmarkIcon className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                            
                            {/* Copy Verse with Dual-Icon Replacement & Toast */}
                            <button
                              onClick={(e) => handleCopyVerse(e, ayah, englishAyah)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors hit-area-44 relative"
                              title="Copy verse"
                            >
                              <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                                <Check className={`w-3.5 h-3.5 text-emerald-400 absolute transition-[transform,opacity] duration-200 ${
                                  copiedAyahNumber === ayah.numberInSurah ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'
                                }`} />
                                <Copy className={`w-3.5 h-3.5 absolute transition-[transform,opacity] duration-200 ${
                                  copiedAyahNumber === ayah.numberInSurah ? 'scale-50 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
                                }`} />
                              </div>
                            </button>

                            <button
                              onClick={(e) => handleShareVerse(e, ayah, englishAyah)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors hit-area-44"
                              title="Share verse"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Arabic Script Text */}
                        {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ARABIC_ONLY) && (
                          <p
                            className={`text-right font-quran leading-[2.4] mb-6 transition-colors duration-250 ${
                              isActive ? 'text-white' : 'text-white/80'
                            }`}
                            dir="rtl"
                            style={{ fontSize: `${displayArabicSize}px` }}
                          >
                            {ayah.text}
                          </p>
                        )}

                        {/* English Translation Text */}
                        {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ENGLISH_ONLY) && englishAyah && (
                          <p
                            className={`text-left font-sans leading-relaxed transition-colors duration-250 ${
                              isActive ? 'text-white/95 font-normal' : 'text-muted'
                            }`}
                            style={{ fontSize: `${displayTranslationSize}px` }}
                          >
                            {englishAyah.text}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          3. BOTTOM DOCKED BAR: Madani Mushaf Translation Dock vs Standard Player
         ========================================================================= */}
      {viewMode === 'mushaf' ? (
        <MushafBottomBar
          currentSurah={currentSurah}
          activeVerseKey={activeVerseKey}
          activeTranslation={activeTranslationText}
          selectedReciter={selectedReciter}
          pageNumber={mushafPage}
          juzNumber={getJuzForPage(mushafPage)}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={audioActions.togglePlay}
          onNextAyah={audioActions.nextAyah}
          onPrevAyah={audioActions.prevAyah}
          onSeek={audioActions.seek}
          speed={speed}
          onSpeedChange={audioActions.setSpeed}
          verseRepeatLimit={verseRepeatLimit}
          onRepeatToggle={handleRepeatToggle}
          sleepTimer={sleepTimer}
          onSleepTimerToggle={handleSleepTimerToggle}
          pageTheme={pageTheme}
          onTogglePageTheme={togglePageTheme}
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
          isMobile={isMobile}
        />
      ) : (
        <footer className="h-[76px] bg-[var(--bg-sidebar)]/90 backdrop-blur-2xl border-t border-[var(--border)] relative z-40 flex flex-col justify-between p-3 sm:px-6 shadow-2xl flex-shrink-0">
          {/* Full-Width Liquid Scrubber (GPU-Accelerated transform scaleX, No Reflow) */}
          <div className="absolute top-0 inset-x-0 h-1.5 hover:h-2.5 group transition-[height] duration-150 cursor-pointer z-50">
            <div className="absolute inset-0 bg-white/[0.08]" />
            <div
              className="absolute top-0 left-0 h-full w-full bg-accent origin-left transition-transform duration-150 shadow-[0_0_10px_var(--accent)]"
              style={{
                transform: `scaleX(${progress / 100})`,
                transitionTimingFunction: 'linear'
              }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => audioActions.seek(Number(e.target.value))}
              className="absolute -top-3.5 inset-x-0 w-full h-8 opacity-0 cursor-pointer hit-area-44"
              aria-label="Audio scrubber"
            />
          </div>

          {/* Player Controls Row */}
          <div className="flex items-center justify-between gap-3 h-full max-w-6xl mx-auto w-full pt-1">
            {/* Left: Clean Now Playing Typography */}
            <div className="min-w-0 max-w-[200px] sm:max-w-xs">
              <div className="text-xs sm:text-sm font-semibold text-white truncate">
                {currentSurah?.englishName || 'HearQuran'}
              </div>
              <div className="text-[10px] sm:text-xs text-muted truncate tabular-nums">
                {verseNumber ? `Ayah ${verseNumber} • ` : ''}{selectedReciter?.englishName}
              </div>
            </div>

            {/* Center: Playback Core Controls */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-3 sm:gap-6">
                {/* Skip Back */}
                <button
                  onClick={audioActions.prevAyah}
                  disabled={isRadioMode}
                  className={`p-2 text-muted hover:text-white transition-colors btn-press hit-area-44 ${
                    isRadioMode ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  title="Previous Ayah (←)"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play / Pause (Apple Sonic Blue Circular Button with Dual-Icon Morph) */}
                <button
                  onClick={audioActions.togglePlay}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-transform flex-shrink-0 hit-area-44 btn-press relative overflow-hidden"
                  title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                >
                  {isBuffering ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <Pause className={`w-5 h-5 fill-current absolute transition-[transform,opacity] duration-150 ${
                        isPlaying ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'
                      }`} />
                      <Play className={`w-5 h-5 fill-current ml-0.5 absolute transition-[transform,opacity] duration-150 ${
                        isPlaying ? 'scale-50 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
                      }`} />
                    </div>
                  )}
                </button>

                {/* Skip Forward */}
                <button
                  onClick={audioActions.nextAyah}
                  disabled={isRadioMode}
                  className={`p-2 text-muted hover:text-white transition-colors btn-press hit-area-44 ${
                    isRadioMode ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  title="Next Ayah (→)"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Time Indicators (Tabular Numerals to Prevent Jitter) */}
              <div className="flex items-center gap-2 text-[10px] font-mono tabular-nums text-muted/80">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Audio Utility Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Repeat Pill */}
              <button
                onClick={handleRepeatToggle}
                disabled={isFullSurahAudio || isRadioMode}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors btn-press hit-area-44 ${
                  verseRepeatLimit !== 1
                    ? 'text-accent font-bold bg-accent/15'
                    : 'text-muted hover:text-white hover:bg-white/[0.05]'
                } ${isFullSurahAudio || isRadioMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                title={`Repeat: ${getRepeatText(verseRepeatLimit)}`}
              >
                <Repeat className="w-4 h-4" />
                {verseRepeatLimit !== 1 && (
                  <span className="text-[10px] font-mono tabular-nums">{verseRepeatLimit === -1 ? '∞' : `${verseRepeatLimit}x`}</span>
                )}
              </button>

              {/* Sleep Timer Pill */}
              <button
                onClick={handleSleepTimerToggle}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors btn-press hit-area-44 ${
                  sleepTimer !== null
                    ? 'text-accent font-bold bg-accent/15'
                    : 'text-muted hover:text-white hover:bg-white/[0.05]'
                }`}
                title={sleepTimer ? `Sleep Timer: ${sleepTimer}m` : 'Set Sleep Timer'}
              >
                <Clock className="w-4 h-4" />
                {sleepTimer !== null && (
                  <span className="text-[10px] font-mono tabular-nums">{sleepTimer}m</span>
                )}
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* =========================================================================
          4. SLIDE-OVER SETTINGS DRAWER: Apple Inset Grouped Preferences with Exit Animation
         ========================================================================= */}
      {isSettingsMounted && (
        <div
          className={`fixed inset-0 z-50 flex justify-end transition-opacity ${
            isSettingsExiting ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transitionDuration: isSettingsExiting ? '200ms' : '280ms',
            transitionTimingFunction: isSettingsExiting ? 'var(--ease-apple-in)' : 'var(--ease-apple-out)'
          }}
        >
          <div
            onClick={closeSettings}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div
            className={`relative w-full max-w-sm bg-[var(--bg-sidebar)]/95 backdrop-blur-2xl border-l border-[var(--border)] h-full shadow-2xl p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between z-10 transition-transform ${
              isSettingsExiting ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{
              transitionDuration: isSettingsExiting ? '200ms' : '280ms',
              transitionTimingFunction: isSettingsExiting ? 'var(--ease-apple-in)' : 'var(--ease-apple-out)'
            }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-base text-white">Preferences</h3>
                </div>
                <button
                  onClick={closeSettings}
                  className="p-1.5 text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors hit-area-44"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Group 1: Typography */}
              <div className="space-y-4 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Typography</h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Arabic Font Size</span>
                    <span className="font-mono tabular-nums text-accent">{arabicFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="96"
                    value={arabicFontSize}
                    onChange={(e) => setArabicFontSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Translation Font Size</span>
                    <span className="font-mono tabular-nums text-accent">{translationFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="32"
                    value={translationFontSize}
                    onChange={(e) => setTranslationFontSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>

              {/* Group 2: Horizontal Reading Space (Sliders) */}
              <div className="space-y-4 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Horizontal Space</h4>
                  <button
                    onClick={() => {
                      setReadingWidth(1800);
                      setHorizontalPadding(0);
                    }}
                    className="text-[10px] text-accent hover:underline font-semibold"
                  >
                    Set Max (Border to Border)
                  </button>
                </div>

                {/* Slider 1: Reading Width */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Reading Width</span>
                    <span className="font-mono tabular-nums text-accent font-semibold">
                      {readingWidth >= 1800 ? 'Max (Border to Border)' : `${readingWidth}px`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="1800"
                    step="20"
                    value={readingWidth}
                    onChange={(e) => setReadingWidth(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-muted/60 font-mono">
                    <span>Compact (600px)</span>
                    <span>Max (100% Border)</span>
                  </div>
                </div>

                {/* Slider 2: Side Margins */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Side Margin Inset</span>
                    <span className="font-mono tabular-nums text-accent font-semibold">
                      {horizontalPadding === 0 ? '0px (Flush Border)' : `${horizontalPadding}px`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    step="4"
                    value={horizontalPadding}
                    onChange={(e) => setHorizontalPadding(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-muted/60 font-mono">
                    <span>0px (Flush Border)</span>
                    <span>48px</span>
                  </div>
                </div>
              </div>

              {/* Group 3: Display Script Mode */}
              <div className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Display Mode</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setDisplayMode(DisplayMode.BOTH)}
                    className={`py-2 text-xs font-semibold rounded-xl transition-colors ${
                      displayMode === DisplayMode.BOTH
                        ? 'bg-accent text-white shadow-xs'
                        : 'bg-white/[0.05] text-muted hover:text-white'
                    }`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setDisplayMode(DisplayMode.ARABIC_ONLY)}
                    className={`py-2 text-xs font-semibold rounded-xl transition-colors ${
                      displayMode === DisplayMode.ARABIC_ONLY
                        ? 'bg-accent text-white shadow-xs'
                        : 'bg-white/[0.05] text-muted hover:text-white'
                    }`}
                  >
                    Arabic
                  </button>
                  <button
                    onClick={() => setDisplayMode(DisplayMode.ENGLISH_ONLY)}
                    className={`py-2 text-xs font-semibold rounded-xl transition-colors ${
                      displayMode === DisplayMode.ENGLISH_ONLY
                        ? 'bg-accent text-white shadow-xs'
                        : 'bg-white/[0.05] text-muted hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Group 4: Verse Pause (Reflection Delay) */}
              <div className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verse Reflection Pause</h4>
                <p className="text-[11px] text-muted leading-tight">
                  Pause after each Ayah for reflection or repetition before moving to the next.
                </p>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {([0, 1, 2, 3, 'equal'] as const).map((delay) => (
                    <button
                      key={String(delay)}
                      onClick={() => audioActions.setVersePauseDelay(delay)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        versePauseDelay === delay
                          ? 'bg-accent text-white shadow-xs'
                          : 'bg-white/[0.05] text-muted hover:text-white'
                      }`}
                    >
                      {delay === 0 ? 'Off' : delay === 'equal' ? 'Equal' : `${delay}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group 5: Shortcuts Helper */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-muted space-y-1.5">
                <div className="font-semibold text-white">Keyboard Shortcuts</div>
                <div className="flex justify-between"><span>Play / Pause</span><kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">Space</kbd></div>
                <div className="flex justify-between"><span>Previous / Next Ayah</span><kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">← / →</kbd></div>
                <div className="flex justify-between"><span>Toggle Sidebar</span><kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">⌘B</kbd></div>
                <div className="flex justify-between"><span>Close Overlays / Modals</span><kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">Esc</kbd></div>
                <div className="flex justify-between"><span>Fullscreen Mode</span><kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">F</kbd></div>
              </div>
            </div>

            <div className="pt-6 text-center text-[10px] text-muted/60">
              HearQuran • Minimalist Listening Platform
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
