import React from 'react';
import { Surah, Reciter, DisplayMode, Theme } from '../types';
import { BookOpen, User, Settings, Moon, Sun, X, Menu, Search, Palette } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  surahs: Surah[];
  currentSurah: Surah | null;
  onSelectSurah: (surah: Surah) => void;
  reciters: Reciter[];
  selectedReciter: Reciter | null;
  onSelectReciter: (reciter: Reciter) => void;
  displayMode: DisplayMode;
  onSetDisplayMode: (mode: DisplayMode) => void;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  arabicFontSize: number;
  onSetArabicFontSize: (size: number) => void;
  translationFontSize: number;
  onSetTranslationFontSize: (size: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  surahs,
  currentSurah,
  onSelectSurah,
  reciters,
  selectedReciter,
  onSelectReciter,
  displayMode,
  onSetDisplayMode,
  theme,
  onSetTheme,
  arabicFontSize,
  onSetArabicFontSize,
  translationFontSize,
  onSetTranslationFontSize
}) => {
  const [activeTab, setActiveTab] = React.useState<'surahs' | 'settings'>('surahs');
  const [searchQuery, setSearchQuery] = React.useState('');

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
      <div className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-emerald-900 shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-emerald-800 flex justify-between items-center bg-sidebar">
          <h2 className="text-xl font-serif font-bold text-accent dark:text-accent-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span>Tarteela</span>
          </h2>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-emerald-800 rounded-full text-gray-500 dark:text-emerald-400 transition-colors z-50"
            aria-label="Close Sidebar"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-emerald-800 bg-sidebar">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'surahs' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            onClick={() => setActiveTab('surahs')}
          >
            Surahs
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'settings' ? 'text-accent border-b-2 border-accent' : 'text-muted'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings & Reciters
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'surahs' && (
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Surah..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-emerald-950 border border-gray-200 dark:border-emerald-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                {filteredSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => {
                      onSelectSurah(surah);
                      if (window.innerWidth < 768) onClose();
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
                        <p className="font-medium text-sm">{surah.englishName}</p>
                        <p className="text-xs opacity-70">{surah.englishNameTranslation}</p>
                      </div>
                    </div>
                    <span className="font-amiri text-lg opacity-80">{surah.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 space-y-8">
              {/* Display Mode */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-emerald-400">Display Mode</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onSetDisplayMode(DisplayMode.ARABIC_ONLY)}
                    className={`px-3 py-2 text-sm rounded-md border transition-all ${displayMode === DisplayMode.ARABIC_ONLY ? 'bg-accent text-white border-accent shadow-sm' : 'border-gray-200 dark:border-emerald-700 text-muted hover:bg-black/5'}`}
                  >
                    Arabic
                  </button>
                  <button
                    onClick={() => onSetDisplayMode(DisplayMode.ENGLISH_ONLY)}
                    className={`px-3 py-2 text-sm rounded-md border transition-all ${displayMode === DisplayMode.ENGLISH_ONLY ? 'bg-accent text-white border-accent shadow-sm' : 'border-gray-200 dark:border-emerald-700 text-muted hover:bg-black/5'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => onSetDisplayMode(DisplayMode.BOTH)}
                    className={`px-3 py-2 text-sm rounded-md border transition-all ${displayMode === DisplayMode.BOTH ? 'bg-accent text-white border-accent shadow-sm' : 'border-gray-200 dark:border-emerald-700 text-muted hover:bg-black/5'}`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Reciter */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-emerald-400">Reciter</h3>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedReciter?.identifier || ''}
                    onChange={(e) => {
                      const rec = reciters.find(r => r.identifier === e.target.value);
                      if (rec) onSelectReciter(rec);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-emerald-950 border border-gray-200 dark:border-emerald-800 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-gray-700 dark:text-emerald-200"
                  >
                    {reciters.map(reciter => (
                      <option key={reciter.identifier} value={reciter.identifier}>
                        {reciter.englishName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-emerald-400">Appearance</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSetTheme(Theme.LIGHT)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-all ${theme === Theme.LIGHT ? 'bg-[#059669] text-white border-[#059669] shadow-md' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => onSetTheme(Theme.DARK)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-all ${theme === Theme.DARK ? 'bg-[#10b981] text-emerald-950 border-[#10b981] shadow-md' : 'border-gray-200 text-gray-600 dark:text-emerald-200 hover:bg-emerald-800/20'}`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => onSetTheme(Theme.SEPIA)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-all ${theme === Theme.SEPIA ? 'bg-[#8c6a46] text-white border-[#8c6a46] shadow-md' : 'border-orange-200/50 text-[#704214] dark:text-orange-200/80 hover:bg-orange-50/50'}`}
                  >
                    <div className="w-3 h-3 rounded-full bg-[#f4e4bc]" />
                    <span>Sepia</span>
                  </button>
                  <button
                    onClick={() => onSetTheme(Theme.MINIMAL)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md border transition-all ${theme === Theme.MINIMAL ? 'bg-black text-white border-black shadow-md' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Palette className="w-4 h-4" />
                    <span>Minimal</span>
                  </button>
                </div>
              </div>

              {/* Font Sizes */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-emerald-400">Arabic Font Size</h3>
                    <span className="text-xs font-mono text-accent">{arabicFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="120"
                    value={arabicFontSize}
                    onChange={(e) => onSetArabicFontSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-emerald-800 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-emerald-400">Translation Font Size</h3>
                    <span className="text-xs font-mono text-accent">{translationFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="48"
                    value={translationFontSize}
                    onChange={(e) => onSetTranslationFontSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-emerald-800 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-emerald-800 text-center">
          <p className="text-xs text-gray-400 dark:text-emerald-600">
            Data from Alquran.cloud
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
