import React from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAudio } from '../contexts/AudioContext';
import { DisplayMode, Theme, FullscreenLayoutMode } from '../types';
import { BookOpen, User, Settings, Moon, Sun, X, Search, Palette, Radio, Clock, Bookmark as BookmarkIcon, Tv } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    surahs,
    currentSurah,
    reciters,
    selectedReciter,
    isRadioMode,
    bookmarks,
    actions
  } = useQuran();

  const {
    sleepTimer,
    actions: { setSleepTimer, setAyahIndex }
  } = useAudio();

  const {
    displayMode,
    setDisplayMode,
    arabicFontSize,
    setArabicFontSize,
    translationFontSize,
    setTranslationFontSize,
    theme,
    setTheme,
    isFullscreenTranslation,
    setIsFullscreenTranslation,
    fullscreenLayoutMode,
    setFullscreenLayoutMode
  } = useTheme();

  const [activeTab, setActiveTab] = React.useState<'surahs' | 'settings' | 'radio' | 'bookmarks'>('surahs');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const filteredSurahs = surahs.filter(s =>
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.toString().includes(searchQuery)
  );

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 w-[85vw] md:w-80 bg-sidebar shadow-[var(--shadow-lg)] transform transition-transform duration-300 ease-in-out z-[100] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-sidebar">
          <button
            onClick={() => {
              actions.resetToHome();
              onClose();
            }}
            className="text-xl font-serif font-bold text-accent hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0 cursor-pointer"
          >
            HearQuran
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 hover:bg-[var(--accent-muted)] rounded-full text-muted transition-colors z-50"
            aria-label="Close Sidebar"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] bg-sidebar">
          <button
            className={`flex-1 py-4 text-[11px] md:text-xs font-semibold transition-colors ${activeTab === 'surahs' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            onClick={() => setActiveTab('surahs')}
          >
            Surahs
          </button>
          <button
            className={`flex-1 py-4 text-[11px] md:text-xs font-semibold transition-colors ${activeTab === 'bookmarks' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Bookmarks
          </button>
          <button
            className={`flex-1 py-4 text-[11px] md:text-xs font-semibold transition-colors ${activeTab === 'radio' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            onClick={() => setActiveTab('radio')}
          >
            Radio
          </button>
          <button
            className={`flex-1 py-4 text-[11px] md:text-xs font-semibold transition-colors ${activeTab === 'settings' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'surahs' && (
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search Surah..."
                  className="w-full pl-9 pr-4 py-2 bg-[#1C1C1E] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 text-main"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                {filteredSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => {
                      if (isRadioMode) {
                        actions.toggleRadioMode(false);
                      }
                      actions.selectSurah(surah);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${currentSurah?.number === surah.number
                      ? 'bg-accent-muted text-accent'
                      : 'hover:bg-accent-muted/50 text-main'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${currentSurah?.number === surah.number
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-accent-muted text-accent'
                        }`}>
                        {surah.number}
                      </span>
                      <div>
                        <p className="font-semibold text-sm md:text-base">{surah.englishName}</p>
                        <p className="text-[10px] md:text-xs opacity-70">{surah.englishNameTranslation}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'radio' && (
            <div className="p-8 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] space-y-6">
              <div className={`w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center relative ${isRadioMode ? 'after:content-[""] after:absolute after:inset-0 after:rounded-full after:border-2 after:border-accent after:animate-ping' : ''}`}>
                <Radio className={`w-12 h-12 ${isRadioMode ? 'text-accent animate-pulse' : 'text-muted'}`} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-main">HearQuran Radio</h3>
                <p className="text-sm text-muted px-4">Immerse yourself in a random selection of the world's most beautiful recitations.</p>
              </div>
              <button
                onClick={() => {
                  actions.toggleRadioMode(!isRadioMode);
                  onClose();
                }}
                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 ${isRadioMode
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200/50'
                  : 'bg-accent text-white hover:scale-[1.02] shadow-accent/20'}`}
              >
                {isRadioMode ? 'Disable Radio Mode' : 'Enter Radio Mode'}
              </button>
              {isRadioMode && (
                <button
                  onClick={() => actions.nextRadioSurah()}
                  className="text-xs font-medium text-accent hover:underline underline-offset-4"
                >
                  Skip to Next Random Surah
                </button>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 space-y-8">
              {/* Display Mode */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Display Mode</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setToastMessage('Arabic Display Mode is coming soon!');
                    }}
                    className="px-3 py-2 text-sm rounded-md border border-[var(--border)] text-muted opacity-40 cursor-not-allowed transition-all"
                  >
                    Arabic
                  </button>
                  <button
                    onClick={() => {
                      setDisplayMode(DisplayMode.ENGLISH_ONLY);
                    }}
                    className={`px-3 py-2 text-sm rounded-md border transition-all ${displayMode === DisplayMode.ENGLISH_ONLY ? 'bg-accent text-white border-accent shadow-sm' : 'border-[var(--border)] text-muted hover:bg-black/5'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setToastMessage('Both (Arabic & English) Display Mode is coming soon!');
                    }}
                    className="px-3 py-2 text-sm rounded-md border border-[var(--border)] text-muted opacity-40 cursor-not-allowed transition-all"
                  >
                    Both
                  </button>
                </div>
              </div>



              {/* Reciter */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Reciter</h3>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <select
                    value={selectedReciter?.identifier || ''}
                    onChange={(e) => {
                      const rec = reciters.find(r => r.identifier === e.target.value);
                      if (rec) {
                        actions.selectReciter(rec);
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-[#1C1C1E] border border-[var(--border)] rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50 text-main"
                  >
                    {reciters.map(reciter => {
                      const isAyoub = reciter.identifier === 'ar.muhammadayyoub';
                      return (
                        <option
                          key={reciter.identifier}
                          value={reciter.identifier}
                          disabled={!isAyoub}
                        >
                          {reciter.englishName}{!isAyoub ? ' (Coming Soon)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Fullscreen Translation Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-accent" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Fullscreen Mode</h3>
                </div>
                <button
                  onClick={() => {
                    setIsFullscreenTranslation(true);
                    onClose();
                  }}
                  className="w-full py-3 bg-accent text-white rounded-xl text-xs font-bold shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Tv className="w-4 h-4" />
                  Start Fullscreen Translation
                </button>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setFullscreenLayoutMode('single')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      fullscreenLayoutMode === 'single'
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'border-[var(--border)] text-muted hover:bg-black/5'
                    }`}
                  >
                    Focus (Single)
                  </button>
                  <button
                    onClick={() => setFullscreenLayoutMode('scroll')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      fullscreenLayoutMode === 'scroll'
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'border-[var(--border)] text-muted hover:bg-black/5'
                    }`}
                  >
                    Scroll Mode
                  </button>
                </div>
              </div>

              {/* Sleep Timer */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Sleep Timer</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setSleepTimer(mins);
                      }}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${sleepTimer === mins ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' : 'border-[var(--border)] text-muted'}`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                {sleepTimer && (
                  <button
                    onClick={() => {
                      setSleepTimer(null);
                    }}
                    className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                  >
                    Cancel Timer ({sleepTimer}m remaining)
                  </button>
                )}
              </div>

              {/* Font Sizes */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Arabic Font Size</h3>
                    <span className="text-xs font-mono text-accent">{arabicFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="120"
                    value={arabicFontSize}
                    onChange={(e) => setArabicFontSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Translation Font Size</h3>
                    <span className="text-xs font-mono text-accent">{translationFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="48"
                    value={translationFontSize}
                    onChange={(e) => setTranslationFontSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Bookmarked Verses</h3>
                <span className="text-[10px] bg-accent-muted text-accent px-2 py-0.5 rounded-full font-bold">
                  {bookmarks.length}
                </span>
              </div>
              {bookmarks.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-accent-muted text-accent flex items-center justify-center mx-auto">
                    <BookmarkIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-muted max-w-[200px] mx-auto leading-relaxed">
                    No bookmarks yet. Tap the bookmark icon on any verse to save it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {bookmarks.map((bookmark) => (
                    <button
                      key={`${bookmark.surahNumber}-${bookmark.ayahNumberInSurah}`}
                      onClick={async () => {
                        const targetSurah = surahs.find(s => s.number === bookmark.surahNumber);
                        if (targetSurah) {
                          if (isRadioMode) {
                            actions.toggleRadioMode(false);
                          }
                          await actions.selectSurah(targetSurah);
                          setAyahIndex(bookmark.ayahNumberInSurah - 1);
                        }
                        onClose();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-accent-muted/50 rounded-xl flex items-center justify-between transition-all border border-transparent hover:border-[var(--border)] active:scale-[0.98] text-main"
                    >
                      <div>
                        <p className="font-semibold text-xs md:text-sm">{bookmark.surahEnglishName}</p>
                        <p className="text-[10px] text-muted">Verse {bookmark.ayahNumberInSurah}</p>
                      </div>
                      <BookmarkIcon className="w-3.5 h-3.5 text-accent fill-current" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border)] text-center relative">
          <p className="text-xs text-[var(--text-muted)]">
            Data from Alquran.cloud
          </p>
        </div>
        {toastMessage && (
          <div className="absolute bottom-16 left-4 right-4 bg-accent/90 backdrop-blur-md text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg border border-accent/20 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center z-[110]">
            {toastMessage}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
