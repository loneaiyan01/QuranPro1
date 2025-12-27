import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ScrollingVerseDisplay from './components/ScrollingVerseDisplay';
import PlayerControls from './components/PlayerControls';
import DynamicIsland from './components/DynamicIsland';
import { fetchReciters, fetchSurahs, fetchSurahText, fetchSurahAudio } from './services/api';
import { Surah, Reciter, SurahContent, AudioAyah, DisplayMode, Theme } from './types';
import { Menu } from 'lucide-react';

function App() {
  // Data State
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [surahText, setSurahText] = useState<{ arabic: SurahContent; english: SurahContent } | null>(null);
  const [audioData, setAudioData] = useState<AudioAyah[]>([]);

  // Selection State
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);

  // UI State
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Start closed on mobile, logic handles desktop
  const [displayMode, setDisplayMode] = useState<DisplayMode>(DisplayMode.ENGLISH_ONLY);
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [arabicFontSize, setArabicFontSize] = useState<number>(64);
  const [translationFontSize, setTranslationFontSize] = useState<number>(20);

  // Audio State - Dual buffer system for seamless transitions
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const isTransitioning = useRef<boolean>(false);
  const fadeRef = useRef<number | null>(null);

  // Helper: Fade In Audio
  const fadeAudioIn = useCallback(() => {
    if (!audioRef.current) return;

    // Clear any existing fade
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
    }

    const audio = audioRef.current;
    audio.volume = 0;
    const duration = 400; // ms
    const step = 0.05;
    const interval = duration * step;

    fadeRef.current = window.setInterval(() => {
      if (audio.volume < 1) {
        audio.volume = Math.min(1, audio.volume + step);
      } else {
        clearInterval(fadeRef.current!);
        fadeRef.current = null;
      }
    }, interval);
  }, []);

  // Derived State
  const isFullSurahAudio = selectedReciter && !selectedReciter.isVerseByVerse;

  // Initialization
  useEffect(() => {
    const init = async () => {
      const [fetchedSurahs, fetchedReciters] = await Promise.all([
        fetchSurahs(),
        fetchReciters()
      ]);
      setSurahs(fetchedSurahs);
      setReciters(fetchedReciters);

      // Defaults
      if (fetchedReciters.length > 0) {
        // Prefer Sudais if available, otherwise first
        const sudais = fetchedReciters.find(r => r.identifier === 'ar.abdurrahmaansudais');
        setSelectedReciter(sudais || fetchedReciters[0]);
      }

      // Load Surah Al-Fatiha by default
      if (fetchedSurahs.length > 0) {
        handleSelectSurah(fetchedSurahs[0]);
      }

      // Sidebar logic: Open by default on large screens
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    init();
  }, []);

  // Effect: Update document theme classes
  useEffect(() => {
    // Remove all theme classes first
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-sepia', 'theme-minimal');

    // Add active theme class
    if (theme === Theme.DARK) {
      root.classList.add('dark');
    } else if (theme === Theme.SEPIA) {
      root.classList.add('theme-sepia');
    } else if (theme === Theme.MINIMAL) {
      root.classList.add('theme-minimal');
    }
  }, [theme]);

  // Effect: Load Audio Data when Surah or Reciter changes
  useEffect(() => {
    if (currentSurah && selectedReciter) {
      const loadAudio = async () => {
        const audio = await fetchSurahAudio(currentSurah.number, selectedReciter.identifier);
        setAudioData(audio);
      };
      loadAudio();
    }
  }, [currentSurah, selectedReciter]);

  // Handler: Select Surah
  const handleSelectSurah = async (surah: Surah) => {
    setIsLoadingContent(true);
    setCurrentSurah(surah);
    setCurrentAyahIndex(0); // Reset to first ayah
    setIsPlaying(false);
    setAudioProgress(0);

    // Reset audio source immediately to stop previous playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const textData = await fetchSurahText(surah.number);
    setSurahText(textData);

    // Audio data will be fetched by the other useEffect
    setIsLoadingContent(false);
  };

  // Audio Logic: Source Management with Preloading
  useEffect(() => {
    // If not VBV, we just play index 0 (the full file)
    const targetIndex = isFullSurahAudio ? 0 : currentAyahIndex;

    if (audioData.length > 0 && audioRef.current && targetIndex < audioData.length) {
      const audioUrl = audioData[targetIndex]?.audio;

      if (audioUrl && audioRef.current.src !== audioUrl) {
        // Save current play state
        const wasPlaying = isPlaying || isTransitioning.current;
        isTransitioning.current = false;

        audioRef.current.src = audioUrl;
        audioRef.current.volume = 0; // Prepare for fade
        audioRef.current.load();

        if (wasPlaying) {
          audioRef.current.play().catch(e => {
            console.error("Autoplay prevented or failed", e);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentAyahIndex, audioData, isFullSurahAudio]);

  // Audio Logic: Preload Next Verse (Only for VBV mode)
  useEffect(() => {
    if (!isFullSurahAudio && audioData.length > 0 && currentAyahIndex < audioData.length - 1) {
      const nextAudioUrl = audioData[currentAyahIndex + 1]?.audio;
      if (nextAudioUrl && preloadAudioRef.current) {
        preloadAudioRef.current.src = nextAudioUrl;
        preloadAudioRef.current.load();
      }
    }
  }, [currentAyahIndex, audioData, isFullSurahAudio]);

  // Audio Logic: Play/Pause Toggle
  const togglePlay = () => {
    if (!audioRef.current || audioData.length === 0) return;

    const targetIndex = isFullSurahAudio ? 0 : currentAyahIndex;
    if (!audioData[targetIndex]) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.volume = 0; // Prepare for fade
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  // Audio Logic: Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      if (isFullSurahAudio) {
        // In full surah mode (single file), just stop at end
        setIsPlaying(false);
        setAudioProgress(0);
        return;
      }

      // Auto-sync: Move to next ayah with seamless transition
      if (surahText && currentAyahIndex < surahText.arabic.ayahs.length - 1) {
        // Mark that we're transitioning to prevent pause state flicker
        isTransitioning.current = true;
        setCurrentAyahIndex(prev => prev + 1);
        // Keep playing state true during transition
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        setAudioProgress(0);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      fadeAudioIn();
    };

    const handlePause = () => {
      // Ignore pause events during transitions to prevent state flicker
      if (!audio.ended && !isTransitioning.current) {
        setIsPlaying(false);
      }
    };

    const handleCanPlayThrough = () => {
      // When the audio is ready to play without buffering, 
      // immediately start if we were transitioning
      if (isTransitioning.current && isPlaying) {
        audio.volume = 0; // Prepare for fade
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [currentAyahIndex, surahText, isPlaying, isFullSurahAudio, fadeAudioIn]);

  // Navigation Handlers
  const handleNext = () => {
    if (isFullSurahAudio) return; // Disable next in full surah mode
    if (surahText && currentAyahIndex < surahText.arabic.ayahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (isFullSurahAudio) return; // Disable prev in full surah mode
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(prev => prev - 1);
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current && duration) {
      const time = (value / 100) * duration;
      audioRef.current.currentTime = time;
      setAudioProgress(value);
    }
  };

  // Media Session API Integration
  useEffect(() => {
    if ('mediaSession' in navigator && selectedReciter && currentSurah) {
      const artworkUrl = `/assets/reciters/${selectedReciter.identifier}.png`;
      // Use fallback if artwork is missing (handled by the browser or we can check exists)

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSurah.englishName,
        artist: selectedReciter.name, // Use 'name' property for reciter
        album: 'Tarteela',
        artwork: [
          { src: artworkUrl, sizes: '512x512', type: 'image/png' },
          { src: '/assets/reciters/default.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (!isFullSurahAudio && currentAyahIndex > 0) {
          setCurrentAyahIndex(prev => prev - 1);
        }
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (!isFullSurahAudio && surahText && currentAyahIndex < surahText.arabic.ayahs.length - 1) {
          setCurrentAyahIndex(prev => prev + 1);
        }
      });
    }
  }, [selectedReciter, currentSurah, currentAyahIndex, isPlaying, isFullSurahAudio, surahText, togglePlay]);

  return (
    <div className="flex h-screen w-full relative overflow-hidden">

      {/* Dynamic Island */}
      <DynamicIsland
        isPlaying={isPlaying}
        reciter={selectedReciter}
        currentSurah={currentSurah}
      />

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="auto" />
      <audio ref={preloadAudioRef} preload="auto" />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        surahs={surahs}
        currentSurah={currentSurah}
        onSelectSurah={handleSelectSurah}
        reciters={reciters}
        selectedReciter={selectedReciter}
        onSelectReciter={setSelectedReciter}
        displayMode={displayMode}
        onSetDisplayMode={setDisplayMode}
        theme={theme}
        onSetTheme={setTheme}
        arabicFontSize={arabicFontSize}
        onSetArabicFontSize={setArabicFontSize}
        translationFontSize={translationFontSize}
        onSetTranslationFontSize={setTranslationFontSize}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 relative ${isSidebarOpen ? 'lg:ml-80' : ''}`}>

        {/* Top Mobile Bar */}
        <div className="lg:hidden absolute top-0 left-0 p-4 z-20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-white/80 dark:bg-emerald-900/80 rounded-full shadow-sm backdrop-blur-sm text-emerald-900 dark:text-emerald-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Sidebar Toggle (Optional, for Zen Mode) */}
        <div className="hidden lg:block absolute top-4 left-4 z-20">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-transparent hover:bg-gray-100 dark:hover:bg-emerald-800 rounded-lg text-gray-400 hover:text-emerald-600 transition-colors"
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Verse Display Area */}
        <main className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
          {/* h-full is important for scrolling container */}

          <ScrollingVerseDisplay
            arabicSurah={surahText?.arabic}
            englishSurah={surahText?.english}
            displayMode={displayMode}
            isLoading={isLoadingContent}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            currentAyahIndex={currentAyahIndex}
            isVerseByVerse={!isFullSurahAudio}
            arabicFontSize={arabicFontSize}
            translationFontSize={translationFontSize}
          />

        </main>

        {/* Player Controls */}
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onNext={handleNext}
          onPrev={handlePrev}
          progress={audioProgress}
          onSeek={handleSeek}
          currentTime={currentTime}
          duration={duration}
          surahName={currentSurah?.englishName}
          reciterName={selectedReciter?.name}
          verseNumber={surahText?.arabic.ayahs[currentAyahIndex]?.numberInSurah}
        />
      </div>

    </div>
  );
}

export default App;