import React, { useEffect, useState } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { Clock, Play, X } from 'lucide-react';

export const ResumePrompt: React.FC = () => {
    const { surahs, actions: quranActions } = useQuran();
    const { actions: audioActions } = useAudio();
    const [show, setShow] = useState<boolean>(false);
    const [sessionData, setSessionData] = useState<{
        surahNumber: number;
        surahEnglishName: string;
        ayahIndex: number;
        timestamp: number;
    } | null>(null);

    useEffect(() => {
        // Only run after a small delay to let surahs load
        const timer = setTimeout(() => {
            const saved = localStorage.getItem('tarteela_last_session');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Only show if the session has meaningful progress beyond Fatiha Verse 1
                    if (parsed && (parsed.surahNumber > 1 || parsed.ayahIndex > 0)) {
                        setSessionData(parsed);
                        setShow(true);
                    }
                } catch (e) {
                    console.error("Failed to parse last session", e);
                }
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    const handleResume = async () => {
        if (!sessionData) return;
        const targetSurah = surahs.find(s => s.number === sessionData.surahNumber);
        if (targetSurah) {
            await quranActions.selectSurah(targetSurah);
            audioActions.setAyahIndex(sessionData.ayahIndex);
        }
        setShow(false);
    };

    const handleDismiss = () => {
        setShow(false);
    };

    if (!show || !sessionData) return null;

    return (
        <div className="fixed top-20 right-4 left-4 md:left-auto md:w-80 z-[90] glass-panel p-4 rounded-2xl border border-[var(--border-active)] shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-muted text-accent flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">Resume Listening?</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Pick up where you left off: <strong className="text-main font-semibold">Surah {sessionData.surahEnglishName}</strong> (Verse {sessionData.ayahIndex + 1}).
                    </p>
                    <div className="flex items-center gap-2 mt-3 pt-1">
                        <button
                            onClick={handleResume}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 text-white rounded-lg text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-accent/20"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Resume
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-3 py-1.5 hover:bg-white/5 text-[var(--text-muted)] hover:text-main rounded-lg text-xs font-bold transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/5 text-[var(--text-muted)] hover:text-main rounded-lg transition-colors flex-shrink-0 self-start animate-none"
                    aria-label="Dismiss prompt"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
