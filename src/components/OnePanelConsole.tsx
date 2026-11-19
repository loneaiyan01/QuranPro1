import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio, VersePauseDelay } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { RangeModal } from './RangeModal';
import FullscreenTranslationView from './FullscreenTranslationView';
import { formatTime, getRepeatText } from '../utils/formatTime';
import { JUZ_LIST } from '../utils/juzData';
import { HIZB_LIST } from '../utils/hizbData';
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
  BookOpen,
  Compass,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Menu,
  Volume2,
  Layers,
  Trash2
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
    actions: audioActions
  } = useAudio();

  const {
    displayMode,
    setDisplayMode,
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize,
    isFullscreenTranslation,
    setIsFullscreenTranslation
  } = useTheme();

  const isMobile = useIsMobile();

  // Local UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryTab, setDirectoryTab] = useState<'surahs' | 'juz' | 'saved'>('surahs');
  const [isReciterMenuOpen, setIsReciterMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [copiedAyahNumber, setCopiedAyahNumber] = useState<number | null>(null);

  const reciterMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserInteracting = useRef(false);
  const isAutoScrolling = useRef(false);
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close reciter menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (reciterMenuRef.current && !reciterMenuRef.current.contains(e.target as Node)) {
        setIsReciterMenuOpen(false);
      }
    };
    if (isReciterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isReciterMenuOpen]);

  // Keyboard Shortcuts
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const toggleFullscreen = useCallback(() => setIsFullscreenTranslation(!isFullscreenTranslation), [isFullscreenTranslation, setIsFullscreenTranslation]);
  useKeyboardShortcuts({
    togglePlay: audioActions.togglePlay,
    prevAyah: audioActions.prevAyah,
    nextAyah: audioActions.nextAyah,
    toggleSidebar,
    toggleFullscreen
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
    setIsReciterMenuOpen(false);
  };

  // Surah Selection Handler
  const handleSelectSurah = async (surah: Surah) => {
    if (isRadioMode) {
      quranActions.toggleRadioMode(false);
    }
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
    if (!isVerseByVerse || isUserInteracting.current) return;
    const activeVerse = verseRefs.current[currentAyahIndex];
    if (activeVerse && containerRef.current) {
      isAutoScrolling.current = true;
      activeVerse.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentAyahIndex, isVerseByVerse]);

  // Copy Verse Text
  const handleCopyVerse = async (e: React.MouseEvent, ayah: Ayah, englishAyah?: Ayah) => {
    e.stopPropagation();
    let text = ayah.text;
    if (englishAyah?.text) text += '\n\n' + englishAyah.text;
    text += `\n\n— ${currentSurah?.englishName} [${ayah.numberInSurah}]`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAyahNumber(ayah.numberInSurah);
      setTimeout(() => setCopiedAyahNumber(null), 2000);
    } catch { /* clipboard not available */ }
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
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-main active:scale-95 transition-all flex items-center justify-center"
            title="Browse Surahs & Reciters"
          >
            <Menu className="w-4 h-4 text-accent" />
          </button>

          <div className="flex items-center gap-2 flex-shrink-0 cursor-default">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm sm:text-base tracking-tight text-white hidden sm:inline">
              HearQuran
            </span>
          </div>

          {/* Quick Active Status Badge (Desktop) */}
          {currentSurah && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-muted truncate max-w-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="font-medium text-white truncate">{currentSurah.englishName}</span>
              <span className="text-[10px] opacity-60">• v{currentAyahIndex + 1}</span>
            </div>
          )}
        </div>

        {/* Center: Spotlight Search Pill */}
        <div className="flex-1 max-w-xs sm:max-w-md relative mx-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={isMobile ? "Search..." : "Search Surah, number, or Juz..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-8 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] border border-[var(--border)] focus:border-accent/50 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent/40 text-white placeholder-muted/70 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Live Radio Toggle */}
          <button
            onClick={handleToggleRadio}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
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
            className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
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
              className={`px-2.5 py-1 rounded-full transition-all ${
                displayMode === DisplayMode.BOTH
                  ? 'bg-accent text-white shadow-xs font-semibold'
                  : 'text-muted hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setDisplayMode(DisplayMode.ARABIC_ONLY)}
              className={`px-2.5 py-1 rounded-full transition-all ${
                displayMode === DisplayMode.ARABIC_ONLY
                  ? 'bg-accent text-white shadow-xs font-semibold'
                  : 'text-muted hover:text-white'
              }`}
            >
              Arabic
            </button>
            <button
              onClick={() => setDisplayMode(DisplayMode.ENGLISH_ONLY)}
              className={`px-2.5 py-1 rounded-full transition-all ${
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
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white border border-white/[0.08] active:scale-95 transition-all"
            title="Immersive Fullscreen TV Mode"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>

          {/* Preferences Settings Gear */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-muted hover:text-white border border-white/[0.08] active:scale-95 transition-all"
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
        {/* Mobile Sidebar Overlay Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          />
        )}

        {/* -----------------------------------------------------------------------
            LEFT PANEL: Surah & Reciter Directory
           ----------------------------------------------------------------------- */}
        <aside
          className={`fixed md:static inset-y-0 left-0 w-80 sm:w-84 xl:w-92 bg-[var(--bg-sidebar)]/95 md:bg-[var(--bg-sidebar)]/70 backdrop-blur-xl border-r border-[var(--border)] z-50 md:z-20 flex flex-col transition-transform duration-300 ease-out flex-shrink-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Header of Sidebar: Reciter Picker Card */}
          <div className="p-3 border-b border-[var(--border)] relative" ref={reciterMenuRef}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Recitation By</span>
              {isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-muted hover:text-white rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsReciterMenuOpen(!isReciterMenuOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-accent/40 active:scale-[0.99] transition-all text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {selectedReciter?.englishName?.charAt(0) || 'R'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {selectedReciter?.englishName || 'Select Reciter'}
                  </div>
                  <div className="text-[10px] text-muted truncate">
                    {selectedReciter?.name} • {selectedReciter?.isVerseByVerse ? 'Verse Sync' : 'Full Audio'}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 flex-shrink-0 ${isReciterMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Reciter Dropdown Popover */}
            {isReciterMenuOpen && (
              <div className="absolute top-full left-3 right-3 mt-1 bg-[var(--bg-card-active)]/95 backdrop-blur-2xl border border-[var(--border)] rounded-2xl shadow-2xl z-50 p-1.5 max-h-72 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                <div className="px-2 py-1 text-[10px] font-bold text-muted uppercase tracking-wider border-b border-white/[0.06] mb-1">
                  Choose Reciter ({reciters.length})
                </div>
                {reciters.map((reciter) => {
                  const isSelected = selectedReciter?.identifier === reciter.identifier;
                  return (
                    <button
                      key={reciter.identifier}
                      onClick={() => handleSelectReciter(reciter)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs mb-0.5 ${
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

          {/* Directory Navigation Tabs */}
          <div className="px-3 pt-2 pb-1.5 flex items-center gap-1 border-b border-[var(--border)] bg-white/[0.01]">
            <button
              onClick={() => setDirectoryTab('surahs')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                directoryTab === 'surahs'
                  ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                  : 'text-muted hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>Surahs ({surahs.length})</span>
            </button>
            <button
              onClick={() => setDirectoryTab('juz')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                directoryTab === 'juz'
                  ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                  : 'text-muted hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Juz (30)</span>
            </button>
            <button
              onClick={() => setDirectoryTab('saved')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                directoryTab === 'saved'
                  ? 'bg-accent/15 text-accent font-bold border border-accent/25'
                  : 'text-muted hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <BookmarkIcon className="w-3 h-3" />
              <span>Saved ({bookmarks.length})</span>
            </button>
          </div>

          {/* Directory Content List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {directoryTab === 'surahs' && (
              filteredSurahs.length > 0 ? (
                filteredSurahs.map((surah) => {
                  const isActive = currentSurah?.number === surah.number && !isRadioMode;
                  return (
                    <button
                      key={surah.number}
                      onClick={() => handleSelectSurah(surah)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 active:scale-[0.99] group ${
                        isActive
                          ? 'bg-accent/15 border border-accent/40 text-white font-medium shadow-xs'
                          : 'hover:bg-white/[0.05] border border-transparent text-muted hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-mono flex items-center justify-center font-bold flex-shrink-0 transition-colors ${
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
              filteredJuzs.map((juz) => (
                <button
                  key={juz.number}
                  onClick={() => handleSelectJuz(juz)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all text-muted hover:text-white group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-lg text-[10px] font-mono bg-white/[0.06] text-accent flex items-center justify-center font-bold flex-shrink-0">
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
                    className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white group-hover:text-accent transition-colors truncate">
                        {bookmark.surahEnglishName}
                      </div>
                      <div className="text-[10px] text-muted">
                        Ayah {bookmark.ayahNumberInSurah}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          quranActions.toggleBookmark(bookmark.surahNumber, bookmark.surahEnglishName, bookmark.ayahNumberInSurah);
                        }}
                        className="p-1 text-muted hover:text-red-400 rounded-md transition-colors"
                        title="Remove bookmark"
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
          className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 pt-6 pb-28 custom-scrollbar scroll-smooth"
        >
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Ambient Active Banners (Radio / Range / Pause) */}
            {isRadioMode && (
              <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-between gap-3 text-xs text-white animate-in fade-in duration-300">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-accent">Quran Live Radio</span> — Continuous peaceful recitation stream
                  </div>
                </div>
                <button
                  onClick={() => quranActions.toggleRadioMode(false)}
                  className="px-2.5 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                >
                  Exit Radio
                </button>
              </div>
            )}

            {playbackRange && (
              <div className="p-3 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-between gap-3 text-xs text-accent animate-in fade-in duration-300">
                <div className="flex items-center gap-2 truncate">
                  <SlidersHorizontal className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">
                    Active Range Loop: {currentSurah?.englishName} (v{playbackRange.startAyahIndex + 1} – v{playbackRange.endAyahIndex + 1})
                  </span>
                </div>
                <button
                  onClick={() => audioActions.setPlaybackRange(null)}
                  className="p-1 text-accent hover:text-white"
                  title="Clear loop"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isPausingBetweenVerses && (
              <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-center text-xs text-accent font-medium flex items-center justify-center gap-2 animate-pulse">
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
                  <p className="text-xs sm:text-sm text-muted">
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

            {/* Error or Loading States */}
            {isLoadingContent && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <span className="text-xs">Loading holy verses...</span>
              </div>
            )}

            {contentError && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3 max-w-sm mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                <div className="text-xs text-muted">{contentError}</div>
                <button
                  onClick={() => quranActions.retryLoadContent()}
                  className="px-4 py-2 bg-accent text-white text-xs font-semibold rounded-xl active:scale-95 transition-all"
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
                      className={`group p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-500 border ${
                        isVerseByVerse ? 'cursor-pointer' : ''
                      } ${
                        isActive
                          ? 'bg-white/[0.04] border-accent/40 shadow-2xl scale-[1.01] border-l-4 border-l-accent'
                          : 'bg-transparent border-transparent opacity-35 hover:opacity-85 hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Verse Header Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold flex items-center justify-center transition-all ${
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
                              }
                            }}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                              isBookmarked ? 'text-accent' : 'text-muted hover:text-white'
                            }`}
                            title={isBookmarked ? "Remove bookmark" : "Bookmark this verse"}
                          >
                            <BookmarkIcon className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => handleCopyVerse(e, ayah, englishAyah)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
                            title="Copy verse"
                          >
                            {copiedAyahNumber === ayah.numberInSurah ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleShareVerse(e, ayah, englishAyah)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
                            title="Share verse"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Arabic Script Text */}
                      {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ARABIC_ONLY) && (
                        <p
                          className={`text-right font-quran leading-[2.4] mb-6 transition-all duration-300 ${
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
                          className={`text-left font-sans leading-relaxed transition-all duration-300 ${
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
        </main>
      </div>

      {/* =========================================================================
          3. BOTTOM DOCKED BAR: Apple Music-Grade Persistent Player (Height: 76px)
         ========================================================================= */}
      <footer className="h-[76px] bg-[var(--bg-sidebar)]/90 backdrop-blur-2xl border-t border-[var(--border)] relative z-40 flex flex-col justify-between p-3 sm:px-6 shadow-2xl flex-shrink-0">
        {/* Full-Width Liquid Scrubber */}
        <div className="absolute top-0 inset-x-0 h-1 hover:h-2 group transition-all cursor-pointer z-50">
          <div className="absolute inset-0 bg-white/[0.08]" />
          <div
            className="absolute top-0 left-0 h-full bg-accent transition-all duration-150 ease-linear shadow-[0_0_10px_var(--accent)]"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => audioActions.seek(Number(e.target.value))}
            className="absolute -top-2 inset-x-0 w-full h-5 opacity-0 cursor-pointer"
            aria-label="Audio scrubber"
          />
        </div>

        {/* Player Controls Row */}
        <div className="flex items-center justify-between gap-3 h-full max-w-6xl mx-auto w-full pt-1">
          {/* Left: Now Playing Info */}
          <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-xs">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 text-accent flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-white truncate">
                {currentSurah?.englishName || 'HearQuran'}
              </div>
              <div className="text-[10px] sm:text-xs text-muted truncate">
                {verseNumber ? `Ayah ${verseNumber} • ` : ''}{selectedReciter?.englishName}
              </div>
            </div>
          </div>

          {/* Center: Playback Core Controls */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Skip Back */}
              <button
                onClick={audioActions.prevAyah}
                disabled={isRadioMode}
                className={`p-2 text-muted hover:text-white active:scale-95 transition-all ${
                  isRadioMode ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                title="Previous Ayah"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Play / Pause (Apple Sonic Blue Circular Button) */}
              <button
                onClick={audioActions.togglePlay}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isBuffering ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Skip Forward */}
              <button
                onClick={audioActions.nextAyah}
                disabled={isRadioMode}
                className={`p-2 text-muted hover:text-white active:scale-95 transition-all ${
                  isRadioMode ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                title="Next Ayah"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Time Indicators */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted/80">
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
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                verseRepeatLimit !== 1
                  ? 'text-accent font-bold bg-accent/15'
                  : 'text-muted hover:text-white hover:bg-white/[0.05]'
              } ${isFullSurahAudio || isRadioMode ? 'opacity-30 cursor-not-allowed' : ''}`}
              title={`Repeat: ${getRepeatText(verseRepeatLimit)}`}
            >
              <Repeat className="w-4 h-4" />
              {verseRepeatLimit !== 1 && (
                <span className="text-[10px] font-mono">{verseRepeatLimit === -1 ? '∞' : `${verseRepeatLimit}x`}</span>
              )}
            </button>

            {/* Sleep Timer Pill */}
            <button
              onClick={handleSleepTimerToggle}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                sleepTimer !== null
                  ? 'text-accent font-bold bg-accent/15'
                  : 'text-muted hover:text-white hover:bg-white/[0.05]'
              }`}
              title={sleepTimer ? `Sleep Timer: ${sleepTimer}m` : 'Set Sleep Timer'}
            >
              <Clock className="w-4 h-4" />
              {sleepTimer !== null && (
                <span className="text-[10px] font-mono">{sleepTimer}m</span>
              )}
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          4. SLIDE-OVER SETTINGS DRAWER: Apple Inset Grouped Preferences
         ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            onClick={() => setIsSettingsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-sm bg-[var(--bg-sidebar)]/95 backdrop-blur-2xl border-l border-[var(--border)] h-full shadow-2xl p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between z-10 animate-in slide-in-from-right-8 duration-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-base text-white">Preferences</h3>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 text-muted hover:text-white rounded-lg hover:bg-white/10"
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
                    <span className="font-mono text-accent">{arabicFontSize}px</span>
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
                    <span className="font-mono text-accent">{translationFontSize}px</span>
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

              {/* Group 2: Display Script Mode */}
              <div className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Display Mode</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setDisplayMode(DisplayMode.BOTH)}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                      displayMode === DisplayMode.BOTH
                        ? 'bg-accent text-white shadow-xs'
                        : 'bg-white/[0.05] text-muted hover:text-white'
                    }`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setDisplayMode(DisplayMode.ARABIC_ONLY)}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                      displayMode === DisplayMode.ARABIC_ONLY
                        ? 'bg-accent text-white shadow-xs'
                        : 'bg-white/[0.05] text-muted hover:text-white'
                    }`}
                  >
                    Arabic
                  </button>
                  <button
                    onClick={() => setDisplayMode(DisplayMode.ENGLISH_ONLY)}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                      displayMode === DisplayMode.ENGLISH_ONLY
                        ? 'bg-accent text-white shadow-xs'
                        : 'bg-white/[0.05] text-muted hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Group 3: Verse Pause (Reflection Delay) */}
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
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
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

              {/* Group 4: Shortcuts Helper */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-muted space-y-1.5">
                <div className="font-semibold text-white">Keyboard Shortcuts</div>
                <div className="flex justify-between"><span>Play / Pause</span><kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">Space</kbd></div>
                <div className="flex justify-between"><span>Previous / Next Ayah</span><kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">← / →</kbd></div>
                <div className="flex justify-between"><span>Toggle Sidebar</span><kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">Esc</kbd></div>
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
