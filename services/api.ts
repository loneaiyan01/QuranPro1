import { Surah, Reciter, SurahContent, AudioAyah } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

// Priority list for famous reciters to appear at the top
// Priority list for allowed reciters
const ALLOWED_IDENTIFIERS = [
  'ar.abdurrahmaansudais', // Sudais
  'ar.saoodshuraym',       // Shuraim
  'ar.mahermuaiqly',      // Maher
  'ar.muhammadayyoub',    // Muhammad Ayyub
  'ar.hudhaify',          // Hudhaify
  'ar.yasseraldosari',     // Yasser Al-Dosari (Manual)
  'ar.muhammadalluhaidan', // Luhaidan (Manual)
  'ar.ahmedtalib'          // Ahmed bin Talib (Manual)
];

export const fetchSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return [];
  }
};

// Manual list of Non-VBV reciters to append
const MANUAL_RECITERS: Reciter[] = [
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

export const fetchReciters = async (): Promise<Reciter[]> => {
  try {
    const response = await fetch(`${BASE_URL}/edition?format=audio&type=versebyverse`);
    const data = await response.json();

    if (!data.data) return [];

    // Filter for Arabic language only
    let apiReciters = data.data.filter((r: Reciter) => r.language === 'ar');

    // Add isVerseByVerse flag
    apiReciters = apiReciters.map((r: Reciter) => ({ ...r, isVerseByVerse: true }));

    // Merge with Manual
    let reciters = [...apiReciters, ...MANUAL_RECITERS];

    // Strictly keep ONLY the reciters requested by the user
    reciters = reciters.filter(r => ALLOWED_IDENTIFIERS.includes(r.identifier));

    // Sort by the order in ALLOWED_IDENTIFIERS
    reciters.sort((a, b) => {
      return ALLOWED_IDENTIFIERS.indexOf(a.identifier) - ALLOWED_IDENTIFIERS.indexOf(b.identifier);
    });

    return reciters;
  } catch (error) {
    console.error('Error fetching reciters:', error);
    return [];
  }
};

export const fetchSurahText = async (surahNumber: number): Promise<{ arabic: SurahContent; english: SurahContent } | null> => {
  try {
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,en.hilali`);
    const data = await response.json();
    // data.data is an array of 2 editions
    return {
      arabic: data.data[0],
      english: data.data[1]
    };
  } catch (error) {
    console.error('Error fetching surah text:', error);
    return null;
  }
};

export const fetchSurahAudio = async (surahNumber: number, reciterIdentifier: string): Promise<AudioAyah[]> => {
  try {
    const reciter = MANUAL_RECITERS.find(r => r.identifier === reciterIdentifier);

    // If it's a manual non-VBV reciter
    if (reciter && !reciter.isVerseByVerse && reciter.urlPrefix) {
      // Pad surah number to 3 digits (e.g. 1 -> 001, 12 -> 012)
      const paddedSurah = surahNumber.toString().padStart(3, '0');
      const audioUrl = `${reciter.urlPrefix}${paddedSurah}.mp3`;

      // Return a single dummy "ayah" that contains the full audio
      // The app logic will handle this special case
      return [{
        number: 1,
        audio: audioUrl,
        audioSecondary: [],
        text: '',
        numberInSurah: 1
      }];
    }

    // Default VBV fetch
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${reciterIdentifier}`);
    const data = await response.json();
    return data.data.ayahs;
  } catch (error) {
    console.error('Error fetching surah audio:', error);
    return [];
  }
};