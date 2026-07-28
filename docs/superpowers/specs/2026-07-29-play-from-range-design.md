# Play from Range (Play from Element) Feature Design

**Date**: 2026-07-29  
**Status**: Approved  

---

## 1. Overview
The "Resume Session" button on the Home Page is replaced with a mobile-optimized **"Play Verse Range"** feature. This allows users to select any Surah and define a custom Start Ayah and End Ayah range to play continuously until the end verse of the range is reached, at which point audio automatically pauses.

---

## 2. Requirements & User Flow
1. **Home Page Quick Action Bar**:
   - Replace "Resume Session" quick action button with "Play Verse Range".
   - Clicking opens the Range Selection Modal / Bottom Sheet.
2. **Range Selection Modal / Bottom Sheet**:
   - Touch-friendly Bottom Sheet on mobile viewports (<640px) and centered Modal on desktop (≥640px).
   - Surah Selector (1-114) with search and total Ayah indicator.
   - Start Ayah picker (`From`) and End Ayah picker (`To`) with numeric inputs and stepper buttons (`-` / `+`).
   - Quick preset chips (`1-10`, `1-20`, `1-50`, `Full Surah`).
   - Real-time range validation: `1 <= Start <= End <= Max Ayahs`.
3. **Playback Execution**:
   - On tapping "Play Range", audio starts playing from `Start Ayah`.
   - Audio automatically pauses when playback finishes `End Ayah`.

---

## 3. Architecture & State Changes
- **`AudioContext`**:
  - State: `playbackRange: { startAyah: number; endAyah: number } | null`.
  - Action: `setPlaybackRange(range: { startAyah: number; endAyah: number } | null)`.
  - Effect: Monitor audio progress/verse index transitions. When `currentAyahIndex > endAyah`, trigger pause and clear or hold range state.
- **`HomePage`**:
  - Replace `sessionData` button with `Play Verse Range` trigger button.
  - Add state for managing `RangeModal` visibility.
- **`RangeModal` Component (`src/components/RangeModal.tsx`)**:
  - New modular component containing Surah selector, range inputs, preset chips, and play trigger.

---

## 4. Mobile & Touch Optimizations
- Minimum 44px touch targets for steppers and preset chips.
- Slide-up bottom sheet with backdrop blur and swipeable header on mobile screens.
- Auto-focused input sanitization for valid verse bounds.
