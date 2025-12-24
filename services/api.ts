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

export const fetchReciters = async (): Promise<Reciter[]> => {
  try {
    // We only want verse-by-verse audio for this specific player architecture
    // to ensure the "single verse focus" works seamlessly with auto-sync.
    const response = await fetch(`${BASE_URL}/edition?format=audio&type=versebyverse`);
    const data = await response.json();
    
    if (!data.data) return [];

    // Filter for Arabic language only (removes translations)
    let reciters = data.data.filter((r: Reciter) => r.language === 'ar');

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
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${reciterIdentifier}`);
    const data = await response.json();
    return data.data.ayahs;
  } catch (error) {
    console.error('Error fetching surah audio:', error);
    return [];
  }
};