import { Surah, Reciter, SurahContent, AudioAyah } from '../types';
import { ALLOWED_IDENTIFIERS, MANUAL_RECITERS } from '../config/reciters';

const BASE_URL = 'https://api.alquran.cloud/v1';

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