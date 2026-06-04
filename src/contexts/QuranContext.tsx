import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { Surah, Reciter, SurahContent, Bookmark } from '../types';
import { fetchSurahs, fetchReciters, fetchSurahText } from '../services/api';

export type PageType = 'home' | 'player' | 'radio' | 'bookmarks' | 'settings';

interface QuranContextType {
    surahs: Surah[];
    reciters: Reciter[];
    currentSurah: Surah | null;
    selectedReciter: Reciter | null;
    surahText: { arabic: SurahContent; english: SurahContent } | null;
    isLoadingContent: boolean;
    contentError: string | null;
    bookmarks: Bookmark[];
    currentPage: PageType;
    actions: {
        selectSurah: (surah: Surah) => Promise<void>;
        selectReciter: (reciter: Reciter) => void;
        toggleRadioMode: (active: boolean) => void;
        nextRadioSurah: () => void;
        retryLoadContent: () => void;
        toggleBookmark: (surahNumber: number, surahEnglishName: string, ayahNumberInSurah: number) => void;
        isBookmarked: (surahNumber: number, ayahNumberInSurah: number) => boolean;
        resetToHome: () => void;
        setCurrentPage: (page: PageType) => void;
    };
    isRadioMode: boolean;
    radioStartAyahIndex: number | null;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

// Seeded Shuffle using Linear Congruential Generator (LCG) to generate deterministic order of Surahs (1 to 114)
function getSeededShuffledSurahNumbers(seed: number): number[] {
    const numbers = Array.from({ length: 114 }, (_, i) => i + 1);
    let seedVal = seed;
    const random = () => {
        seedVal = (seedVal * 9301 + 49297) % 233280;
        return seedVal / 233280;
    };
    let m = numbers.length, t, i;
    while (m) {
        i = Math.floor(random() * m--);
        t = numbers[m];
        numbers[m] = numbers[i];
        numbers[i] = t;
    }
    return numbers;
}

export const SHUFFLED_SURAH_NUMBERS = getSeededShuffledSurahNumbers(12345); // Fixed seed for 24/7 radio sequence parity

// Estimate Surah and Ayah index at the current Unix timestamp
export function getRadioPosition(surahs: Surah[], secondsPerAyah = 20): { surah: Surah; ayahIndex: number } | null {
    if (surahs.length === 0) return null;
    
    // Sum total verses in the Quran
    const totalAyahs = surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0);
    const globalAyahIndex = Math.floor((Date.now() / 1000) / secondsPerAyah) % totalAyahs;

    let accumulated = 0;
    for (const surahNum of SHUFFLED_SURAH_NUMBERS) {
        const surah = surahs.find(s => s.number === surahNum);
        if (!surah) continue;
        if (globalAyahIndex < accumulated + surah.numberOfAyahs) {
            return {
                surah,
                ayahIndex: globalAyahIndex - accumulated
            };
        }
        accumulated += surah.numberOfAyahs;
    }
    
    // Fallback
    const firstSurah = surahs.find(s => s.number === SHUFFLED_SURAH_NUMBERS[0]) || surahs[0];
    return { surah: firstSurah, ayahIndex: 0 };
}

