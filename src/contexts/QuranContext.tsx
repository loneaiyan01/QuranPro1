import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Surah, Reciter, SurahContent } from '../types';
import { fetchSurahs, fetchReciters, fetchSurahText } from '../services/api';

interface QuranContextType {
    surahs: Surah[];
    reciters: Reciter[];
    currentSurah: Surah | null;
    selectedReciter: Reciter | null;
    surahText: { arabic: SurahContent; english: SurahContent } | null;
    isLoadingContent: boolean;
    contentError: string | null;
    actions: {
        selectSurah: (surah: Surah) => Promise<void>;
        selectReciter: (reciter: Reciter) => void;
        toggleRadioMode: (active: boolean) => void;
        nextRadioSurah: () => void;
        retryLoadContent: () => void;
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
    const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
    const [isRadioMode, setIsRadioMode] = useState<boolean>(false);
    const [contentError, setContentError] = useState<string | null>(null);

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

                // Defaults
                if (fetchedReciters.length > 0) {
                    const sudais = fetchedReciters.find(r => r.identifier === 'ar.abdurrahmaansudais');
                    setSelectedReciter(sudais || fetchedReciters[0]);
                }

                // Load Surah Al-Fatiha by default
                if (fetchedSurahs.length > 0) {
                    selectSurah(fetchedSurahs[0]);
                }
            } catch (err) {
                setContentError('Failed to connect to the Quran API. Please check your internet connection.');
            }
        };

        init();
    }, []);

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
    }, []);

    const nextRadioSurah = useCallback(() => {
        if (surahs.length === 0 || reciters.length === 0) return;

        const randomSurah = surahs[Math.floor(Math.random() * surahs.length)];
        const randomReciter = reciters[Math.floor(Math.random() * reciters.length)];

        // Update reciter first to avoid race condition in audio fetching
        setSelectedReciter(randomReciter);
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

    const actions = useMemo(() => ({
        selectSurah,
        selectReciter,
        toggleRadioMode,
        nextRadioSurah,
        retryLoadContent
    }), [selectSurah, selectReciter, toggleRadioMode, nextRadioSurah, retryLoadContent]);

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
