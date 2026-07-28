import React, { useState, useEffect, useMemo } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { X, Play, SlidersHorizontal, Search, ChevronDown, Check } from 'lucide-react';
import { Surah } from '../types';

interface RangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSurahNumber?: number;
}

export const RangeModal: React.FC<RangeModalProps> = ({
  isOpen,
  onClose,
  initialSurahNumber
}) => {
  const { surahs, currentSurah, actions: quranActions } = useQuran();
  const { actions: audioActions } = useAudio();

  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(
    initialSurahNumber || currentSurah?.number || 1
  );
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(10);
  const [surahSearch, setSurahSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Sync selected surah if modal opens or currentSurah updates
  useEffect(() => {
    if (isOpen) {
      const activeNumber = initialSurahNumber || currentSurah?.number || 1;
      setSelectedSurahNumber(activeNumber);
      const activeSurah = surahs.find(s => s.number === activeNumber);
      const maxAyahs = activeSurah?.numberOfAyahs || 7;
      setStartAyah(1);
      setEndAyah(Math.min(10, maxAyahs));
    }
  }, [isOpen, initialSurahNumber, currentSurah, surahs]);

  const activeSurah = useMemo(() => {
    return surahs.find(s => s.number === selectedSurahNumber) || surahs[0];
  }, [surahs, selectedSurahNumber]);

  const maxAyahs = activeSurah?.numberOfAyahs || 1;

  // Filtered surah list for search dropdown
  const filteredSurahs = useMemo(() => {
    if (!surahSearch) return surahs;
    const q = surahSearch.toLowerCase();
    return surahs.filter(s =>
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [surahs, surahSearch]);

  // Adjust endAyah if startAyah exceeds it or maxAyahs changes
  const handleStartAyahChange = (val: number) => {
    const validStart = Math.max(1, Math.min(val, maxAyahs));
    setStartAyah(validStart);
    if (validStart > endAyah) {
      setEndAyah(validStart);
    }
  };

  const handleEndAyahChange = (val: number) => {
    const validEnd = Math.max(startAyah, Math.min(val, maxAyahs));
    setEndAyah(validEnd);
  };

  const handleSelectPreset = (start: number, count: number) => {
    const s = Math.max(1, Math.min(start, maxAyahs));
    const e = Math.min(s + count - 1, maxAyahs);
    setStartAyah(s);
    setEndAyah(e);
  };

  const handlePlayRange = async () => {
    if (!activeSurah) return;
    await quranActions.selectSurah(activeSurah);
    const startIdx = Math.max(0, startAyah - 1);
    const endIdx = Math.min(maxAyahs - 1, Math.max(startIdx, endAyah - 1));
    
    audioActions.setAyahIndex(startIdx);
    audioActions.setPlaybackRange({ startAyah: startIdx, endAyah: endIdx });

    setTimeout(() => {
      audioActions.play();
    }, 300);

    onClose();
  };

  if (!isOpen) return null;

  const totalVersesToPlay = Math.max(1, endAyah - startAyah + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mt-3 mb-1 sm:hidden opacity-60" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-card)]/50">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-main">Play Verse Range</h3>
              <p className="text-xs text-muted">Select Surah & Ayah boundaries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-main hover:bg-[var(--bg-card-active)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Surah Selector */}
          <div className="space-y-2 relative">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              Select Surah
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] border border-[var(--border)] rounded-xl text-left transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-accent/15 text-accent font-semibold text-xs flex items-center justify-center flex-shrink-0">
                  {activeSurah?.number}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-main truncate">
                    {activeSurah?.englishName}
                  </div>
                  <div className="text-xs text-muted truncate">
                    {activeSurah?.englishNameTranslation} • {activeSurah?.numberOfAyahs} Verses
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Surah Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden max-h-56 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-sidebar)]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      placeholder="Search Surah..."
                      value={surahSearch}
                      onChange={(e) => setSurahSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-main focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto custom-scrollbar p-1">
                  {filteredSurahs.map((s: Surah) => (
                    <button
                      key={s.number}
                      onClick={() => {
                        setSelectedSurahNumber(s.number);
                        setStartAyah(1);
                        setEndAyah(Math.min(10, s.numberOfAyahs));
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                        s.number === selectedSurahNumber
                          ? 'bg-accent/15 text-accent font-bold'
                          : 'text-main hover:bg-[var(--bg-card-active)]'
                      }`}
                    >
                      <span className="truncate">
                        {s.number}. {s.englishName} ({s.numberOfAyahs} Ayahs)
                      </span>
                      {s.number === selectedSurahNumber && <Check className="w-3.5 h-3.5 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">
              Quick Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset(1, 10)}
                className="py-2 px-1 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 text-main transition-all text-center"
              >
                1–10
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(1, 20)}
                className="py-2 px-1 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 text-main transition-all text-center"
              >
                1–20
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(1, 50)}
                className="py-2 px-1 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 text-main transition-all text-center"
              >
                1–50
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset(1, maxAyahs)}
                className="py-2 px-1 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 text-accent transition-all text-center truncate"
              >
                All ({maxAyahs})
              </button>
            </div>
          </div>

          {/* Range Inputs (From & To) */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            {/* From Verse */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                From Verse
              </label>
              <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--bg-card)] p-1">
                <button
                  type="button"
                  onClick={() => handleStartAyahChange(startAyah - 1)}
                  disabled={startAyah <= 1}
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-main hover:bg-[var(--bg-card-active)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxAyahs}
                  value={startAyah}
                  onChange={(e) => handleStartAyahChange(parseInt(e.target.value) || 1)}
                  className="w-full text-center bg-transparent text-sm font-bold text-main focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleStartAyahChange(startAyah + 1)}
                  disabled={startAyah >= maxAyahs}
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-main hover:bg-[var(--bg-card-active)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* To Verse */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                To Verse
              </label>
              <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--bg-card)] p-1">
                <button
                  type="button"
                  onClick={() => handleEndAyahChange(endAyah - 1)}
                  disabled={endAyah <= startAyah}
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-main hover:bg-[var(--bg-card-active)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={startAyah}
                  max={maxAyahs}
                  value={endAyah}
                  onChange={(e) => handleEndAyahChange(parseInt(e.target.value) || startAyah)}
                  className="w-full text-center bg-transparent text-sm font-bold text-main focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleEndAyahChange(endAyah + 1)}
                  disabled={endAyah >= maxAyahs}
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-main hover:bg-[var(--bg-card-active)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Validation Info */}
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-xs font-semibold text-accent">
              Playing Ayah {startAyah} to {endAyah} ({totalVersesToPlay} {totalVersesToPlay === 1 ? 'Verse' : 'Verses'})
            </p>
          </div>

        </div>

        {/* Modal Footer / Play Action */}
        <div className="p-5 border-t border-[var(--border)] bg-[var(--bg-card)]/50">
          <button
            type="button"
            onClick={handlePlayRange}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Range ({startAyah} – {endAyah})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
