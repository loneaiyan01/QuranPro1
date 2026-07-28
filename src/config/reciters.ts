import { Reciter } from '../types';

export const ALLOWED_IDENTIFIERS = [
  'ar.muhammadayyoub',      // Muhammad Ayyub
  'ar.hudhaify',            // Ali Al-Hudhaify
  'ar.alafasy',             // Mishary Rashid Alafasy
  'ar.abdurrahmaansudais',  // Abdur-Rahman As-Sudais
  'ar.saoodshuraym',        // Sa'ood Ash-Shuraym
  'ar.mahermuaiqly',        // Maher Al-Muaiqly
  'ar.minshawi',            // Mohamed Siddiq Al-Minshawi (Murattal)
  'ar.husary',              // Mahmoud Khalil Al-Husary
  'ar.abdulbasitmurattal',  // Abdul Basit Abdul Samad (Murattal)
  'ar.shaatree',            // Abu Bakr Al-Shatri
  'ar.hanrifai',            // Hani Ar-Rifai
  'ar.gammed',              // Saad Al-Ghamdi
  'ar.yasseraldosari',      // Yasser Al-Dosari (Manual Surah-level)
  'ar.muhammadalluhaidan',  // Luhaidan (Manual Surah-level)
  'ar.ahmedtalib'           // Ahmed bin Talib (Manual Surah-level)
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
