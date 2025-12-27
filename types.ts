export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number; // Global ayah number
  numberInSurah: number;
  text: string;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface SurahContent {
  number: number;
  englishName: string;
  ayahs: Ayah[];
  edition: Edition;
}

export interface AudioAyah {
  number: number;
  audio: string;
  audioSecondary: string[];
  text: string;
  numberInSurah: number;
}

export interface Reciter {
  identifier: string;
  name: string;
  englishName: string;
  language: string;
  format: string;
  type: string;
  isVerseByVerse: boolean;
  urlPrefix?: string;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SEPIA = 'sepia',
  MINIMAL = 'minimal'
}

export enum DisplayMode {
  BOTH = 'both',
  ARABIC_ONLY = 'arabic',
  ENGLISH_ONLY = 'english'
}
