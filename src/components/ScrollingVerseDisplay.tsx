import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { DisplayMode, Ayah } from '../types';
import { AlertTriangle, RefreshCw, Copy, Share2, Check, Search, X, Bookmark as BookmarkIcon, Play, Pause } from 'lucide-react';

interface VerseItemProps {
    ayah: Ayah;
    englishAyah: Ayah | undefined;
    isActive: boolean;
    isPlaying: boolean;
    isBuffering: boolean;
    displayMode: DisplayMode;
    arabicFontSize: number;
    translationFontSize: number;
    innerRef: (el: HTMLDivElement | null) => void;
    surahName: string;
    searchQuery: string;
    isBookmarked: boolean;
    onToggleBookmark: (e: React.MouseEvent) => void;
    isVerseByVerse: boolean;
    onClick?: () => void;
}

const VerseItem = React.memo<VerseItemProps>(({
    ayah,
    englishAyah,
    isActive,
    isPlaying,
    isBuffering,
    displayMode,
    arabicFontSize,
    translationFontSize,
    innerRef,
    surahName,
    searchQuery,
    isBookmarked,
    onToggleBookmark,
    isVerseByVerse,
    onClick
}) => {
    const [copied, setCopied] = React.useState(false);
    
    // Responsive mobile detection (updates on resize/rotation)
    const isMobile = useIsMobile();
    const displayArabicSize = isMobile ? Math.min(arabicFontSize, 36) : arabicFontSize;
    const displayTranslationSize = isMobile ? Math.min(translationFontSize, 17) : translationFontSize;

    const getVerseText = () => {
        let text = '';
        if (ayah?.text) text += ayah.text;
        if (englishAyah?.text) text += '\n\n' + englishAyah.text;
        text += `\n\n— ${surahName} ${ayah.numberInSurah}`;
        return text;
    };

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(getVerseText());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard not available */ }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = getVerseText();
        if (navigator.share) {
            try {
                await navigator.share({ text });
            } catch { /* user cancelled */ }
        } else {
            handleCopy(e);
        }
    };

    return (
        <div
            ref={innerRef}
            onClick={isVerseByVerse ? onClick : undefined}
            className={`group p-5 md:p-10 rounded-2xl md:rounded-3xl transition-all duration-700 border ${
                isVerseByVerse ? 'cursor-pointer' : ''
            } ${isActive
                ? 'bg-[var(--bg-card-active)] border-[var(--border-active)] shadow-[var(--shadow-lg)] border-l-4'
                : 'bg-transparent border-transparent hover:bg-white/5 active:bg-white/10'
                }`}
        >
            {/* Header: Verse Number */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 flex items-center justify-center text-xs font-mono rounded-xl transition-all duration-500 shadow-sm border relative overflow-hidden ${isActive
                        ? 'bg-accent text-white rotate-0 scale-110 border-accent'
                        : 'bg-[var(--bg-main)] text-accent rotate-45 group-hover:rotate-0 border-[var(--border)]'
                        }`}>
                        {isVerseByVerse && (
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-accent text-white rounded-xl">
                                {isActive && isPlaying ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                            </span>
                        )}
                        <span className={`transition-opacity duration-300 ${isVerseByVerse ? 'group-hover:opacity-0' : ''} ${isActive ? '' : '-rotate-45'}`}>
                            {ayah.numberInSurah}
                        </span>
                    </span>
                    {isActive && isPlaying && (
                        <div className="flex items-center gap-2">
                            {isBuffering ? (
                                <span className="text-[10px] uppercase tracking-wider text-accent animate-pulse font-bold">Buffering...</span>
                            ) : (
                                <div className="flex gap-0.5 items-end h-3">
                                    <div className="w-1 bg-accent animate-[music-bar_0.8s_ease-in-out_infinite] h-full" />
                                    <div className="w-1 bg-accent animate-[music-bar_1.2s_ease-in-out_infinite] h-2" />
                                    <div className="w-1 bg-accent animate-[music-bar_1.0s_ease-in-out_infinite] h-3" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-300">
                    <button
                        onClick={onToggleBookmark}
                        className={`p-2.5 rounded-lg hover:bg-white/10 transition-colors ${isBookmarked ? 'text-accent' : 'text-muted hover:text-accent'}`}
                        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark verse"}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark verse"}
                    >
                        <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-2.5 rounded-lg hover:bg-white/10 text-muted hover:text-accent transition-colors"
                        aria-label="Copy verse"
                        title="Copy verse"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2.5 rounded-lg hover:bg-white/10 text-muted hover:text-accent transition-colors"
                        aria-label="Share verse"
                        title="Share verse"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Arabic Text */}
            {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ARABIC_ONLY) && (
                <p
                    className={`text-right font-quran leading-[2.4] mb-8 transition-all duration-500 ${isActive ? 'text-main scale-[1.02] origin-right' : 'text-main opacity-90'
                        }`}
                    dir="rtl"
                    style={{ fontSize: `${displayArabicSize}px` }}
                >
                    {searchQuery ? highlightText(ayah.text, searchQuery) : ayah.text}
                </p>
            )}

            {/* English Text */}
            {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ENGLISH_ONLY) && englishAyah && (
                <p
                    className={`text-left font-sans leading-relaxed transition-all duration-500 ${isActive ? 'text-main font-normal' : 'text-muted opacity-80'
                        }`}
                    style={{ fontSize: `${displayTranslationSize}px` }}
                >
                    {searchQuery ? highlightText(englishAyah.text, searchQuery) : englishAyah.text}
                </p>
            )}
        </div>
    );
});

VerseItem.displayName = 'VerseItem';

/** Splits text on search matches and wraps them in styled <mark> elements */
function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    if (parts.length === 1) return text;
    const queryLower = query.toLowerCase();
    return parts.map((part, i) =>
        part.toLowerCase() === queryLower
            ? <mark key={i} className="bg-accent/30 text-accent rounded px-0.5">{part}</mark>
            : part
    );
}

const ScrollingVerseDisplay: React.FC = () => {
    // Contexts
    const { surahText, isLoadingContent, contentError, actions } = useQuran();
    const {
        isPlaying,
        currentTime,
        duration,
        currentAyahIndex,
        isFullSurahAudio,
        isBuffering,
        actions: audioActions
    } = useAudio();
    const {
        displayMode,
        arabicFontSize,
        translationFontSize
    } = useTheme();

    // Derived
    const arabicSurah = surahText?.arabic;
    const englishSurah = surahText?.english;
    const isVerseByVerse = !isFullSurahAudio;

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Memoized match count to avoid O(n²) recalculation on every keystroke
    const searchMatchCount = useMemo(() => {
        if (!searchQuery.trim() || !arabicSurah) return 0;
        const q = searchQuery.toLowerCase();
        return arabicSurah.ayahs.reduce((count, ayah, index) => {
            const arabicMatch = ayah.text.toLowerCase().includes(q);
            const englishMatch = (englishSurah?.ayahs[index]?.text || '').toLowerCase().includes(q);
            return count + (arabicMatch || englishMatch ? 1 : 0);
        }, 0);
    }, [searchQuery, arabicSurah, englishSurah]);

    const containerRef = useRef<HTMLDivElement>(null);
    const verseRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Initialize/Update verse refs array
    useEffect(() => {
        if (arabicSurah) {
            verseRefs.current = verseRefs.current.slice(0, arabicSurah.ayahs.length);
        }
    }, [arabicSurah]);

    const isUserInteracting = useRef(false);
    const isAutoScrolling = useRef(false);
    const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollOffset = useRef(0);

    // Handle manual scroll detection
    const handleScroll = useCallback(() => {
        if (isAutoScrolling.current) {
            isAutoScrolling.current = false; // Reset flag
            return;
        }

        // User is scrolling manually
        isUserInteracting.current = true;

        // Clear existing timeout
        if (interactionTimeout.current) {
            clearTimeout(interactionTimeout.current);
        }

        // Resume auto-scroll after 4 seconds
        interactionTimeout.current = setTimeout(() => {
            isUserInteracting.current = false;

            // Recalculate offset when user stops scrolling (only relevant for continuous mode)
            if (!isVerseByVerse && containerRef.current && duration > 0) {
                const container = containerRef.current;
                const scrollHeight = container.scrollHeight - container.clientHeight;
                const calculatedPos = scrollHeight * (currentTime / duration);
                scrollOffset.current = container.scrollTop - calculatedPos;
            }
        }, 4000);
    }, [isVerseByVerse, duration, currentTime]);

    // Auto-scroll logic for Continuous Mode
    useEffect(() => {
        if (isVerseByVerse) return; // Skip for VBV

        // Reset offset on new surah or start
        if (currentTime < 1) {
            scrollOffset.current = 0;
        }

        // Don't auto-scroll if user is interacting
        if (isUserInteracting.current) return;

        if (isPlaying && containerRef.current && duration > 0) {
            const container = containerRef.current;
            const scrollHeight = container.scrollHeight - container.clientHeight;

            const progress = currentTime / duration;
            // Apply the user's manual offset to the calculated position
            const targetScrollTop = (scrollHeight * progress) + scrollOffset.current;

            // Only scroll if the difference is significant
            if (Math.abs(container.scrollTop - targetScrollTop) > 10) {
                isAutoScrolling.current = true;
                container.scrollTop = targetScrollTop;
            }
        }
    }, [currentTime, duration, isPlaying, isVerseByVerse]);

    // Auto-scroll logic for Verse-by-Verse Mode
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

    if (isLoadingContent) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
        );
    }

    if (!arabicSurah) {
        return (
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-sm w-full text-center p-8 rounded-3xl bg-[var(--bg-card-active)] border border-[var(--border)] shadow-[var(--shadow-lg)] space-y-5">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-serif font-bold text-main">Unable to Load Content</h3>
                        <p className="text-sm text-muted leading-relaxed">
                            {contentError || 'No Surah data is available. This may be due to a network issue or the API server being offline.'}
                        </p>
                    </div>
                    <button
                        onClick={() => actions.retryLoadContent()}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold text-sm rounded-2xl shadow-lg shadow-accent/20 hover:scale-[1.03] active:scale-95 transition-all duration-200"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-2 pt-24 pb-28 lg:px-12 scroll-smooth"
        >
            <div className="max-w-4xl mx-auto space-y-4 pb-12">
                <div className="text-center mb-6">
                    <span className="inline-block px-3 py-1 bg-[var(--accent-muted)] text-xs rounded-full text-[var(--accent)] mb-2">
                        {isVerseByVerse ? 'Verse-by-Verse Mode' : 'Scrolling Mode'}
                    </span>
                    <p className="text-xs text-muted">
                        {isVerseByVerse
                            ? 'Individual verses are played and highlighted.'
                            : 'Audio is continuous. Text scrolls automatically.'}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    {isSearchOpen ? (
                        <div className="flex items-center gap-2 bg-[var(--bg-card-active)] border border-[var(--border)] rounded-2xl px-4 py-2 shadow-lg">
                            <Search className="w-4 h-4 text-muted flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search in this Surah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-main placeholder-muted outline-none"
                                autoFocus
                            />
                            {searchQuery && (
                                <span className="text-[10px] text-muted whitespace-nowrap">
                                    {searchMatchCount} matches
                                </span>
                            )}
                            <button
                                onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                                className="p-1 rounded-lg hover:bg-white/10 text-muted hover:text-main transition-colors"
                                aria-label="Close search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors mx-auto"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>Search in Surah</span>
                        </button>
                    )}
                </div>

                {arabicSurah.ayahs.map((ayah, index) => {
                    const isActive = isVerseByVerse && index === currentAyahIndex;
                    const bookmarked = actions.isBookmarked(arabicSurah.number, ayah.numberInSurah);
                    const currentJuz = ayah.juz;
                    const prevJuz = index > 0 ? arabicSurah.ayahs[index - 1].juz : null;
                    const showJuzHeader = prevJuz === null || prevJuz !== currentJuz;

                    return (
                        <React.Fragment key={ayah.number}>
                            {showJuzHeader && (
                                <div className="flex items-center gap-4 py-6 px-4 select-none">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border)] to-[var(--border)]" />
                                    <span className="px-4 py-1.5 rounded-full bg-accent-muted text-accent text-xs font-serif font-bold tracking-wider uppercase border border-accent/20 flex items-center gap-2">
                                        <span>Juz {currentJuz}</span>
                                        <span className="text-[10px] opacity-60">•</span>
                                        <span className="font-sans font-medium text-[10px]">الجزء {currentJuz}</span>
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--border)] to-[var(--border)]" />
                                </div>
                            )}
                            <VerseItem
                                ayah={ayah}
                                englishAyah={englishSurah?.ayahs[index]}
                                isActive={isActive}
                                isPlaying={isActive && isPlaying}
                                isBuffering={isActive && isBuffering}
                                displayMode={displayMode}
                                arabicFontSize={arabicFontSize}
                                translationFontSize={translationFontSize}
                                innerRef={el => { verseRefs.current[index] = el; }}
                                surahName={arabicSurah.englishName}
                                searchQuery={searchQuery}
                                isBookmarked={bookmarked}
                                onToggleBookmark={(e) => {
                                    e.stopPropagation();
                                    actions.toggleBookmark(arabicSurah.number, arabicSurah.englishName, ayah.numberInSurah);
                                }}
                                isVerseByVerse={isVerseByVerse}
                                onClick={() => audioActions.playVerse(index)}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default ScrollingVerseDisplay;
