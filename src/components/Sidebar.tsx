import React from 'react';
import { useQuran } from '../contexts/QuranContext';
import { 
  Home, 
  BookOpen, 
  Radio, 
  Bookmark as BookmarkIcon, 
  Settings, 
  X, 
  Search 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    surahs,
    currentSurah,
    currentPage,
    actions
  } = useQuran();

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
      <div className={`fixed inset-y-0 left-0 w-[85vw] md:w-80 bg-sidebar shadow-[var(--shadow-lg)] transform transition-transform duration-300 ease-in-out z-[100] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-sidebar">
          <button
            onClick={() => {
              actions.setCurrentPage('home');
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
            className="p-2 hover:bg-[var(--accent-muted)] rounded-full text-muted transition-colors z-50 md:hidden"
            aria-label="Close Sidebar"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="p-4 space-y-1 border-b border-[var(--border)] bg-sidebar flex-shrink-0">
          <button
            onClick={() => {
              actions.setCurrentPage('home');
              onClose();
            }}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-xs font-semibold ${
              currentPage === 'home'
                ? 'bg-accent-muted text-accent'
                : 'hover:bg-accent-muted/40 text-main'
            }`}
          >
            <Home className="w-4 h-4" />
            Home Dashboard
          </button>
          
          <button
            onClick={() => {
              actions.setCurrentPage('player');
              onClose();
            }}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-xs font-semibold ${
              currentPage === 'player'
                ? 'bg-accent-muted text-accent'
                : 'hover:bg-accent-muted/40 text-main'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Verse Player
          </button>

          <button
            onClick={() => {
              actions.toggleRadioMode(true);
              onClose();
            }}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-xs font-semibold ${
              currentPage === 'radio'
                ? 'bg-accent-muted text-accent'
                : 'hover:bg-accent-muted/40 text-main'
            }`}
          >
            <Radio className="w-4 h-4" />
            Quran Radio
          </button>

          <button
            onClick={() => {
              actions.setCurrentPage('bookmarks');
              onClose();
            }}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-xs font-semibold ${
              currentPage === 'bookmarks'
                ? 'bg-accent-muted text-accent'
                : 'hover:bg-accent-muted/40 text-main'
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            Saved Reflections
          </button>

          <button
            onClick={() => {
              actions.setCurrentPage('settings');
              onClose();
            }}
            className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-xs font-semibold ${
              currentPage === 'settings'
                ? 'bg-accent-muted text-accent'
                : 'hover:bg-accent-muted/40 text-main'
            }`}
          >
            <Settings className="w-4 h-4" />
            Preferences
          </button>
        </div>

        {/* Scrollable Quick Browse Surahs */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col min-h-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-3 px-1">
            Quick Browse Surahs
          </h3>
          <div className="relative mb-3 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            <input
              type="text"
              placeholder="Filter Surahs..."
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent/50 text-main"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => {
                  actions.selectSurah(surah);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  currentSurah?.number === surah.number
                    ? 'bg-accent-muted text-accent font-semibold'
                    : 'hover:bg-accent-muted/30 text-main'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] w-6 h-6 rounded-md flex items-center justify-center ${
                    currentSurah?.number === surah.number
                      ? 'bg-accent text-white'
                      : 'bg-[var(--bg-sidebar)] text-muted'
                  }`}>
                    {surah.number}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{surah.englishName}</p>
                    <p className="text-[9px] opacity-70">{surah.englishNameTranslation}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] text-center relative flex-shrink-0">
          <p className="text-[10px] text-[var(--text-muted)]">
            Data from Alquran.cloud
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
