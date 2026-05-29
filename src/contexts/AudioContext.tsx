import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import { AudioAyah } from '../types';
import { useQuran } from './QuranContext';
import { fetchSurahAudio } from '../services/api';

interface AudioContextType {
    isPlaying: boolean;
    progress: number;
    buffered: number;
    currentTime: number;
    duration: number;
    currentAyahIndex: number;
    audioData: AudioAyah[];
    isFullSurahAudio: boolean;
    isBuffering: boolean;
    sleepTimer: number | null;
    actions: {
        togglePlay: () => void;
        play: () => void;
        pause: () => void;
        nextAyah: () => void;
        prevAyah: () => void;
        seek: (value: number) => void;
        setAyahIndex: (index: number) => void;
        setSleepTimer: (minutes: number | null) => void;
    };
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentSurah, selectedReciter, surahText, isRadioMode, actions } = useQuran();
    const [audioData, setAudioData] = useState<AudioAyah[]>([]);
    const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);

    // Audio State
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [buffered, setBuffered] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isBuffering, setIsBuffering] = useState<boolean>(false);
    const [sleepTimer, setSleepTimer] = useState<number | null>(null);
    const isTransitioning = useRef<boolean>(false);
    const fadeRef = useRef<number | null>(null);

    // Derived State
    const isFullSurahAudio = selectedReciter ? !selectedReciter.isVerseByVerse : false;

    // Mutable state reference to avoid stale closures in audio event listeners
    const stateRef = useRef({
        isRadioMode,
        isFullSurahAudio,
        currentAyahIndex,
        surahText,
        isPlaying,
        nextRadioSurah: actions.nextRadioSurah
    });

    useEffect(() => {
        stateRef.current = {
            isRadioMode,
            isFullSurahAudio,
            currentAyahIndex,
            surahText,
            isPlaying,
            nextRadioSurah: actions.nextRadioSurah
        };
    }, [isRadioMode, isFullSurahAudio, currentAyahIndex, surahText, isPlaying, actions.nextRadioSurah]);

    // Effect: Clean up fade interval on unmount
    useEffect(() => {
        return () => {
            if (fadeRef.current) {
                clearInterval(fadeRef.current);
            }
        };
    }, []);

    // Helper: Fade In Audio
    const fadeAudioIn = useCallback(() => {
        if (!audioRef.current) return;

        // Clear any existing fade
        if (fadeRef.current) {
            clearInterval(fadeRef.current);
        }

        const audio = audioRef.current;
        audio.volume = 0;
        const duration = 400; // ms
        const step = 0.05;
        const interval = duration * step;

        fadeRef.current = window.setInterval(() => {
            if (audio.volume < 1) {
                audio.volume = Math.min(1, audio.volume + step);
            } else {
                clearInterval(fadeRef.current!);
                fadeRef.current = null;
            }
        }, interval);
    }, []);

    // Helper: Fade Out Audio
    const fadeAudioOut = useCallback((callback?: () => void) => {
        if (!audioRef.current) {
            if (callback) callback();
            return;
        }

        // Clear any existing fade
        if (fadeRef.current) {
            clearInterval(fadeRef.current);
        }

        const audio = audioRef.current;
        const startVolume = audio.volume;
        const duration = 300; // ms
        const steps = 10;
        const stepValue = startVolume / steps;
        const interval = duration / steps;

        fadeRef.current = window.setInterval(() => {
            if (audio.volume > 0.05) {
                audio.volume = Math.max(0, audio.volume - stepValue);
            } else {
                audio.volume = 0;
                clearInterval(fadeRef.current!);
                fadeRef.current = null;
                if (callback) callback();
            }
        }, interval);
    }, []);

    // Effect: Reset state when Surah changes
    useEffect(() => {
        if (currentSurah) {
            setCurrentAyahIndex(0);
            if (!isRadioMode) setIsPlaying(false);
            setProgress(0);
            setBuffered(0);
            setCurrentTime(0);

            // Stop and reset audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        }
    }, [currentSurah, isRadioMode]);

    // Effect: Persist session progress to localStorage
    useEffect(() => {
        if (currentSurah && !isRadioMode) {
            const session = {
                surahNumber: currentSurah.number,
                surahEnglishName: currentSurah.englishName,
                ayahIndex: currentAyahIndex,
                timestamp: Date.now()
            };
            localStorage.setItem('tarteela_last_session', JSON.stringify(session));
        }
    }, [currentSurah, currentAyahIndex, isRadioMode]);

    // Effect: Load Audio Data with async race condition cleanup
    useEffect(() => {
        let isCurrent = true;
        if (currentSurah && selectedReciter) {
            const loadAudio = async () => {
                const audio = await fetchSurahAudio(currentSurah.number, selectedReciter.identifier);
                if (isCurrent) {
                    setAudioData(audio);
                }
            };
            loadAudio();
        }
        return () => {
            isCurrent = false;
        };
    }, [currentSurah, selectedReciter]);

    // Audio Logic: Source Management with Preloading
    useEffect(() => {
        const targetIndex = isFullSurahAudio ? 0 : currentAyahIndex;

        if (audioData.length > 0 && audioRef.current && targetIndex < audioData.length) {
            const audioUrl = audioData[targetIndex]?.audio;

            if (audioUrl && audioRef.current.src !== audioUrl) {
                // Save current play state
                const wasPlaying = isPlaying || isTransitioning.current;
                isTransitioning.current = false;

                audioRef.current.src = audioUrl;
                audioRef.current.volume = wasPlaying ? 0 : 1; // Prepare for fade if playing
                audioRef.current.load();

                if (wasPlaying) {
                    audioRef.current.play().then(() => {
                        fadeAudioIn();
                    }).catch(e => {
                        console.error("Autoplay prevented or failed", e);
                        setIsPlaying(false);
                    });
                }
            }
        }
    }, [currentAyahIndex, audioData, isFullSurahAudio, isPlaying, fadeAudioIn]);

    // Audio Logic: Preload Next Verse (Only for VBV mode)
    useEffect(() => {
        if (!isFullSurahAudio && audioData.length > 0 && currentAyahIndex < audioData.length - 1) {
            const nextAudioUrl = audioData[currentAyahIndex + 1]?.audio;
            if (nextAudioUrl && preloadAudioRef.current) {
                preloadAudioRef.current.src = nextAudioUrl;
                preloadAudioRef.current.load();
            }
        }
    }, [currentAyahIndex, audioData, isFullSurahAudio]);

    // Sleep Timer Logic
    useEffect(() => {
        if (sleepTimer === null) return;

        if (sleepTimer <= 0) {
            if (isPlaying) togglePlay();
            setSleepTimer(null);
            return;
        }

        const interval = setInterval(() => {
            setSleepTimer(prev => (prev && prev > 0 ? prev - 1 : 0));
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [sleepTimer, isPlaying]);

    // Audio Event Listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }

            // Update buffered amount
            if (audio.buffered.length > 0 && audio.duration) {
                const lastBuffered = audio.buffered.end(audio.buffered.length - 1);
                setBuffered((lastBuffered / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            const { isRadioMode, isFullSurahAudio, currentAyahIndex, surahText, nextRadioSurah } = stateRef.current;

            // If we are in verse-by-verse mode and not at the last ayah, advance to the next ayah
            if (!isFullSurahAudio && surahText && currentAyahIndex < surahText.arabic.ayahs.length - 1) {
                isTransitioning.current = true;
                setCurrentAyahIndex(prev => prev + 1);
                setIsPlaying(true);
                return;
            }

            // Otherwise, we reached the end of the surah (either full surah audio ended, or last VBV verse ended)
            if (isRadioMode) {
                isTransitioning.current = true;
                nextRadioSurah();
            } else {
                setIsPlaying(false);
                setProgress(0);
                setBuffered(0);
                setCurrentTime(0);
            }
        };

        const handlePlay = () => {
            setIsPlaying(true);
            fadeAudioIn();
        };

        const handlePause = () => {
            if (!audio.ended && !isTransitioning.current) {
                setIsPlaying(false);
            }
        };

        const handleCanPlayThrough = () => {
            setIsBuffering(false);
            if (isTransitioning.current && stateRef.current.isPlaying) {
                audio.volume = 0;
                audio.play().catch(console.error);
            }
        };

        const handleWaiting = () => {
            setIsBuffering(true);
        };

        const handleStalled = () => {
            setIsBuffering(true);
        };

        const handlePlaying = () => {
            setIsBuffering(false);
        };

        const handleError = (e: Event) => {
            const error = (e.target as HTMLAudioElement).error;
            console.error("Audio element error details:", error);
            setIsBuffering(false);
            setIsPlaying(false);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('stalled', handleStalled);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('canplaythrough', handleCanPlayThrough);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('stalled', handleStalled);
            audio.removeEventListener('error', handleError);
        };
    }, [fadeAudioIn]);

    // Media Session API Integration with cleanup
    useEffect(() => {
        if ('mediaSession' in navigator && selectedReciter && currentSurah) {
            const artworkUrl = `/assets/reciters/${selectedReciter.identifier}.png`;

            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentSurah.englishName,
                artist: selectedReciter.name,
                album: 'Tarteela',
                artwork: [
                    { src: artworkUrl, sizes: '512x512', type: 'image/png' },
                    { src: '/assets/reciters/default.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => togglePlay());
            navigator.mediaSession.setActionHandler('pause', () => togglePlay());
            navigator.mediaSession.setActionHandler('previoustrack', prevAyah);
            navigator.mediaSession.setActionHandler('nexttrack', nextAyah);
        }

        return () => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            }
        };
    }, [selectedReciter, currentSurah, currentAyahIndex, isPlaying]);

    // Actions wrapped in useCallback and useMemo
    const togglePlay = useCallback(() => {
        if (!audioRef.current || audioData.length === 0) return;

        const targetIndex = isFullSurahAudio ? 0 : currentAyahIndex;
        const currentTrack = audioData[targetIndex];
        if (!currentTrack) return;

        // Ensure the source is set synchronously within user gesture
        if (currentTrack.audio && audioRef.current.src !== currentTrack.audio) {
            audioRef.current.src = currentTrack.audio;
            audioRef.current.load();
        }

        if (isPlaying) {
            // Stop any active fading animations
            if (fadeRef.current) {
                clearInterval(fadeRef.current);
                fadeRef.current = null;
            }
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Initialize volume to full immediately before playing on mobile to prevent muted play issues
            audioRef.current.volume = 1;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                    fadeAudioIn();
                }).catch(e => {
                    console.error("Mobile play gesture failed", e);
                    setIsPlaying(false);
                });
            } else {
                setIsPlaying(true);
            }
        }
    }, [audioData, isFullSurahAudio, currentAyahIndex, isPlaying, fadeAudioIn]);

    const play = useCallback(() => {
        if (audioRef.current) audioRef.current.play();
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) audioRef.current.pause();
    }, []);

    const nextAyah = useCallback(() => {
        if (isFullSurahAudio) return;
        if (surahText && currentAyahIndex < surahText.arabic.ayahs.length - 1) {
            setCurrentAyahIndex(prev => prev + 1);
        }
    }, [isFullSurahAudio, surahText, currentAyahIndex]);

    const prevAyah = useCallback(() => {
        if (isFullSurahAudio) return;
        if (currentAyahIndex > 0) {
            setCurrentAyahIndex(prev => prev - 1);
        }
    }, [isFullSurahAudio, currentAyahIndex]);

    const seek = useCallback((value: number) => {
        if (audioRef.current && duration) {
            const time = (value / 100) * duration;
            audioRef.current.currentTime = time;
            setProgress(value);
        }
    }, [duration]);

    const setAyahIndex = useCallback((index: number) => {
        setCurrentAyahIndex(index);
    }, []);

    const handleSetSleepTimer = useCallback((minutes: number | null) => {
        setSleepTimer(minutes);
    }, []);

    const audioActions = useMemo(() => ({
        togglePlay,
        play,
        pause,
        nextAyah,
        prevAyah,
        seek,
        setAyahIndex,
        setSleepTimer: handleSetSleepTimer
    }), [togglePlay, play, pause, nextAyah, prevAyah, seek, setAyahIndex, handleSetSleepTimer]);

    return (
        <AudioContext.Provider
            value={{
                isPlaying,
                progress,
                buffered,
                currentTime,
                duration,
                currentAyahIndex,
                audioData,
                isFullSurahAudio,
                isBuffering,
                sleepTimer,
                actions: audioActions
            }}
        >
            {/* Hidden Audio Elements */}
            <audio ref={audioRef} preload="auto" />
            <audio ref={preloadAudioRef} preload="auto" />

            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
