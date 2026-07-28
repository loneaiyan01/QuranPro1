# Play from Range (Cross-Surah) Feature Design

**Date**: 2026-07-29  
**Status**: Approved  

---

## 1. Overview
The "Play Verse Range" feature supports cross-Surah playback ranges, allowing users to specify a starting Surah + Ayah (e.g. Surah Yaseen 36, Ayah 5) and an ending Surah + Ayah (e.g. Surah Al-Qalam 68, Ayah 10). The player will play continuously across Surah boundaries and automatically pause when the ending verse of the ending Surah finishes.

---

## 2. Requirements & User Flow
1. **Home Page Action Button**:
   - Clicking "Play Verse Range" opens the Range Selector Modal / Bottom Sheet.
2. **Range Selection Modal / Bottom Sheet**:
   - **From Boundary**: Select Start Surah (1-114) and Start Ayah.
   - **To Boundary**: Select End Surah (1-114, >= Start Surah) and End Ayah.
   - **Validation Rules**:
     - `1 <= Start Surah <= End Surah <= 114`.
     - If `Start Surah === End Surah`, `1 <= Start Ayah <= End Ayah <= Max Ayahs`.
     - If `Start Surah < End Surah`, `1 <= Start Ayah <= Start Surah Max Ayahs` and `1 <= End Ayah <= End Surah Max Ayahs`.
3. **Playback Execution**:
   - **Start Surah**: Audio begins at `Start Ayah` and plays to the end of Start Surah, then advances to next Surah.
   - **Intermediate Surahs**: Audio plays from Ayah 1 through the end of the Surah, advancing to next Surah.
   - **End Surah**: Audio plays from Ayah 1 up to `End Ayah`. Once `End Ayah` finishes, audio automatically pauses and range resets.

---

## 3. Architecture & State Changes
- **`AudioContext`**:
  - `PlaybackRange` type:
    ```ts
    export interface PlaybackRange {
      startSurahNumber: number;
      startAyahIndex: number; // 0-indexed
      endSurahNumber: number;
      endAyahIndex: number;   // 0-indexed
    }
    ```
  - `handleEnded`:
    - If `currentSurah.number === playbackRange.endSurahNumber` AND `currentAyahIndex >= playbackRange.endAyahIndex`: pause audio & clear `playbackRange`.
    - If `currentSurah.number < playbackRange.endSurahNumber` AND at last verse of current surah: advance to next surah (`selectSurah(nextSurah)`), keeping `playbackRange` active.
- **`RangeModal` Component**:
  - Start Surah & Start Ayah pickers.
  - End Surah & End Ayah pickers.
  - Quick Presets: `This Surah (1-10)`, `This Surah (Full)`, `Next 3 Surahs`, `Custom`.
  - Summary indicator (e.g. `Surah Yaseen (v5) → Surah Al-Qalam (v10)`).
- **`PlayerControls`**:
  - Displays active range badge pill (e.g. `Range: Yaseen (v5) → Al-Qalam (v10)`) with "Clear Range" action.
