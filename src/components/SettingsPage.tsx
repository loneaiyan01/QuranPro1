import React from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import { DisplayMode } from '../types';
import { getRepeatText } from '../utils/formatTime';
import { 
  Settings, 
  Type, 
  Layout, 
  User, 
  Clock, 
  Repeat
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { reciters, selectedReciter, actions: quranActions } = useQuran();
  
  const {
    sleepTimer,
    verseRepeatLimit,
    isFullSurahAudio,
    actions: { setSleepTimer, setVerseRepeatLimit }
  } = useAudio();

  const {
    displayMode,
    setDisplayMode,
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize
  } = useTheme();

  const handleRepeatToggle = (limit: number) => {
    setVerseRepeatLimit(limit);
  };



  return (
    <div className="flex-1 overflow-y-auto px-4 pt-24 pb-28 md:py-12 lg:px-12 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header section */}
        <div className="border-b border-[var(--border)] pb-6">
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-main flex items-center gap-2">
            <Settings className="w-6 h-6 md:w-8 md:h-8 text-accent" />
            Preferences
          </h1>
          <p className="text-xs text-muted mt-1">
            Personalize your reading, audio, and visual experiences.
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Typography Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border)] space-y-6">
            <h3 className="text-sm font-bold text-main flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Type className="w-4 h-4 text-accent" />
              Typography Size
            </h3>
            
            {/* Arabic font size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Arabic Font Size</span>
                <span className="font-mono text-accent font-semibold">{arabicFontSize}px</span>
              </div>
              <input
                type="range"
                min="32"
                max="120"
                value={arabicFontSize}
                onChange={(e) => setArabicFontSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-sidebar)] rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* English translation size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Translation Font Size</span>
                <span className="font-mono text-accent font-semibold">{translationFontSize}px</span>
              </div>
              <input
                type="range"
                min="14"
                max="48"
                value={translationFontSize}
                onChange={(e) => setTranslationFontSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[var(--bg-sidebar)] rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          {/* Display Mode Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border)] space-y-6">
            <h3 className="text-sm font-bold text-main flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Layout className="w-4 h-4 text-accent" />
              Display Layout
            </h3>
            <p className="text-[11px] text-muted leading-relaxed">
              Select which language views to display in the main reading view.
            </p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                onClick={() => setDisplayMode(DisplayMode.ENGLISH_ONLY)}
                className={`py-3 text-[10px] sm:text-xs px-1 sm:px-2 font-semibold rounded-xl border transition-all active:scale-95 ${
                  displayMode === DisplayMode.ENGLISH_ONLY
                    ? 'bg-accent text-white border-accent shadow-md shadow-accent/15'
                    : 'border-[var(--border)] bg-[var(--bg-sidebar)] text-muted hover:bg-white/5'
                }`}
              >
                English Only
              </button>
              
              <button
                onClick={() => setDisplayMode(DisplayMode.ARABIC_ONLY)}
                className={`py-3 text-[10px] sm:text-xs px-1 sm:px-2 font-semibold rounded-xl border transition-all active:scale-95 ${
                  displayMode === DisplayMode.ARABIC_ONLY
                    ? 'bg-accent text-white border-accent shadow-md shadow-accent/15'
                    : 'border-[var(--border)] bg-[var(--bg-sidebar)] text-muted hover:bg-white/5'
                }`}
              >
                Arabic Only
              </button>
              
              <button
                onClick={() => setDisplayMode(DisplayMode.BOTH)}
                className={`py-3 text-[10px] sm:text-xs px-1 sm:px-2 font-semibold rounded-xl border transition-all active:scale-95 ${
                  displayMode === DisplayMode.BOTH
                    ? 'bg-accent text-white border-accent shadow-md shadow-accent/15'
                    : 'border-[var(--border)] bg-[var(--bg-sidebar)] text-muted hover:bg-white/5'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Audio Settings Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border)] space-y-6">
            <h3 className="text-sm font-bold text-main flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Repeat className="w-4 h-4 text-accent" />
              Verse Repeat Limit
            </h3>
            <p className="text-[11px] text-muted leading-relaxed">
              Helpful for memorization and learning pronunciation. Set the loop repetition limit for individual verses.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, -1].map((limit) => (
                <button
                  key={limit}
                  disabled={isFullSurahAudio}
                  onClick={() => handleRepeatToggle(limit)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all active:scale-95 ${
                    isFullSurahAudio 
                      ? 'opacity-30 cursor-not-allowed text-muted border-[var(--border)] bg-black/10' 
                      : verseRepeatLimit === limit
                        ? 'bg-accent text-white border-accent shadow-md shadow-accent/15'
                        : 'border-[var(--border)] bg-[var(--bg-sidebar)] text-muted hover:bg-white/5'
                  }`}
                >
                  {getRepeatText(limit)}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Timer Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border)] space-y-6">
            <h3 className="text-sm font-bold text-main flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Clock className="w-4 h-4 text-accent" />
              Sleep Timer
            </h3>
            <p className="text-[11px] text-muted leading-relaxed">
              Configure the timer to automatically pause playback after a set duration.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSleepTimer(mins)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all active:scale-95 ${
                    sleepTimer === mins
                      ? 'bg-accent text-white border-accent shadow-md shadow-accent/15'
                      : 'border-[var(--border)] bg-[var(--bg-sidebar)] text-muted hover:bg-white/5'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            {sleepTimer && (
              <button
                onClick={() => setSleepTimer(null)}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 text-red-400 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel Timer ({sleepTimer}m remaining)
              </button>
            )}
          </div>

          {/* Reciter Configuration */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border)] space-y-6 md:col-span-2">
            <h3 className="text-sm font-bold text-main flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <User className="w-4 h-4 text-accent" />
              Active Reciter
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Select your preferred recitation audio. Currently, Muhammad Ayoub and Ali Al Hudaify are supported for verse-by-verse playback.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {reciters.map((reciter) => {
                const isEnabled = reciter.identifier === 'ar.muhammadayyoub' || reciter.identifier === 'ar.hudhaify';
                const isSelected = selectedReciter?.identifier === reciter.identifier;
                return (
                  <button
                    key={reciter.identifier}
                    disabled={!isEnabled}
                    onClick={() => quranActions.selectReciter(reciter)}
                    className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'border-accent bg-accent-muted text-accent shadow-md'
                        : isEnabled
                          ? 'border-[var(--border)] bg-[var(--bg-sidebar)] text-main hover:bg-white/5'
                          : 'border-[var(--border)] bg-black/20 text-muted opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-sm">{reciter.englishName}</h4>
                      <p className="text-[10px] opacity-75">{reciter.name}</p>
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
