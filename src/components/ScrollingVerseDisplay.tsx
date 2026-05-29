import React, { useEffect, useRef, useState } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import { DisplayMode } from '../types';

interface VerseItemProps {
    ayah: any;
    englishAyah: any;
    isActive: boolean;
    isPlaying: boolean;
    isBuffering: boolean;
    displayMode: DisplayMode;
    arabicFontSize: number;
    translationFontSize: number;
    innerRef: (el: HTMLDivElement | null) => void;
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
    innerRef
}) => {
    return (
        <div
            ref={innerRef}
            className={`p-6 md:p-10 rounded-3xl transition-all duration-700 border ${isActive
                ? 'bg-[var(--bg-card-active)] border-[var(--border-active)] shadow-[var(--shadow-lg)] border-l-4'
                : 'bg-transparent border-transparent hover:bg-white/5 active:bg-white/10'
                }`}
        >
            {/* Header: Verse Number */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 flex items-center justify-center text-xs font-mono rounded-xl transition-all duration-500 shadow-sm border ${isActive
                        ? 'bg-accent text-white rotate-0 scale-110 border-accent'
                        : 'bg-[var(--bg-main)] text-accent rotate-45 group-hover:rotate-0 border-[var(--border)]'
                        }`}>
                        <span className={isActive ? '' : '-rotate-45'}>{ayah.numberInSurah}</span>
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
            </div>

            {/* Arabic Text */}
            {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ARABIC_ONLY) && (
                <p
                    className={`text-right font-quran leading-[2.4] mb-8 transition-all duration-500 ${isActive ? 'text-main scale-[1.02] origin-right' : 'text-main opacity-90'
                        }`}
                    dir="rtl"
                    style={{ fontSize: `${arabicFontSize}px` }}
                >
                    {ayah.text}
                </p>
            )}

            {/* English Text */}
            {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ENGLISH_ONLY) && englishAyah && (
                <p
                    className={`text-left font-sans leading-relaxed transition-all duration-500 ${isActive ? 'text-main font-normal' : 'text-muted opacity-80'
                        }`}
                    style={{ fontSize: `${translationFontSize}px` }}
                >
                    {englishAyah.text}
                </p>
            )}
        </div>
    );
});

VerseItem.displayName = 'VerseItem';

const ScrollingVerseDisplay: React.FC = () => {
    // Contexts
    const { surahText, isLoadingContent } = useQuran();
    const {
        isPlaying,
        currentTime,
        duration,
        currentAyahIndex,
        isFullSurahAudio,
        isBuffering
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

    const containerRef = useRef<HTMLDivElement>(null);
    const verseRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [totalWords, setTotalWords] = useState(0);

    // Initialize/Update verse refs array
    useEffect(() => {
        if (arabicSurah) {
            verseRefs.current = verseRefs.current.slice(0, arabicSurah.ayahs.length);
        }
    }, [arabicSurah]);

    // Calculate total words when content loads to estimate scroll speed (for full-surah mode)
    useEffect(() => {
        if (arabicSurah) {
            const words = arabicSurah.ayahs.reduce((count, ayah) => {
                return count + ayah.text.split(' ').length;
            }, 0);
            setTotalWords(words);
        }
    }, [arabicSurah]);

    const isUserInteracting = useRef(false);
    const isAutoScrolling = useRef(false);
    const interactionTimeout = useRef<NodeJS.Timeout | null>(null);
    const scrollOffset = useRef(0);

    // Handle manual scroll detection
    const handleScroll = () => {
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
    };

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

    if (!arabicSurah) return null;

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-2 py-4 lg:px-12 scroll-smooth"
        >
            <div className="max-w-4xl mx-auto space-y-4 pb-32">
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

                {arabicSurah.ayahs.map((ayah, index) => {
                    const isActive = isVerseByVerse && index === currentAyahIndex;
                    return (
                        <VerseItem
                            key={ayah.number}
                            ayah={ayah}
                            englishAyah={englishSurah?.ayahs[index]}
                            isActive={isActive}
                            isPlaying={isPlaying}
                            isBuffering={isBuffering}
                            displayMode={displayMode}
                            arabicFontSize={arabicFontSize}
                            translationFontSize={translationFontSize}
                            innerRef={el => { verseRefs.current[index] = el; }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ScrollingVerseDisplay;
