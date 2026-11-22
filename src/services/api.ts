import { Surah, Reciter, SurahContent, AudioAyah, MushafPageData, KfgqpcPageData, KfgqpcLine, KfgqpcWord } from '../types';
import { ALLOWED_IDENTIFIERS, MANUAL_RECITERS } from '../config/reciters';
import { SURAH_META, getJuzForPage } from '../utils/mushafData';

const BASE_URL = 'https://api.alquran.cloud/v1';

const pageCache = new Map<number, MushafPageData>();
const kfgqpcPageCache = new Map<number, KfgqpcPageData>();

export const fetchKfgqpcPage = async (pageNumber: number): Promise<KfgqpcPageData | null> => {
  if (pageNumber < 1 || pageNumber > 604) return null;
  if (kfgqpcPageCache.has(pageNumber)) {
    return kfgqpcPageCache.get(pageNumber)!;
  }

  try {
    const [quranRes, translationRes] = await Promise.all([
      fetch(`https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=text_qpc_hafs,line_number`),
      fetch(`${BASE_URL}/page/${pageNumber}/en.hilali`)
    ]);

    if (!quranRes.ok) {
      throw new Error(`Failed to fetch Quran.com page ${pageNumber}`);
    }

    const quranJson = await quranRes.json();
    const translationJson = translationRes.ok ? await translationRes.json() : null;

    // Build verse translations map: "surah:ayah" -> translation text
    const translationsMap: Record<string, string> = {};
    if (translationJson?.data?.ayahs) {
      translationJson.data.ayahs.forEach((a: any) => {
        const key = `${a.surah.number}:${a.numberInSurah}`;
        translationsMap[key] = a.text;
      });
    }

    const rawVerses = quranJson.verses || [];
    if (rawVerses.length === 0) return null;

    // Group words by line_number
    const lineWordsMap = new Map<number, KfgqpcWord[]>();
    const surahStarts = new Map<number, number>(); // line_number -> surah_number

    rawVerses.forEach((v: any) => {
      const [sStr, aStr] = v.verse_key.split(':');
      const sNum = parseInt(sStr, 10);
      const aNum = parseInt(aStr, 10);

      const words: any[] = v.words || [];
      if (aNum === 1 && words.length > 0) {
        surahStarts.set(words[0].line_number, sNum);
      }

      words.forEach((w: any) => {
        const lineNum = w.line_number;
        if (!lineWordsMap.has(lineNum)) {
          lineWordsMap.set(lineNum, []);
        }
        lineWordsMap.get(lineNum)!.push({
          id: w.id,
          position: w.position,
          audioUrl: w.audio_url,
          charTypeName: w.char_type_name,
          text: w.text_qpc_hafs || w.text || '',
          lineNumber: lineNum,
          verseKey: v.verse_key,
          pageNumber: v.page_number || pageNumber
        });
      });
    });

    // Construct lines of the King Fahd Complex Mushaf
    const lines: KfgqpcLine[] = [];
    const firstVerseSurah = parseInt(rawVerses[0].verse_key.split(':')[0], 10);

    for (let l = 1; l <= 15; l++) {
      if (lineWordsMap.has(l)) {
        lines.push({
          lineNumber: l,
          type: 'text',
          words: lineWordsMap.get(l)!
        });
      } else if (pageNumber === 1) {
        if (l === 1) {
          const s = SURAH_META[1];
          lines.push({
            lineNumber: l,
            type: 'surah_header',
            surahNumber: 1,
            surahName: s?.name,
            surahEnglishName: s?.englishName,
            revelationType: s?.revelationType,
            numberOfAyahs: s?.numberOfAyahs
          });
        }
      } else if (pageNumber === 2) {
        if (l === 1) {
          const s = SURAH_META[2];
          lines.push({
            lineNumber: l,
            type: 'surah_header',
            surahNumber: 2,
            surahName: s?.name,
            surahEnglishName: s?.englishName,
            revelationType: s?.revelationType,
            numberOfAyahs: s?.numberOfAyahs
          });
        } else if (l === 2) {
          lines.push({
            lineNumber: l,
            type: 'bismillah'
          });
        }
      } else {
        // Check if this line is a Surah Header or Bismillah before an Ayah 1
        if (surahStarts.has(l + 1)) {
          const sNum = surahStarts.get(l + 1)!;
          if (sNum === 9) {
            // Surah 9 (At-Tawbah) has no Bismillah
            const s = SURAH_META[sNum];
            lines.push({
              lineNumber: l,
              type: 'surah_header',
              surahNumber: sNum,
              surahName: s?.name,
              surahEnglishName: s?.englishName,
              revelationType: s?.revelationType,
              numberOfAyahs: s?.numberOfAyahs
            });
          } else {
            lines.push({
              lineNumber: l,
              type: 'bismillah'
            });
          }
        } else if (surahStarts.has(l + 2)) {
          const sNum = surahStarts.get(l + 2)!;
          const s = SURAH_META[sNum];
          lines.push({
            lineNumber: l,
            type: 'surah_header',
            surahNumber: sNum,
            surahName: s?.name,
            surahEnglishName: s?.englishName,
            revelationType: s?.revelationType,
            numberOfAyahs: s?.numberOfAyahs
          });
        } else if (l === 1 && lines.length === 0) {
          const s = SURAH_META[firstVerseSurah];
          lines.push({
            lineNumber: l,
            type: 'surah_header',
            surahNumber: firstVerseSurah,
            surahName: s?.name,
            surahEnglishName: s?.englishName,
            revelationType: s?.revelationType,
            numberOfAyahs: s?.numberOfAyahs
          });
        }
      }
    }

    const firstVerse = rawVerses[0];
    const pageData: KfgqpcPageData = {
      pageNumber,
      juzNumber: firstVerse?.juz_number || getJuzForPage(pageNumber),
      hizbNumber: firstVerse?.hizb_number || 1,
      rubNumber: firstVerse?.rub_el_hizb_number || 1,
      primarySurahNumber: firstVerseSurah,
      lines,
      verses: rawVerses.map((v: any) => {
        const [sStr, aStr] = v.verse_key.split(':');
        return {
          verseKey: v.verse_key,
          surahNumber: parseInt(sStr, 10),
          ayahNumber: parseInt(aStr, 10),
          translation: translationsMap[v.verse_key] || ''
        };
      })
    };

    kfgqpcPageCache.set(pageNumber, pageData);

    // Background prefetch adjacent pages
    if (pageNumber + 1 <= 604 && !kfgqpcPageCache.has(pageNumber + 1)) {
      setTimeout(() => fetchKfgqpcPage(pageNumber + 1).catch(() => {}), 200);
    }
    if (pageNumber - 1 >= 1 && !kfgqpcPageCache.has(pageNumber - 1)) {
      setTimeout(() => fetchKfgqpcPage(pageNumber - 1).catch(() => {}), 400);
    }

    return pageData;
  } catch (error) {
    console.error(`Error fetching KFGQPC Page ${pageNumber}:`, error);
    return null;
  }
};

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