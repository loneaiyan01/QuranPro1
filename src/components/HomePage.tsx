import React, { useState, useEffect, useMemo } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { 
  BookOpen, 
  Radio, 
  Search, 
  Clock, 
  Play, 
  Bookmark as BookmarkIcon, 
  Sparkles, 
  Compass, 
  ChevronRight, 
  X,
  Heart
} from 'lucide-react';
import { Surah } from '../types';

export const HomePage: React.FC = () => {
  const { surahs, bookmarks, actions: quranActions } = useQuran();
  const { actions: audioActions } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Last played session state
  const [sessionData, setSessionData] = useState<{
    surahNumber: number;
    surahEnglishName: string;
    ayahIndex: number;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tarteela_last_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.surahNumber > 1 || parsed.ayahIndex > 0)) {
          setSessionData(parsed);
        }
      } catch (e) {
        console.error("Failed to parse last session data", e);
      }
    }
  }, []);

  const handleResume = async () => {
    if (!sessionData) return;
    const targetSurah = surahs.find(s => s.number === sessionData.surahNumber);
    if (targetSurah) {
      await quranActions.selectSurah(targetSurah);
      audioActions.setAyahIndex(sessionData.ayahIndex);
    }
  };

  const handlePlaySurah = async (surah: Surah) => {
    await quranActions.selectSurah(surah);
  };

  const popularSurahsList = useMemo(() => {
    const popularNumbers = [1, 18, 36, 55, 56, 67]; // Al-Fatiha, Al-Kahf, Yaseen, Ar-Rahman, Al-Waqi'ah, Al-Mulk
    return surahs.filter(s => popularNumbers.includes(s.number))
      .sort((a, b) => popularNumbers.indexOf(a.number) - popularNumbers.indexOf(b.number));
  }, [surahs]);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s =>
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery)
    );
  }, [surahs, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-24 pb-44 md:py-12 lg:px-12 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-sidebar)] via-black/40 to-black p-6 md:p-10 shadow-[var(--shadow-lg)]">
          {/* Subtle background graphic */}
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-12 pointer-events-none">
            <Compass className="w-80 h-80 text-accent" />
          </div>
          
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-muted text-accent border border-accent/20 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spiritual Sanctuary</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-main">
              Hear<span className="text-accent">Quran</span>
            </h1>
            <p className="text-sm md:text-base text-muted leading-relaxed">
              Welcome to a premium, minimalist sanctuary for Quranic reflection. 
              Immerse yourself in beautiful, high-quality verse-by-verse recitations with English translations. 
              Designed for focus, memorization, and active spiritual contemplation.
            </p>
          </div>
        </div>

        {/* Dashboard Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radio Mode Card */}
          <div 
            onClick={() => quranActions.toggleRadioMode(true)}
            className="group cursor-pointer relative overflow-hidden rounded-2xl border border-[var(--border)] hover:border-accent/40 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] p-6 shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-main flex items-center gap-2">
                  <Radio className="w-5 h-5 text-accent animate-pulse" />
                  Quran Live Radio
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Start a continuous, tranquil stream of randomly selected Surahs. Perfect for continuous listening and background reflection.
                </p>
              </div>
              <span className="w-10 h-10 rounded-xl bg-accent-muted text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </span>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-accent">
              <span>Start Listening Now</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Continue Listening Session */}
          {sessionData ? (
            <div 
              onClick={handleResume}
              className="group cursor-pointer relative overflow-hidden rounded-2xl border border-[var(--border)] hover:border-accent/40 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] p-6 shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] flex flex-col justify-between"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-main flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    Resume Session
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Pick up where you left off: <strong className="text-main font-semibold">Surah {sessionData.surahEnglishName}</strong> (Verse {sessionData.ayahIndex + 1}).
                  </p>
                </div>
                <span className="w-10 h-10 rounded-xl bg-accent-muted text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </span>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-accent">
                <span>Continue Listening</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ) : (
            // Fallback: Bookmarks quick link or simple stats card
            <div 
              className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-sidebar)] p-6 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-main flex items-center gap-2">
                  <BookmarkIcon className="w-5 h-5 text-accent" />
                  Your Reflections
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Bookmark verses during playback to save them for easy access later. Create your own collection of inspiring passages.
                </p>
              </div>
              <div className="mt-6 text-xs text-muted">
                {bookmarks.length === 0 ? 'No bookmarks saved yet' : `${bookmarks.length} saved bookmarks`}
              </div>
            </div>
          )}
        </div>

        {/* Bookmarks Section (if available) */}
        {bookmarks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-main flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5 text-accent" />
              Bookmarked Verses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.slice(0, 6).map((bookmark) => {
                const targetSurah = surahs.find(s => s.number === bookmark.surahNumber);
                return (
                  <div
                    key={`${bookmark.surahNumber}-${bookmark.ayahNumberInSurah}`}
                    onClick={async () => {
                      if (targetSurah) {
                        await quranActions.selectSurah(targetSurah);
                        audioActions.setAyahIndex(bookmark.ayahNumberInSurah - 1);
                      }
                    }}
                    className="group cursor-pointer p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] hover:border-accent/30 transition-all duration-200 active:scale-[0.97] flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-main">{bookmark.surahEnglishName}</h4>
                      <p className="text-xs text-muted">Verse {bookmark.ayahNumberInSurah}</p>
                    </div>
                    <span className="p-2 bg-accent-muted text-accent rounded-lg group-hover:scale-105 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Popular Surahs Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-serif font-bold text-main">Popular Surahs</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularSurahsList.map((surah) => (
              <div
                key={surah.number}
                onClick={() => handlePlaySurah(surah)}
                className="group cursor-pointer p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 shadow-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.96] flex flex-col justify-between items-center text-center gap-3 relative"
              >
                <span className="w-8 h-8 rounded-full bg-accent-muted text-accent flex items-center justify-center text-xs font-semibold transition-colors group-hover:bg-accent group-hover:text-white">
                  {surah.number}
                </span>
                <div>
                  <h3 className="font-semibold text-sm text-main group-hover:text-accent transition-colors line-clamp-1">
                    {surah.englishName}
                  </h3>
                  <p className="text-[10px] text-muted line-clamp-1 mt-0.5">
                    {surah.englishNameTranslation}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted/60 tracking-wider">
                  {surah.numberOfAyahs} verses
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* All Surahs Grid with Search */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-serif font-bold text-main">All Surahs</h2>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#1C1C1E] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 text-main placeholder-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-main rounded-md hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Surah List Grid */}
          {filteredSurahs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => handlePlaySurah(surah)}
                  className="group cursor-pointer p-4 rounded-xl border border-[var(--border)] hover:border-accent/40 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.97] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-accent-muted text-accent flex items-center justify-center text-xs font-semibold group-hover:scale-105 transition-transform">
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm text-main group-hover:text-accent transition-colors line-clamp-1">
                        {surah.englishName}
                      </h4>
                      <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                        {surah.englishNameTranslation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-medium text-muted uppercase tracking-wider">
                      {surah.revelationType}
                    </span>
                    <p className="text-[10px] text-muted mt-1">{surah.numberOfAyahs} ayahs</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 space-y-3">
              <p className="text-sm text-muted">No Surahs found matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs font-medium text-accent hover:underline"
              >
                Clear Search Query
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
