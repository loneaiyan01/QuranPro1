export interface JuzInfo {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  startSurahNumber: number;
  startSurahName: string;
  startAyahNumber: number;
  endSurahNumber: number;
  endSurahName: string;
  endAyahNumber: number;
  description: string;
}

export const JUZ_LIST: JuzInfo[] = [
  { number: 1, nameArabic: "الجزء ١", nameEnglish: "Juz 1", startSurahNumber: 1, startSurahName: "Al-Fatihah", startAyahNumber: 1, endSurahNumber: 2, endSurahName: "Al-Baqarah", endAyahNumber: 141, description: "Al-Fatihah 1 - Al-Baqarah 141" },
  { number: 2, nameArabic: "الجزء ٢", nameEnglish: "Juz 2", startSurahNumber: 2, startSurahName: "Al-Baqarah", startAyahNumber: 142, endSurahNumber: 2, endSurahName: "Al-Baqarah", endAyahNumber: 252, description: "Al-Baqarah 142 - Al-Baqarah 252" },
  { number: 3, nameArabic: "الجزء ٣", nameEnglish: "Juz 3", startSurahNumber: 2, startSurahName: "Al-Baqarah", startAyahNumber: 253, endSurahNumber: 3, endSurahName: "Ali 'Imran", endAyahNumber: 92, description: "Al-Baqarah 253 - Ali 'Imran 92" },
  { number: 4, nameArabic: "الجزء ٤", nameEnglish: "Juz 4", startSurahNumber: 3, startSurahName: "Ali 'Imran", startAyahNumber: 93, endSurahNumber: 4, endSurahName: "An-Nisa", endAyahNumber: 23, description: "Ali 'Imran 93 - An-Nisa 23" },
  { number: 5, nameArabic: "الجزء ٥", nameEnglish: "Juz 5", startSurahNumber: 4, startSurahName: "An-Nisa", startAyahNumber: 24, endSurahNumber: 4, endSurahName: "An-Nisa", endAyahNumber: 147, description: "An-Nisa 24 - An-Nisa 147" },
  { number: 6, nameArabic: "الجزء ٦", nameEnglish: "Juz 6", startSurahNumber: 4, startSurahName: "An-Nisa", startAyahNumber: 148, endSurahNumber: 5, endSurahName: "Al-Ma'idah", endAyahNumber: 81, description: "An-Nisa 148 - Al-Ma'idah 81" },
  { number: 7, nameArabic: "الجزء ٧", nameEnglish: "Juz 7", startSurahNumber: 5, startSurahName: "Al-Ma'idah", startAyahNumber: 82, endSurahNumber: 6, endSurahName: "Al-An'am", endAyahNumber: 110, description: "Al-Ma'idah 82 - Al-An'am 110" },
  { number: 8, nameArabic: "الجزء ٨", nameEnglish: "Juz 8", startSurahNumber: 6, startSurahName: "Al-An'am", startAyahNumber: 111, endSurahNumber: 7, endSurahName: "Al-A'raf", endAyahNumber: 87, description: "Al-An'am 111 - Al-A'raf 87" },
  { number: 9, nameArabic: "الجزء ٩", nameEnglish: "Juz 9", startSurahNumber: 7, startSurahName: "Al-A'raf", startAyahNumber: 88, endSurahNumber: 8, endSurahName: "Al-Anfal", endAyahNumber: 40, description: "Al-A'raf 88 - Al-Anfal 40" },
  { number: 10, nameArabic: "الجزء ١٠", nameEnglish: "Juz 10", startSurahNumber: 8, startSurahName: "Al-Anfal", startAyahNumber: 41, endSurahNumber: 9, endSurahName: "At-Tawbah", endAyahNumber: 92, description: "Al-Anfal 41 - At-Tawbah 92" },
  { number: 11, nameArabic: "الجزء ١١", nameEnglish: "Juz 11", startSurahNumber: 9, startSurahName: "At-Tawbah", startAyahNumber: 93, endSurahNumber: 11, endSurahName: "Hud", endAyahNumber: 5, description: "At-Tawbah 93 - Hud 5" },
  { number: 12, nameArabic: "الجزء ١٢", nameEnglish: "Juz 12", startSurahNumber: 11, startSurahName: "Hud", startAyahNumber: 6, endSurahNumber: 12, endSurahName: "Yusuf", endAyahNumber: 52, description: "Hud 6 - Yusuf 52" },
  { number: 13, nameArabic: "الجزء ١٣", nameEnglish: "Juz 13", startSurahNumber: 12, startSurahName: "Yusuf", startAyahNumber: 53, endSurahNumber: 14, endSurahName: "Ibrahim", endAyahNumber: 52, description: "Yusuf 53 - Ibrahim 52" },
  { number: 14, nameArabic: "الجزء ١٤", nameEnglish: "Juz 14", startSurahNumber: 15, startSurahName: "Al-Hijr", startAyahNumber: 1, endSurahNumber: 16, endSurahName: "An-Nahl", endAyahNumber: 128, description: "Al-Hijr 1 - An-Nahl 128" },
  { number: 15, nameArabic: "الجزء ١٥", nameEnglish: "Juz 15", startSurahNumber: 17, startSurahName: "Al-Isra", startAyahNumber: 1, endSurahNumber: 18, endSurahName: "Al-Kahf", endAyahNumber: 74, description: "Al-Isra 1 - Al-Kahf 74" },
  { number: 16, nameArabic: "الجزء ١٦", nameEnglish: "Juz 16", startSurahNumber: 18, startSurahName: "Al-Kahf", startAyahNumber: 75, endSurahNumber: 20, endSurahName: "Ta-Ha", endAyahNumber: 135, description: "Al-Kahf 75 - Ta-Ha 135" },
  { number: 17, nameArabic: "الجزء ١٧", nameEnglish: "Juz 17", startSurahNumber: 21, startSurahName: "Al-Anbiya", startAyahNumber: 1, endSurahNumber: 22, endSurahName: "Al-Hajj", endAyahNumber: 78, description: "Al-Anbiya 1 - Al-Hajj 78" },
  { number: 18, nameArabic: "الجزء ١٨", nameEnglish: "Juz 18", startSurahNumber: 23, startSurahName: "Al-Mu'minun", startAyahNumber: 1, endSurahNumber: 25, endSurahName: "Al-Furqan", endAyahNumber: 20, description: "Al-Mu'minun 1 - Al-Furqan 20" },
  { number: 19, nameArabic: "الجزء ١٩", nameEnglish: "Juz 19", startSurahNumber: 25, startSurahName: "Al-Furqan", startAyahNumber: 21, endSurahNumber: 27, endSurahName: "An-Naml", endAyahNumber: 55, description: "Al-Furqan 21 - An-Naml 55" },
  { number: 20, nameArabic: "الجزء ٢٠", nameEnglish: "Juz 20", startSurahNumber: 27, startSurahName: "An-Naml", startAyahNumber: 56, endSurahNumber: 29, endSurahName: "Al-'Ankabut", endAyahNumber: 45, description: "An-Naml 56 - Al-'Ankabut 45" },
  { number: 21, nameArabic: "الجزء ٢١", nameEnglish: "Juz 21", startSurahNumber: 29, startSurahName: "Al-'Ankabut", startAyahNumber: 46, endSurahNumber: 33, endSurahName: "Al-Ahzab", endAyahNumber: 30, description: "Al-'Ankabut 46 - Al-Ahzab 30" },
  { number: 22, nameArabic: "الجزء ٢٢", nameEnglish: "Juz 22", startSurahNumber: 33, startSurahName: "Al-Ahzab", startAyahNumber: 31, endSurahNumber: 36, endSurahName: "Ya-Sin", endAyahNumber: 27, description: "Al-Ahzab 31 - Ya-Sin 27" },
  { number: 23, nameArabic: "الجزء ٢٣", nameEnglish: "Juz 23", startSurahNumber: 36, startSurahName: "Ya-Sin", startAyahNumber: 28, endSurahNumber: 39, endSurahName: "Az-Zumar", endAyahNumber: 31, description: "Ya-Sin 28 - Az-Zumar 31" },
  { number: 24, nameArabic: "الجزء ٢٤", nameEnglish: "Juz 24", startSurahNumber: 39, startSurahName: "Az-Zumar", startAyahNumber: 32, endSurahNumber: 41, endSurahName: "Fussilat", endAyahNumber: 46, description: "Az-Zumar 32 - Fussilat 46" },
  { number: 25, nameArabic: "الجزء ٢٥", nameEnglish: "Juz 25", startSurahNumber: 41, startSurahName: "Fussilat", startAyahNumber: 47, endSurahNumber: 45, endSurahName: "Al-Jathiyah", endAyahNumber: 37, description: "Fussilat 47 - Al-Jathiyah 37" },
  { number: 26, nameArabic: "الجزء ٢٦", nameEnglish: "Juz 26", startSurahNumber: 46, startSurahName: "Al-Ahqaf", startAyahNumber: 1, endSurahNumber: 51, endSurahName: "Adh-Dhariyat", endAyahNumber: 30, description: "Al-Ahqaf 1 - Adh-Dhariyat 30" },
  { number: 27, nameArabic: "الجزء ٢٧", nameEnglish: "Juz 27", startSurahNumber: 51, startSurahName: "Adh-Dhariyat", startAyahNumber: 31, endSurahNumber: 57, endSurahName: "Al-Hadid", endAyahNumber: 29, description: "Adh-Dhariyat 31 - Al-Hadid 29" },
  { number: 28, nameArabic: "الجزء ٢٨", nameEnglish: "Juz 28", startSurahNumber: 58, startSurahName: "Al-Mujadilah", startAyahNumber: 1, endSurahNumber: 66, endSurahName: "At-Tahrim", endAyahNumber: 12, description: "Al-Mujadilah 1 - At-Tahrim 12" },
  { number: 29, nameArabic: "الجزء ٢٩", nameEnglish: "Juz 29", startSurahNumber: 67, startSurahName: "Al-Mulk", startAyahNumber: 1, endSurahNumber: 77, endSurahName: "Al-Mursalat", endAyahNumber: 50, description: "Al-Mulk 1 - Al-Mursalat 50" },
  { number: 30, nameArabic: "الجزء ٣٠", nameEnglish: "Juz 30", startSurahNumber: 78, startSurahName: "An-Naba", startAyahNumber: 1, endSurahNumber: 114, endSurahName: "An-Nas", endAyahNumber: 6, description: "An-Naba 1 - An-Nas 6" }
];
