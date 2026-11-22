import { Surah, Reciter, SurahContent, AudioAyah, MushafPageData } from '../types';
import { ALLOWED_IDENTIFIERS, MANUAL_RECITERS } from '../config/reciters';

const BASE_URL = 'https://api.alquran.cloud/v1';

const pageCache = new Map<number, MushafPageData>();

export const fetchMushafPage = async (pageNumber: number): Promise<MushafPageData | null> => {
  if (pageNumber < 1 || pageNumber > 604) return null;
  if (pageCache.has(pageNumber)) {
    return pageCache.get(pageNumber)!;
  }
  try {
    const [arabicRes, englishRes] = await Promise.all([
      fetch(`${BASE_URL}/page/${pageNumber}/quran-uthmani`),
      fetch(`${BASE_URL}/page/${pageNumber}/en.hilali`)
    ]);
    if (!arabicRes.ok || !englishRes.ok) {
      throw new Error(`Failed to fetch page ${pageNumber}`);
    }
    const arabicJson = await arabicRes.json();
    const englishJson = await englishRes.json();

    const data: MushafPageData = {
      pageNumber,
      ayahs: arabicJson.data.ayahs,
      englishAyahs: englishJson.data.ayahs
    };
    pageCache.set(pageNumber, data);

    // Background prefetch adjacent pages for instantaneous page flipping
    if (pageNumber + 1 <= 604 && !pageCache.has(pageNumber + 1)) {
      setTimeout(() => fetchMushafPage(pageNumber + 1).catch(() => {}), 300);
    }
    if (pageNumber - 1 >= 1 && !pageCache.has(pageNumber - 1)) {
      setTimeout(() => fetchMushafPage(pageNumber - 1).catch(() => {}), 500);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching Mushaf page ${pageNumber}:`, error);
    return null;
  }
};

export const fetchSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
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
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    if (!data.data) return [];

    // Filter for Arabic language only
    let apiReciters = data.data.filter((r: Reciter) => r.language === 'ar');

    // Add isVerseByVerse flag
    apiReciters = apiReciters.map((r: Reciter) => ({ ...r, isVerseByVerse: true }));

    // Merge with Manual, deduplicating by identifier (manual entries take precedence)
    const reciterMap = new Map<string, Reciter>();
    apiReciters.forEach((r: Reciter) => reciterMap.set(r.identifier, r));
    MANUAL_RECITERS.forEach((r: Reciter) => reciterMap.set(r.identifier, r));
    let reciters = Array.from(reciterMap.values());

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
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
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

    // If it's a manual VBV reciter with a custom verse URL prefix (e.g., EveryAyah high-quality Mujawwad)
    if (reciter && reciter.isVerseByVerse && reciter.verseUrlPrefix) {
      const response = await fetch(`${BASE_URL}/surah/${surahNumber}/quran-uthmani`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const paddedSurah = surahNumber.toString().padStart(3, '0');

      return data.data.ayahs.map((ayah: any) => {
        const paddedAyah = ayah.numberInSurah.toString().padStart(3, '0');
        return {
          number: ayah.number,
          audio: `${reciter.verseUrlPrefix}${paddedSurah}${paddedAyah}.mp3`,
          audioSecondary: [],
          text: ayah.text || '',
          numberInSurah: ayah.numberInSurah
        };
      });
    }

    // Default VBV fetch
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${reciterIdentifier}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.ayahs;
  } catch (error) {
    console.error('Error fetching surah audio:', error);
    return [];
  }
};