import { Reciter } from '../types';

export const ALLOWED_IDENTIFIERS = [
  'ar.abdurrahmaansudais',  // Sudais
  'ar.saoodshuraym',        // Shuraim
  'ar.mahermuaiqly',        // Maher
  'ar.muhammadayyoub',      // Muhammad Ayyub
  'ar.hudhaify',            // Hudhaify
  'ar.yasseraldosari',      // Yasser Al-Dosari (Manual)
  'ar.muhammadalluhaidan',  // Luhaidan (Manual)
  'ar.ahmedtalib'           // Ahmed bin Talib (Manual)
];

export const MANUAL_RECITERS: Reciter[] = [
  {
    identifier: 'ar.yasseraldosari',
    name: 'ياسر الدوسري',
    englishName: 'Yasser Al-Dosari',
    language: 'ar',
    format: 'audio',
    type: 'surah',
    isVerseByVerse: false,
    urlPrefix: 'https://server11.mp3quran.net/yasser/'
  },
  {
    identifier: 'ar.muhammadalluhaidan',
    name: 'محمد اللحيدان',
    englishName: 'Muhammad Al-Luhaidan',
    language: 'ar',
    format: 'audio',
    type: 'surah',
    isVerseByVerse: false,
    urlPrefix: 'https://server8.mp3quran.net/lhdan/'
  },
  {
    identifier: 'ar.ahmedtalib',
    name: 'أحمد طالب بن حميد',
    englishName: 'Ahmed bin Talib',
    language: 'ar',
    format: 'audio',
    type: 'surah',
    isVerseByVerse: false,
    urlPrefix: 'https://server16.mp3quran.net/a_binhameed/Rewayat-Hafs-A-n-Assem/'
  }
];
