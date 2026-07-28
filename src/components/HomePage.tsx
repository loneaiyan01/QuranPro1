import React, { useState, useEffect, useMemo } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { 
  BookOpen, 
  Radio, 
  Search, 
  Clock, 
  Play, 
  Sparkles, 
  Compass, 
  ChevronRight, 
  X,
  History
} from 'lucide-react';
import { Surah, RecentSurahItem } from '../types';
import { JUZ_LIST } from '../utils/juzData';
import { formatRelativeTime } from '../utils/formatTime';

export const HomePage: React.FC = () => {
  const { surahs, actions: quranActions } = useQuran();
  const { actions: audioActions } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'surah' | 'juz'>('surah');
  
  // Last played session & Recently played Surahs state
  const [sessionData, setSessionData] = useState<{
    surahNumber: number;
    surahEnglishName: string;
    ayahIndex: number;
    timestamp: number;
  } | null>(null);

  const [recentSurahs, setRecentSurahs] = useState<RecentSurahItem[]>([]);

  useEffect(() => {
    try {
      // 1. Last single session
      const savedSession = localStorage.getItem('tarteela_last_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && (parsed.surahNumber > 1 || parsed.ayahIndex > 0)) {
          setSessionData(parsed);
        }
      }

      // 2. History of recently played Surahs
      const savedHistory = localStorage.getItem('tarteela_recent_surahs');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSurahs(parsed);
          return;
        }
      }

      // Fallback: If history empty, derive first item from single session
      if (savedSession && surahs.length > 0) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.surahNumber) {
          const matchSurah = surahs.find(s => s.number === parsed.surahNumber);
          if (matchSurah) {
            setRecentSurahs([{
              surahNumber: matchSurah.number,
              surahEnglishName: matchSurah.englishName,
              surahEnglishNameTranslation: matchSurah.englishNameTranslation,
              numberOfAyahs: matchSurah.numberOfAyahs,
              revelationType: matchSurah.revelationType,
              ayahIndex: parsed.ayahIndex || 0,
              timestamp: parsed.timestamp || Date.now()
            }]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load recent surahs from localStorage", e);
    }
  }, [surahs]);

  const handleResume = async () => {
    if (!sessionData) return;
    const targetSurah = surahs.find(s => s.number === sessionData.surahNumber);
    if (targetSurah) {
      await quranActions.selectSurah(targetSurah);
      audioActions.setAyahIndex(sessionData.ayahIndex);
      setTimeout(() => {
        audioActions.play();
      }, 300);
    }
  };

  const handleResumeRecent = async (item: RecentSurahItem) => {
    const targetSurah = surahs.find(s => s.number === item.surahNumber);
    if (targetSurah) {
      await quranActions.selectSurah(targetSurah);
      audioActions.setAyahIndex(item.ayahIndex);
      setTimeout(() => {
        audioActions.play();
      }, 300);
    }
  };

  const handlePlaySurah = async (surah: Surah) => {
    await quranActions.selectSurah(surah);
  };

  const handlePlayJuz = async (juz: typeof JUZ_LIST[0]) => {
    const targetSurah = surahs.find(s => s.number === juz.startSurahNumber);
    if (targetSurah) {
      await quranActions.selectSurah(targetSurah);
      audioActions.setAyahIndex(juz.startAyahNumber - 1);
      setTimeout(() => {
        audioActions.play();
      }, 300);
    }
  };

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s =>
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery)
    );
  }, [surahs, searchQuery]);

  const filteredJuzs = useMemo(() => {
    if (!searchQuery) return JUZ_LIST;
    const q = searchQuery.toLowerCase();
    return JUZ_LIST.filter(j =>
      j.number.toString().includes(q) ||
      j.nameEnglish.toLowerCase().includes(q) ||
      j.startSurahName.toLowerCase().includes(q) ||
      j.endSurahName.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-24 pb-28 md:py-12 lg:px-12 custom-scrollbar">
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
            <div 
              className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-sidebar)] p-6 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-main flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  Verse Player
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Select any Surah below to open the verse player with synchronized translations and recitation.
                </p>
              </div>
              <div className="mt-6 text-xs text-muted">
                114 Surahs available
              </div>
            </div>
          )}
        </div>

        {/* Recently Played Surahs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-serif font-bold text-main">Recently Played Surahs</h2>
            </div>
            {recentSurahs.length > 0 && (
              <span className="text-xs text-muted">
                Last {recentSurahs.slice(0, 5).length} listened
              </span>
            )}
          </div>

          {recentSurahs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentSurahs.slice(0, 5).map((item) => (
                <div
                  key={item.surahNumber}
                  onClick={() => handleResumeRecent(item)}
                  className="group cursor-pointer p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] flex flex-col justify-between gap-4 relative"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="w-8 h-8 rounded-xl bg-accent-muted text-accent flex items-center justify-center text-xs font-semibold group-hover:bg-accent group-hover:text-white transition-colors">
                      {item.surahNumber}
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-main group-hover:text-accent transition-colors line-clamp-1">
                      {item.surahEnglishName}
                    </h3>
                    <p className="text-[10px] text-muted line-clamp-1">
                      {item.surahEnglishNameTranslation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[10px]">
                    <span className="text-accent font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      Verse {item.ayahIndex + 1}
                    </span>
                    <span className="text-muted">
                      {item.numberOfAyahs} verses
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-sidebar)] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent-muted text-accent flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-semibold text-main">No Recently Played Surahs</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Select any Surah from the library below to start listening. Your recently played Surahs and verse progress will appear here for easy resuming.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* All Surahs/Juzs Grid with Search */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-2">
            <div className="flex items-center gap-6">
              <button
                onClick={() => { setActiveTab('surah'); setSearchQuery(''); }}
                className={`flex items-center gap-2 pb-3 -mb-2.5 border-b-2 font-serif font-bold text-lg md:text-xl transition-all duration-300 ${
                  activeTab === 'surah'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-main'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>All Surahs</span>
              </button>
              <button
                onClick={() => { setActiveTab('juz'); setSearchQuery(''); }}
                className={`flex items-center gap-2 pb-3 -mb-2.5 border-b-2 font-serif font-bold text-lg md:text-xl transition-all duration-300 ${
                  activeTab === 'juz'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-main'
                }`}
              >
                <Compass className="w-5 h-5" />
                <span>All Juzs</span>
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder={activeTab === 'surah' ? "Search by name or number..." : "Search Juz by number or surah name..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 text-main placeholder-muted"
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

          {/* List Grid based on Active Tab */}
          {activeTab === 'surah' ? (
            filteredSurahs.length > 0 ? (
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
            )
          ) : (
            filteredJuzs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredJuzs.map((juz) => (
                  <div
                    key={juz.number}
                    onClick={() => handlePlayJuz(juz)}
                    className="group cursor-pointer p-4 rounded-xl border border-[var(--border)] hover:border-accent/40 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.97] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-accent-muted text-accent flex items-center justify-center text-xs font-semibold group-hover:scale-105 transition-transform flex-shrink-0">
                        {juz.number}
                      </span>
                      <div>
                        <h4 className="font-semibold text-sm text-main group-hover:text-accent transition-colors line-clamp-1">
                          {juz.nameEnglish}
                        </h4>
                        <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                          {juz.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-medium text-muted uppercase tracking-wider font-mono">
                        {juz.nameArabic}
                      </span>
                      <span className="p-1.5 rounded-lg bg-accent-muted text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 space-y-3">
                <p className="text-sm text-muted">No Juzs found matching "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Clear Search Query
                </button>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};
