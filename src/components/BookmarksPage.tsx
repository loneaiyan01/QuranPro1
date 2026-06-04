import React, { useState, useMemo } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { Bookmark as BookmarkIcon, Play, Trash2, Search, Sparkles } from 'lucide-react';

export const BookmarksPage: React.FC = () => {
  const { bookmarks, surahs, actions: quranActions } = useQuran();
  const { actions: audioActions } = useAudio();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => 
      b.surahEnglishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ayahNumberInSurah.toString().includes(searchQuery)
    );
  }, [bookmarks, searchQuery]);

  const handlePlayBookmark = async (surahNumber: number, ayahNumber: number) => {
    const targetSurah = surahs.find(s => s.number === surahNumber);
    if (targetSurah) {
      await quranActions.selectSurah(targetSurah);
      audioActions.setAyahIndex(ayahNumber - 1);
    }
  };

  const handleRemoveBookmark = (surahNumber: number, surahName: string, ayahNumber: number) => {
    quranActions.toggleBookmark(surahNumber, surahName, ayahNumber);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-24 pb-44 md:py-12 lg:px-12 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-main flex items-center gap-2">
              <BookmarkIcon className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              Saved Reflections
            </h1>
            <p className="text-xs text-muted">
              Jump directly into your bookmarked verses and continue reflecting.
            </p>
          </div>

          {/* Search bookmarks */}
          {bookmarks.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#1C1C1E] border border-[var(--border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent/50 text-main"
              />
            </div>
          )}
        </div>

        {bookmarks.length === 0 ? (
          // Empty State
          <div className="text-center py-24 px-6 space-y-6 max-w-sm mx-auto glass-panel p-8 rounded-3xl border border-[var(--border)]">
            <div className="w-16 h-16 rounded-2xl bg-accent-muted text-accent flex items-center justify-center mx-auto">
              <BookmarkIcon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-main">No Saved Verses</h3>
              <p className="text-xs text-muted leading-relaxed">
                As you listen to the Quran, tap the bookmark icon on any verse to save it here for easy visual access.
              </p>
            </div>
          </div>
        ) : filteredBookmarks.length > 0 ? (
          // Grid list of bookmarks
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={`${bookmark.surahNumber}-${bookmark.ayahNumberInSurah}`}
                className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] hover:border-accent/30 p-4 shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-1.5 py-0.5 bg-accent-muted text-accent rounded font-bold">
                      Surah {bookmark.surahNumber}
                    </span>
                    {bookmark.addedAt && (
                      <span className="text-[9px] text-muted font-medium">
                        {formatDate(bookmark.addedAt)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-main mt-2 group-hover:text-accent transition-colors">
                    {bookmark.surahEnglishName}
                  </h3>
                  <p className="text-xs text-muted">Verse {bookmark.ayahNumberInSurah}</p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-2 border-t border-[var(--border)]">
                  <button
                    onClick={() => handlePlayBookmark(bookmark.surahNumber, bookmark.ayahNumberInSurah)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 text-white rounded-lg text-[10px] font-bold transition-all shadow-md shadow-accent/15"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                    Play Verse
                  </button>
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.surahNumber, bookmark.surahEnglishName, bookmark.ayahNumberInSurah)}
                    className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No Search Results State
          <div className="text-center py-16 text-sm text-muted">
            No bookmarks found matching "{searchQuery}"
          </div>
        )}

      </div>
    </div>
  );
};
