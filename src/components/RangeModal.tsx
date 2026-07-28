import React, { useState, useEffect, useMemo } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { X, Play, SlidersHorizontal, Search, ChevronDown, Check, ArrowRight } from 'lucide-react';
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

  const [startSurahNumber, setStartSurahNumber] = useState<number>(
    initialSurahNumber || currentSurah?.number || 1
  );
  const [endSurahNumber, setEndSurahNumber] = useState<number>(
    initialSurahNumber || currentSurah?.number || 1
  );

  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(10);

  const [startSearch, setStartSearch] = useState<string>('');
  const [endSearch, setEndSearch] = useState<string>('');
  
  const [isStartDropdownOpen, setIsStartDropdownOpen] = useState<boolean>(false);
  const [isEndDropdownOpen, setIsEndDropdownOpen] = useState<boolean>(false);

  // Sync selected surahs when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeNumber = initialSurahNumber || currentSurah?.number || 1;
      setStartSurahNumber(activeNumber);
      setEndSurahNumber(activeNumber);
      const activeSurah = surahs.find(s => s.number === activeNumber);
      const maxAyahs = activeSurah?.numberOfAyahs || 7;
      setStartAyah(1);
      setEndAyah(Math.min(10, maxAyahs));
    }
  }, [isOpen, initialSurahNumber, currentSurah, surahs]);

  const startSurah = useMemo(() => {
    return surahs.find(s => s.number === startSurahNumber) || surahs[0];
  }, [surahs, startSurahNumber]);

  const endSurah = useMemo(() => {
    return surahs.find(s => s.number === endSurahNumber) || startSurah;
  }, [surahs, endSurahNumber, startSurah]);

  const maxStartAyahs = startSurah?.numberOfAyahs || 1;
  const maxEndAyahs = endSurah?.numberOfAyahs || 1;

  // Filtered surah lists
  const filteredStartSurahs = useMemo(() => {
    if (!startSearch) return surahs;
    const q = startSearch.toLowerCase();
    return surahs.filter(s =>
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [surahs, startSearch]);

  const filteredEndSurahs = useMemo(() => {
    // Only allow end surah >= start surah
    const eligible = surahs.filter(s => s.number >= startSurahNumber);
    if (!endSearch) return eligible;
    const q = endSearch.toLowerCase();
    return eligible.filter(s =>
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [surahs, startSurahNumber, endSearch]);

  // Adjust bounds when Start Surah changes
  const handleSelectStartSurah = (surahNum: number) => {
    setStartSurahNumber(surahNum);
    setStartAyah(1);
    setIsStartDropdownOpen(false);

    if (surahNum > endSurahNumber) {
      setEndSurahNumber(surahNum);
      const targetS = surahs.find(s => s.number === surahNum);
      setEndAyah(Math.min(10, targetS?.numberOfAyahs || 1));
    }
  };

  const handleSelectEndSurah = (surahNum: number) => {
    setEndSurahNumber(surahNum);
    setIsEndDropdownOpen(false);
    const targetS = surahs.find(s => s.number === surahNum);
    const maxA = targetS?.numberOfAyahs || 1;
    if (surahNum === startSurahNumber && endAyah < startAyah) {
      setEndAyah(startAyah);
    } else {
      setEndAyah(Math.min(endAyah, maxA));
    }
  };

  const handleStartAyahChange = (val: number) => {
    const validStart = Math.max(1, Math.min(val, maxStartAyahs));
    setStartAyah(validStart);
    if (startSurahNumber === endSurahNumber && validStart > endAyah) {
      setEndAyah(validStart);
    }
  };

  const handleEndAyahChange = (val: number) => {
    const minVal = startSurahNumber === endSurahNumber ? startAyah : 1;
    const validEnd = Math.max(minVal, Math.min(val, maxEndAyahs));
    setEndAyah(validEnd);
  };

  const handleSelectPreset = (presetType: '1-10' | 'full' | 'next3' | 'next5') => {
    if (presetType === '1-10') {
      setEndSurahNumber(startSurahNumber);
      setStartAyah(1);
      setEndAyah(Math.min(10, maxStartAyahs));
    } else if (presetType === 'full') {
      setEndSurahNumber(startSurahNumber);
      setStartAyah(1);
      setEndAyah(maxStartAyahs);
    } else if (presetType === 'next3') {
      setStartAyah(1);
      const targetEndNum = Math.min(114, startSurahNumber + 2);
      setEndSurahNumber(targetEndNum);
      const targetEndS = surahs.find(s => s.number === targetEndNum);
      setEndAyah(targetEndS?.numberOfAyahs || 1);
    } else if (presetType === 'next5') {
      setStartAyah(1);
      const targetEndNum = Math.min(114, startSurahNumber + 4);
      setEndSurahNumber(targetEndNum);
      const targetEndS = surahs.find(s => s.number === targetEndNum);
      setEndAyah(targetEndS?.numberOfAyahs || 1);
    }
  };

  const handlePlayRange = async () => {
    if (!startSurah || !endSurah) return;
    await quranActions.selectSurah(startSurah);
    const startIdx = Math.max(0, startAyah - 1);
    const endIdx = Math.min(maxEndAyahs - 1, Math.max(0, endAyah - 1));
    
    audioActions.setAyahIndex(startIdx);
    audioActions.setPlaybackRange({
      startSurahNumber: startSurah.number,
      startAyahIndex: startIdx,
      endSurahNumber: endSurah.number,
      endAyahIndex: endIdx
    });

    setTimeout(() => {
      audioActions.play();
    }, 300);

    onClose();
  };

  if (!isOpen) return null;

  const totalSurahsInRange = endSurahNumber - startSurahNumber + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-[var(--border)] rounded-full mx-auto mt-3 mb-1 sm:hidden opacity-60" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--bg-card)]/50">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-main">Play Verse Range</h3>
              <p className="text-xs text-muted">Play any range across Surahs & Verses</p>
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
          
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted uppercase tracking-wider">
              Quick Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('1-10')}
                className="py-1.5 px-1 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 text-main transition-all text-center"
              >
                This Surah (1-10)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('full')}
                className="py-1.5 px-1 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 text-main transition-all text-center"
              >
                Full Surah
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('next3')}
                className="py-1.5 px-1 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 text-accent transition-all text-center"
              >
                Next 3 Surahs
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('next5')}
                className="py-1.5 px-1 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-active)] hover:border-accent/40 text-accent transition-all text-center"
              >
                Next 5 Surahs
              </button>
            </div>
          </div>

          {/* FROM SECTION */}
          <div className="space-y-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/40 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" />
                FROM (Start)
              </span>
              <span className="text-[11px] font-mono text-muted">Surah {startSurah?.number} • {maxStartAyahs} Ayahs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Start Surah Dropdown */}
              <div className="sm:col-span-2 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStartDropdownOpen(!isStartDropdownOpen);
                    setIsEndDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] border border-[var(--border)] rounded-xl text-left transition-all"
                >
                  <span className="text-xs font-bold text-main truncate">
                    {startSurah?.number}. {startSurah?.englishName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isStartDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isStartDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden max-h-52 flex flex-col animate-in fade-in duration-150">
                    <div className="p-2 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-sidebar)]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          type="text"
                          placeholder="Search Start Surah..."
                          value={startSearch}
                          onChange={(e) => setStartSearch(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-main focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar p-1">
                      {filteredStartSurahs.map((s: Surah) => (
                        <button
                          key={s.number}
                          onClick={() => handleSelectStartSurah(s.number)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-colors ${
                            s.number === startSurahNumber
                              ? 'bg-accent/15 text-accent font-bold'
                              : 'text-main hover:bg-[var(--bg-card-active)]'
                          }`}
                        >
                          <span className="truncate">{s.number}. {s.englishName}</span>
                          {s.number === startSurahNumber && <Check className="w-3.5 h-3.5 text-accent" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Start Ayah Stepper */}
              <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--bg-sidebar)] p-1">
                <button
                  type="button"
                  onClick={() => handleStartAyahChange(startAyah - 1)}
                  disabled={startAyah <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-main hover:bg-[var(--bg-card-active)] disabled:opacity-30 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxStartAyahs}
                  value={startAyah}
                  onChange={(e) => handleStartAyahChange(parseInt(e.target.value) || 1)}
                  className="w-full text-center bg-transparent text-xs font-bold text-main focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleStartAyahChange(startAyah + 1)}
                  disabled={startAyah >= maxStartAyahs}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-main hover:bg-[var(--bg-card-active)] disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Arrow Divider */}
          <div className="flex items-center justify-center -my-2">
            <span className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shadow-sm">
              <ArrowRight className="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
            </span>
          </div>

          {/* TO SECTION */}
          <div className="space-y-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/40 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" />
                TO (End)
              </span>
              <span className="text-[11px] font-mono text-muted">Surah {endSurah?.number} • {maxEndAyahs} Ayahs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* End Surah Dropdown */}
              <div className="sm:col-span-2 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsEndDropdownOpen(!isEndDropdownOpen);
                    setIsStartDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[var(--bg-sidebar)] hover:bg-[var(--bg-card-active)] border border-[var(--border)] rounded-xl text-left transition-all"
                >
                  <span className="text-xs font-bold text-main truncate">
                    {endSurah?.number}. {endSurah?.englishName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isEndDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isEndDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden max-h-52 flex flex-col animate-in fade-in duration-150">
                    <div className="p-2 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-sidebar)]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                          type="text"
                          placeholder="Search End Surah..."
                          value={endSearch}
                          onChange={(e) => setEndSearch(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-main focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar p-1">
                      {filteredEndSurahs.map((s: Surah) => (
                        <button
                          key={s.number}
                          onClick={() => handleSelectEndSurah(s.number)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition-colors ${
                            s.number === endSurahNumber
                              ? 'bg-accent/15 text-accent font-bold'
                              : 'text-main hover:bg-[var(--bg-card-active)]'
                          }`}
                        >
                          <span className="truncate">{s.number}. {s.englishName}</span>
                          {s.number === endSurahNumber && <Check className="w-3.5 h-3.5 text-accent" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* End Ayah Stepper */}
              <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--bg-sidebar)] p-1">
                <button
                  type="button"
                  onClick={() => handleEndAyahChange(endAyah - 1)}
                  disabled={startSurahNumber === endSurahNumber ? endAyah <= startAyah : endAyah <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-main hover:bg-[var(--bg-card-active)] disabled:opacity-30 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min={startSurahNumber === endSurahNumber ? startAyah : 1}
                  max={maxEndAyahs}
                  value={endAyah}
                  onChange={(e) => handleEndAyahChange(parseInt(e.target.value) || 1)}
                  className="w-full text-center bg-transparent text-xs font-bold text-main focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleEndAyahChange(endAyah + 1)}
                  disabled={endAyah >= maxEndAyahs}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-main hover:bg-[var(--bg-card-active)] disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Validation & Range Summary */}
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-xs font-semibold text-accent truncate">
              {startSurah?.englishName} (Ayah {startAyah}) → {endSurah?.englishName} (Ayah {endAyah})
            </p>
            <p className="text-[10px] text-muted mt-0.5">
              {totalSurahsInRange === 1
                ? `1 Surah (${Math.max(1, endAyah - startAyah + 1)} Verses)`
                : `${totalSurahsInRange} Surahs in range`}
            </p>
          </div>

        </div>

        {/* Modal Footer / Play Action */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card)]/50">
          <button
            type="button"
            onClick={handlePlayRange}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play Range ({startSurah?.englishName} v{startAyah} → {endSurah?.englishName} v{endAyah})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
