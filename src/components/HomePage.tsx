import React, { useState, useEffect, useMemo } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { 
  BookOpen, 
  Radio, 
  Search, 
  Clock, 
  Play, 
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pt-24 pb-28 md:py-12 lg:px-12 custom-scrollbar w-full max-w-full box-border">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-full min-w-0">
        
        {/* Quick Action Bar & Surah Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full max-w-full min-w-0">
          {/* Quran Live Radio Button */}
          <button
            onClick={() => quranActions.toggleRadioMode(true)}
            className="group flex-1 flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-[var(--border)] hover:border-accent/40 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] shadow-sm transition-all duration-200 active:scale-[0.98] text-left min-w-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-accent-muted text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-main group-hover:text-accent transition-colors flex items-center gap-2">
                  <span>Quran Live Radio</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-accent/15 text-accent uppercase tracking-wider flex-shrink-0">Live</span>
                </div>
                <p className="text-[10px] text-muted truncate mt-0.5">Continuous peaceful recitation stream</p>
              </div>
            </div>
            <Play className="w-3.5 h-3.5 text-accent fill-current flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Resume Session Button (if active session exists) */}
          {sessionData && (
            <button
              onClick={handleResume}
              className="group flex-1 flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-[var(--border)] hover:border-accent/40 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] shadow-sm transition-all duration-200 active:scale-[0.98] text-left min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-accent-muted text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                  <Clock className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-main group-hover:text-accent transition-colors">
                    Resume Session
                  </div>
                  <p className="text-[10px] text-muted truncate mt-0.5">
                    Surah {sessionData.surahEnglishName} • Verse {sessionData.ayahIndex + 1}
                  </p>
                </div>
              </div>
              <Play className="w-3.5 h-3.5 text-accent fill-current flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Top Surah Search Bar */}
          <div className="flex-1 sm:flex-[1.2] relative min-w-0 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
            <input
              type="text"
              placeholder="Search Surah (e.g. 36, Yaseen, Kahf)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-3 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] border border-[var(--border)] focus:border-accent/60 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 text-main placeholder-muted transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-main rounded-md hover:bg-white/10 transition-colors"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Recently Played Surahs Section */}
        <div className="space-y-3 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <History className="w-4 h-4 text-accent flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-sans font-bold text-main truncate">Recently Played Surahs</h2>
            </div>
            {recentSurahs.length > 0 && (
              <span className="text-[10px] sm:text-[11px] text-muted flex-shrink-0">
                Last {recentSurahs.slice(0, 5).length} listened
              </span>
            )}
          </div>

          {recentSurahs.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1 w-full max-w-full px-0.5 box-border">
              {recentSurahs.slice(0, 5).map((item) => (
                <div
                  key={item.surahNumber}
                  onClick={() => handleResumeRecent(item)}
                  className="group cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] flex flex-col justify-between gap-2.5 w-[155px] sm:w-[180px] flex-shrink-0 relative"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-accent-muted text-accent flex items-center justify-center text-[10px] sm:text-[11px] font-semibold group-hover:bg-accent group-hover:text-white transition-colors">
                      {item.surahNumber}
                    </span>
                    <span className="text-[9px] text-muted font-mono">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <h3 className="font-semibold text-xs text-main group-hover:text-accent transition-colors truncate">
                      {item.surahEnglishName}
                    </h3>
                    <p className="text-[10px] text-muted truncate">
                      {item.surahEnglishNameTranslation}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-[var(--border)]/60 flex items-center justify-between text-[10px]">
                    <span className="text-accent font-semibold flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      v{item.ayahIndex + 1}
                    </span>
                    <span className="text-muted text-[9px]">
                      {item.numberOfAyahs} ayahs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 sm:p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-sidebar)] text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-accent-muted text-accent flex items-center justify-center mx-auto">
                <History className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 max-w-md mx-auto">
                <h3 className="text-xs font-semibold text-main">No Recently Played Surahs</h3>
                <p className="text-[11px] text-muted leading-relaxed">
                  Select any Surah below to start listening. Your recently played Surahs will appear here horizontally.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* All Surahs/Juzs Grid */}
        <div className="space-y-4 sm:space-y-6 w-full max-w-full min-w-0">
          <div className="flex items-center gap-6 border-b border-[var(--border)] pb-2">
            <button
              onClick={() => { setActiveTab('surah'); }}
              className={`flex items-center gap-2 pb-3 -mb-2.5 border-b-2 font-sans font-bold text-base sm:text-lg md:text-xl transition-all duration-300 ${
                activeTab === 'surah'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-main'
              }`}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>All Surahs</span>
            </button>
            <button
              onClick={() => { setActiveTab('juz'); }}
              className={`flex items-center gap-2 pb-3 -mb-2.5 border-b-2 font-sans font-bold text-base sm:text-lg md:text-xl transition-all duration-300 ${
                activeTab === 'juz'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-main'
              }`}
            >
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>All Juzs</span>
            </button>
          </div>

          {/* List Grid based on Active Tab */}
          {activeTab === 'surah' ? (
            filteredSurahs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
                {filteredSurahs.map((surah) => (
                  <div
                    key={surah.number}
                    onClick={() => handlePlaySurah(surah)}
                    className="group cursor-pointer p-3.5 sm:p-4 rounded-xl border border-[var(--border)] hover:border-accent/40 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.97] flex items-center justify-between gap-3 min-w-0 w-full overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent-muted text-accent flex items-center justify-center text-xs font-semibold group-hover:scale-105 transition-transform flex-shrink-0">
                        {surah.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-main group-hover:text-accent transition-colors truncate">
                          {surah.englishName}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-muted truncate mt-0.5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
                {filteredJuzs.map((juz) => (
                  <div
                    key={juz.number}
                    onClick={() => handlePlayJuz(juz)}
                    className="group cursor-pointer p-3.5 sm:p-4 rounded-xl border border-[var(--border)] hover:border-accent/40 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.97] flex items-center justify-between gap-3 min-w-0 w-full overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent-muted text-accent flex items-center justify-center text-xs font-semibold group-hover:scale-105 transition-transform flex-shrink-0">
                        {juz.number}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-main group-hover:text-accent transition-colors truncate">
                          {juz.nameEnglish}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-muted truncate mt-0.5">
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
