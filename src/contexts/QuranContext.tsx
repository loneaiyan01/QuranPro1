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
    actions: {
        selectSurah: (surah: Surah) => Promise<void>;
        selectReciter: (reciter: Reciter) => void;
        toggleRadioMode: (active: boolean) => void;
        nextRadioSurah: () => void;
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

    // Initialization
    useEffect(() => {
        const init = async () => {
            const [fetchedSurahs, fetchedReciters] = await Promise.all([
                fetchSurahs(),
                fetchReciters()
            ]);
            setSurahs(fetchedSurahs);
            setReciters(fetchedReciters);

            // Defaults
            if (fetchedReciters.length > 0) {
                // Prefer Sudais if available, otherwise first
                const sudais = fetchedReciters.find(r => r.identifier === 'ar.abdurrahmaansudais');
                setSelectedReciter(sudais || fetchedReciters[0]);
            }

            // Load Surah Al-Fatiha by default
            if (fetchedSurahs.length > 0) {
                selectSurah(fetchedSurahs[0]);
            }
        };

        init();
    }, []);

    const selectSurah = useCallback(async (surah: Surah) => {
        setIsLoadingContent(true);
        setCurrentSurah(surah);
        // Note: Audio stop logic will need to be handled by AudioContext listening to currentSurah changes

        // Fetch text data
        const textData = await fetchSurahText(surah.number);
        setSurahText(textData);

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

    const actions = useMemo(() => ({
        selectSurah,
        selectReciter,
        toggleRadioMode,
        nextRadioSurah
    }), [selectSurah, selectReciter, toggleRadioMode, nextRadioSurah]);

    return (
        <QuranContext.Provider
            value={{
                surahs,
                reciters,
                currentSurah,
                selectedReciter,
                surahText,
                isLoadingContent,
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
