import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
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

    // Effect: Load Audio Data
    useEffect(() => {
        if (currentSurah && selectedReciter) {
            const loadAudio = async () => {
                const audio = await fetchSurahAudio(currentSurah.number, selectedReciter.identifier);
                setAudioData(audio);
            };
            loadAudio();
        }
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
                audioRef.current.volume = 0; // Prepare for fade
                audioRef.current.load();

                if (wasPlaying) {
                    audioRef.current.play().catch(e => {
                        console.error("Autoplay prevented or failed", e);
                        setIsPlaying(false);
                    });
                }
            }
        }
    }, [currentAyahIndex, audioData, isFullSurahAudio, isPlaying, isRadioMode]);

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
            if (isRadioMode) {
                isTransitioning.current = true;
                actions.nextRadioSurah();
                return;
            }

            if (isFullSurahAudio) {
                setIsPlaying(false);
                setProgress(0);
                setBuffered(0);
                return;
            }

            // Auto-sync: Move to next ayah with seamless transition
            if (surahText && currentAyahIndex < surahText.arabic.ayahs.length - 1) {
                isTransitioning.current = true;
                setCurrentAyahIndex(prev => prev + 1);
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
                setProgress(0);
                setBuffered(0);
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
            if (isTransitioning.current && isPlaying) {
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

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('stalled', handleStalled);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('canplaythrough', handleCanPlayThrough);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('stalled', handleStalled);
        };
    }, [currentAyahIndex, surahText, isPlaying, isFullSurahAudio, fadeAudioIn]);

    // Media Session API Integration
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
    }, [selectedReciter, currentSurah, currentAyahIndex, isPlaying]);

    // Actions
    const togglePlay = () => {
        if (!audioRef.current || audioData.length === 0) return;

        const targetIndex = isFullSurahAudio ? 0 : currentAyahIndex;
        if (!audioData[targetIndex]) return;

        if (isPlaying) {
            fadeAudioOut(() => {
                audioRef.current?.pause();
                setIsPlaying(false);
            });
        } else {
            audioRef.current.volume = 0;
            audioRef.current.play().catch(console.error);
            setIsPlaying(true);
        }
    };

    const play = () => {
        if (audioRef.current) audioRef.current.play();
    };

    const pause = () => {
        if (audioRef.current) audioRef.current.pause();
    };

    const nextAyah = () => {
        if (isFullSurahAudio) return;
        if (surahText && currentAyahIndex < surahText.arabic.ayahs.length - 1) {
            setCurrentAyahIndex(prev => prev + 1);
        }
    };

    const prevAyah = () => {
        if (isFullSurahAudio) return;
        if (currentAyahIndex > 0) {
            setCurrentAyahIndex(prev => prev - 1);
        }
    };

    const seek = (value: number) => {
        if (audioRef.current && duration) {
            const time = (value / 100) * duration;
            audioRef.current.currentTime = time;
            setProgress(value);
        }
    };

    const setAyahIndex = (index: number) => {
        setCurrentAyahIndex(index);
    };

    const handleSetSleepTimer = (minutes: number | null) => {
        setSleepTimer(minutes);
    };

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
                actions: {
                    togglePlay,
                    play,
                    pause,
                    nextAyah,
                    prevAyah,
                    seek,
                    setAyahIndex,
                    setSleepTimer: handleSetSleepTimer
                }
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
