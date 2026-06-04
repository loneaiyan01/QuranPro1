import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Surah, Reciter, SurahContent, Bookmark } from '../types';
import { fetchSurahs, fetchReciters, fetchSurahText } from '../services/api';

interface QuranContextType {
    surahs: Surah[];
    reciters: Reciter[];
    currentSurah: Surah | null;
    selectedReciter: Reciter | null;
    surahText: { arabic: SurahContent; english: SurahContent } | null;
    isLoadingContent: boolean;
    contentError: string | null;
    bookmarks: Bookmark[];
    actions: {
        selectSurah: (surah: Surah) => Promise<void>;
        selectReciter: (reciter: Reciter) => void;
        toggleRadioMode: (active: boolean) => void;
        nextRadioSurah: () => void;
        retryLoadContent: () => void;
        toggleBookmark: (surahNumber: number, surahEnglishName: string, ayahNumberInSurah: number) => void;
        isBookmarked: (surahNumber: number, ayahNumberInSurah: number) => boolean;
        resetToHome: () => void;
    };
    isRadioMode: boolean;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

export const QuranProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
    const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
    const [surahText, setSurahText] = useState<{ arabic: SurahContent; english: SurahContent } | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState<boolean>(true);
    const [isRadioMode, setIsRadioMode] = useState<boolean>(false);
    const [contentError, setContentError] = useState<string | null>(null);

    // Bookmarks State
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
        const saved = localStorage.getItem('tarteela_bookmarks');
        return saved !== null ? JSON.parse(saved) : [];
    });

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

    // Sync bookmarks to localStorage
    useEffect(() => {
        localStorage.setItem('tarteela_bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    const selectSurah = useCallback(async (surah: Surah) => {
        setIsLoadingContent(true);
        setContentError(null);
        setCurrentSurah(surah);

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

        const randomSurah = surahs[Math.floor(Math.random() * surahs.length)];
        const ayyub = reciters.find(r => r.identifier === 'ar.muhammadayyoub');
        const activeReciter = ayyub || reciters[0];

        // Update reciter first to avoid race condition in audio fetching
        setSelectedReciter(activeReciter);
        selectSurah(randomSurah);
    }, [surahs, reciters, selectSurah]);

    const toggleRadioMode = useCallback((active: boolean) => {
        setIsRadioMode(active);
        if (active) {
            nextRadioSurah();
        }
    }, [nextRadioSurah]);

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

    const isBookmarked = useCallback((surahNumber: number, ayahNumberInSurah: number) => {
        return bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumberInSurah === ayahNumberInSurah);
    }, [bookmarks]);

    const actions = useMemo(() => ({
        selectSurah,
        selectReciter,
        toggleRadioMode,
        nextRadioSurah,
        retryLoadContent,
        toggleBookmark,
        isBookmarked,
        resetToHome
    }), [selectSurah, selectReciter, toggleRadioMode, nextRadioSurah, retryLoadContent, toggleBookmark, isBookmarked, resetToHome]);

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
                actions,
                isRadioMode
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
