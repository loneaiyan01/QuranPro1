import { Surah, Reciter, SurahContent, AudioAyah } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

// Priority list for famous reciters to appear at the top
const PRIORITY_IDENTIFIERS = [
  'ar.alafasy',           // Mishary Rashid Alafasy
  'ar.yasseraldossari',   // Yasser Al-Dosari
  'ar.muhammadalluhaidan', // Muhammad Al-Luhaidan
  'ar.sudais',            // Abdul Rahman Al-Sudais
  'ar.shuraym',           // Saud Al-Shuraim
  'ar.mahermuaiqly',      // Maher Al Muaiqly
  'ar.abdulbasitmurattal', // Abdul Basit (Murattal)
  'ar.minshawi',          // Mohamed Siddiq Al-Minshawi
  'ar.husary'             // Mahmoud Khalil Al-Husary
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
    identifier: 'ar.yasseraldosari', // Custom ID
    name: 'ياسر الدوسري',
    englishName: 'Yasser Al-Dosari',
    language: 'ar',
    format: 'audio',
    type: 'surah', // Full surah audio
    isVerseByVerse: false,
    urlPrefix: 'https://server11.mp3quran.net/yasser/'
  },
  {
    identifier: 'ar.muhammadalluhaidan', // Custom ID
    name: 'محمد اللحيدان',
    englishName: 'Muhammad Al-Luhaidan',
    language: 'ar',
    format: 'audio',
    type: 'surah',
    isVerseByVerse: false,
    urlPrefix: 'https://server6.mp3quran.net/lhdan/'
  }
];

export const fetchReciters = async (): Promise<Reciter[]> => {
  try {
    // We only want verse-by-verse audio for this specific player architecture
    // to ensure the "single verse focus" works seamlessly with auto-sync.
    const response = await fetch(`${BASE_URL}/edition?format=audio&type=versebyverse`);
    const data = await response.json();

    if (!data.data) return [];

    // Filter for Arabic language only (removes translations)
    let reciters = data.data.filter((r: Reciter) => r.language === 'ar');

    // Add isVerseByVerse flag to API results
    reciters = reciters.map((r: Reciter) => ({ ...r, isVerseByVerse: true }));

    // Append Manual Reciters
    reciters = [...reciters, ...MANUAL_RECITERS];

    // Sort reciters: Priority ones first, then alphabetical
    reciters.sort((a: Reciter, b: Reciter) => {
      const indexA = PRIORITY_IDENTIFIERS.indexOf(a.identifier);
      const indexB = PRIORITY_IDENTIFIERS.indexOf(b.identifier);

      // If both are in priority list, sort by the order in PRIORITY_IDENTIFIERS
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only A is in priority list, it comes first
      if (indexA !== -1) return -1;

      // If only B is in priority list, it comes first
      if (indexB !== -1) return 1;

      // Otherwise, sort alphabetically
      return a.englishName.localeCompare(b.englishName);
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