export const QuranProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
    const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
    const [surahText, setSurahText] = useState<{ arabic: SurahContent; english: SurahContent } | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState<boolean>(true);
    const [isRadioMode, setIsRadioMode] = useState<boolean>(false);
    const [radioStartAyahIndex, setRadioStartAyahIndex] = useState<number | null>(null);
    const [contentError, setContentError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<PageType>('home');

    // Bookmarks State
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
        try {
            const saved = localStorage.getItem('tarteela_bookmarks');
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (e) {
            console.error('Failed to parse bookmarks from localStorage:', e);
        }
        return [];
    });

    // Sync bookmarks to localStorage
    useEffect(() => {
        localStorage.setItem('tarteela_bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    // Initialization
    useEffect(() => {
        const init = async () => {
            try {
                setContentError(null);
                const [fetchedSurahs, fetchedReciters] = await Promise.all([
                    fetchSurahs(),
                    fetchReciters()
                ]);
                setSurahs(fetchedSurahs);
                setReciters(fetchedReciters);

                // Defaults — force Muhammad Ayyub for now
                if (fetchedReciters.length > 0) {
                    const ayyub = fetchedReciters.find(r => r.identifier === 'ar.muhammadayyoub');
                    setSelectedReciter(ayyub || fetchedReciters[0]);
                }

                // Do not load any Surah by default (go to home page)
                setIsLoadingContent(false);
            } catch (err) {
                setContentError('Failed to connect to the Quran API. Please check your internet connection.');
                setIsLoadingContent(false);
            }
        };

        init();
    }, []);

    const selectSurah = useCallback(async (surah: Surah) => {
        setIsLoadingContent(true);
        setContentError(null);
        setCurrentSurah(surah);
        setCurrentPage('player');

        try {
            const textData = await fetchSurahText(surah.number);
            if (textData) {
                setSurahText(textData);
            } else {
                setContentError('Failed to load Surah content. The server may be unavailable.');
            }
        } catch (err) {
            setContentError('Failed to load Surah content. Please check your internet connection.');
        }

        setIsLoadingContent(false);
    }, []);

    const selectReciter = useCallback((reciter: Reciter) => {
        setSelectedReciter(reciter);
        localStorage.setItem('tarteela_reciter', reciter.identifier);
    }, []);

    const nextRadioSurah = useCallback(() => {
        if (surahs.length === 0 || reciters.length === 0) return;

        let nextSurah = surahs[0];
        if (currentSurah) {
            const currentShuffleIndex = SHUFFLED_SURAH_NUMBERS.indexOf(currentSurah.number);
            const nextShuffleIndex = (currentShuffleIndex + 1) % SHUFFLED_SURAH_NUMBERS.length;
            const nextSurahNum = SHUFFLED_SURAH_NUMBERS[nextShuffleIndex];
            nextSurah = surahs.find(s => s.number === nextSurahNum) || surahs[0];
        } else {
            const firstSurahNum = SHUFFLED_SURAH_NUMBERS[0];
            nextSurah = surahs.find(s => s.number === firstSurahNum) || surahs[0];
        }

        const ayyub = reciters.find(r => r.identifier === 'ar.muhammadayyoub');
        const activeReciter = ayyub || reciters[0];

        setSelectedReciter(activeReciter);
        setRadioStartAyahIndex(0); // Sequence transitions play from verse 1 (index 0)
        selectSurah(nextSurah);
    }, [surahs, reciters, currentSurah, selectSurah]);

    const toggleRadioMode = useCallback((active: boolean) => {
        setIsRadioMode(active);
        if (active) {
            setCurrentPage('radio');
            
            // Enforce Sheikh Muhammad Ayyub for VBV accuracy
            const ayyub = reciters.find(r => r.identifier === 'ar.muhammadayyoub');
            const activeReciter = ayyub || reciters[0];
            setSelectedReciter(activeReciter);

            if (surahs.length > 0) {
                const pos = getRadioPosition(surahs);
                if (pos) {
                    setRadioStartAyahIndex(pos.ayahIndex);
                    selectSurah(pos.surah);
                }
            }
        } else {
            setRadioStartAyahIndex(null);
            setCurrentPage('player');
        }
    }, [surahs, reciters, selectSurah]);

    // Auto-tune to correct live position if radio mode was loaded/selected before surahs fetched
    useEffect(() => {
        if (isRadioMode && !currentSurah && surahs.length > 0 && reciters.length > 0) {
            const ayyub = reciters.find(r => r.identifier === 'ar.muhammadayyoub');
            const activeReciter = ayyub || reciters[0];
            setSelectedReciter(activeReciter);

            const pos = getRadioPosition(surahs);
            if (pos) {
                setRadioStartAyahIndex(pos.ayahIndex);
                selectSurah(pos.surah);
            }
        }
    }, [isRadioMode, currentSurah, surahs, reciters, selectSurah]);

    const retryLoadContent = useCallback(() => {
        if (currentSurah) {
            selectSurah(currentSurah);
        } else if (surahs.length > 0) {
            selectSurah(surahs[0]);
        }
    }, [currentSurah, surahs, selectSurah]);

    const resetToHome = useCallback(() => {
        setCurrentSurah(null);
        setIsRadioMode(false);
        setCurrentPage('home');
    }, []);

    // Bookmark Actions
    const toggleBookmark = useCallback((surahNumber: number, surahEnglishName: string, ayahNumberInSurah: number) => {
        setBookmarks(prev => {
            const index = prev.findIndex(b => b.surahNumber === surahNumber && b.ayahNumberInSurah === ayahNumberInSurah);
            if (index > -1) {
                return prev.filter((_, i) => i !== index);
            } else {
                return [...prev, {
                    surahNumber,
                    surahEnglishName,
                    ayahNumberInSurah,
                    addedAt: Date.now()
                }].sort((a, b) => a.surahNumber - b.surahNumber || a.ayahNumberInSurah - b.ayahNumberInSurah);
            }
        });
    }, []);

    // O(1) bookmark lookups via Set (PERF-2)
    const bookmarkSet = useMemo(() => {
        return new Set(bookmarks.map(b => `${b.surahNumber}:${b.ayahNumberInSurah}`));
    }, [bookmarks]);

    const isBookmarked = useCallback((surahNumber: number, ayahNumberInSurah: number) => {
        return bookmarkSet.has(`${surahNumber}:${ayahNumberInSurah}`);
    }, [bookmarkSet]);

    const actions = useMemo(() => ({
        selectSurah,
        selectReciter,
        toggleRadioMode,
        nextRadioSurah,
        retryLoadContent,
        toggleBookmark,
        isBookmarked,
        resetToHome,
        setCurrentPage
    }), [selectSurah, selectReciter, toggleRadioMode, nextRadioSurah, retryLoadContent, toggleBookmark, isBookmarked, resetToHome, setCurrentPage]);

    return (
        <QuranContext.Provider
            value={{
                surahs,
                reciters,
                currentSurah,
                selectedReciter,
                surahText,
                isLoadingContent,
                contentError,
                bookmarks,
                currentPage,
                actions,
                isRadioMode,
                radioStartAyahIndex
            }}
        >
            {children}
        </QuranContext.Provider>
    );
};

export const useQuran = () => {
    const context = useContext(QuranContext);
    if (context === undefined) {
        throw new Error('useQuran must be used within a QuranProvider');
    }
    return context;
};
