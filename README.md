# 📖 HearQuran - Quran Listening & Reading Player

HearQuran is a premium, modern Quran web player designed for immersive listening, reading, and memorization. Built with a focus on rich design aesthetics, responsive controls, and offline capabilities.

---

## ✨ Features

### 🎧 Listening & Playback Control
- **Reciter Selection**: Choose from leading global reciters (Sheikh Sudais, Maher Al-Muaiqly, Al-Shuraim, Hudhaify, Ayyub, Minshawi) or select high-fidelity manual streams (Luhaidan, Yasser Al-Dosari, Ahmed bin Talib).
- **Verse-by-Verse (VBV) Repeating**: Loop specific verses (`1x`, `3x`, `5x`, or `∞` infinitely) to assist with memorization (Hifz).
- **Auto-Advance**: Plays the next verse automatically once the previous one finishes.
- **HearQuran Radio Mode**: Enter an ambient random stream that plays beautiful, continuous recitations.
- **Sleep Timer**: Configure the player to automatically pause recitation after `15`, `30`, `45`, or `60` minutes.

### 📖 Reading & Customization
- **Display Modes**: Toggle between Quranic Arabic script only, English translation only, or side-by-side both.
- **Custom Font Sizing**: Sliders to adjust Arabic and translation text sizes, automatically scaling down on mobile screens.
- **Bookmarks & Favorites**: Quick-bookmark individual verses. Access saved favorites from a dedicated Sidebar tab to instantly navigate and smoothly scroll directly to them.
- **Auto-Resume Last Session**: Automatically stores your progress. When opening the app, a sleek banner invites you to pick up exactly where you left off.
- **Search in Surah**: Filter and highlight occurrences of specific words in both Arabic and English translation with live match counters.

### 🎨 Premium Design System (Sleek Modes)
Custom spiritual dark palettes designed to minimize eye strain and match spiritual atmospheres:
1. **Default Dark**: Standard deep slate gray with vibrant ocean blue accents.
2. **Midnight Kaba**: Pitch charcoal background with premium gold and amber accents.
3. **Medina Emerald**: Deep emerald green backdrop with warm gold highlights.
4. **Rose Gold Dust**: Dark mahogany background with metallic rose gold accents.

### ⚡ Technical Highlights
- **Tailwind CSS v4 & PostCSS**: Custom theme configs compiled inline in CSS, leveraging CSS custom variables for instant color theme switches.
- **TypeScript Strict Mode**: Fully compiled with strict safety checks (`npx tsc --noEmit` checks pass clean).
- **Performance Optimized**: Sub-renders are optimized using `React.memo` for verse items, preventing massive re-render loops on audio update ticks.
- **Offline Capabilities (PWA)**: Implemented Service Worker caching for Quranic text and details.
- **Keyboard Controls**: Bound shortcuts (`Space` to play/pause, `Left/Right arrows` for previous/next verse, and `Esc` to toggle the Sidebar).
- **Mobile Touch Enhancements**: Oversized hitboxes for playback controls and hidden hover controls exposed.

---

## 🛠️ Tech Stack
- **Core**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS v4, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **API**: Alquran.cloud REST API

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/loneaiyan01/QuranPro1.git
   ```
2. Navigate to the project directory:
   ```bash
   cd "Quran Player"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Scripts
- **Start Dev Server**:
  ```bash
  npm run dev
  ```
- **Build Production Bundle**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

---

## 📝 License
Data fetched dynamically from the public `Alquran.cloud` API. All audio is property of their respective reciters.
