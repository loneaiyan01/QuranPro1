import { Reciter } from '../types';

export const ALLOWED_IDENTIFIERS = [
  'ar.muhammadayyoub',      // Sheikh Muhammad Ayyub
  'ar.hudhaify',            // Sheikh Ali Abdul-Rahman Al-Hudhaify
  'ar.alafasy',             // Sheikh Mishary Rashid Alafasy
  'ar.abdurrahmaansudais',  // Sheikh Abdur-Rahman As-Sudais
  'ar.saoodshuraym',        // Sheikh Sa'ood Ash-Shuraym
  'ar.minshawi',            // Sheikh Mohamed Siddiq Al-Minshawi
  'ar.husary',              // Sheikh Mahmoud Khalil Al-Husary
  'ar.mahermuaiqly',        // Sheikh Maher Al-Muaiqly
  'ar.yasseraldosari',      // Yasser Al-Dosari
  'ar.muhammadalluhaidan',  // Muhammad Al-Luhaidan
  'ar.ahmedtalib'           // Ahmed bin Talib
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
