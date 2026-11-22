/**
 * Utilities & Meta Information for the 604-Page Standard Madani Mushaf
 * (King Fahd Glorious Quran Printing Complex - KFGQPC)
 */

export function toArabicNumerals(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map(digit => arabicDigits[parseInt(digit, 10)] || digit)
    .join('');
}

export const ARABIC_JUZ_NAMES = [
  'الجزء الأول',
  'الجزء الثاني',
  'الجزء الثالث',
  'الجزء الرابع',
  'الجزء الخامس',
  'الجزء السادس',
  'الجزء السابع',
  'الجزء الثامن',
  'الجزء التاسع',
  'الجزء العاشر',
  'الجزء الحادي عشر',
  'الجزء الثاني عشر',
  'الجزء الثالث عشر',
  'الجزء الرابع عشر',
  'الجزء الخامس عشر',
  'الجزء السادس عشر',
  'الجزء السابع عشر',
  'الجزء الثامن عشر',
  'الجزء التاسع عشر',
  'الجزء العشرون',
  'الجزء الحادي والعشرون',
  'الجزء الثاني والعشرون',
  'الجزء الثالث والعشرون',
  'الجزء الرابع والعشرون',
  'الجزء الخامس والعشرون',
  'الجزء السادس والعشرون',
  'الجزء السابع والعشرون',
  'الجزء الثامن والعشرون',
  'الجزء التاسع والعشرون',
  'الجزء الثلاثون'
];

/**
 * Standard page starts for each of the 30 Juzs in the 604-page Madani Mushaf
 */
export const JUZ_START_PAGES = [
  1,   // Juz 1
  22,  // Juz 2
  42,  // Juz 3
  62,  // Juz 4
  82,  // Juz 5
  102, // Juz 6
  122, // Juz 7
  142, // Juz 8
  162, // Juz 9
  182, // Juz 10
  202, // Juz 11
  222, // Juz 12
  242, // Juz 13
  262, // Juz 14
  282, // Juz 15
  302, // Juz 16
  322, // Juz 17
  342, // Juz 18
  362, // Juz 19
  382, // Juz 20
  402, // Juz 21
  422, // Juz 22
  442, // Juz 23
  462, // Juz 24
  482, // Juz 25
  502, // Juz 26
  522, // Juz 27
  542, // Juz 28
  562, // Juz 29
  582  // Juz 30
];

export function getJuzForPage(pageNumber: number): number {
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    if (pageNumber >= JUZ_START_PAGES[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Standard King Fahd Mushaf page starts for all 114 Surahs
 */
export const SURAH_START_PAGES: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
  51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568,
  71: 570, 72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585,
  81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594,
  91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603,
  111: 603, 112: 604, 113: 604, 114: 604
};

export interface SurahMeta {
  name: string;
  englishName: string;
  revelationType: string;
  numberOfAyahs: number;
}

export const SURAH_META: Record<number, SurahMeta> = {
  "1": {
    "name": "سُورَةُ ٱلْفَاتِحَةِ",
    "englishName": "Al-Faatiha",
    "revelationType": "Meccan",
    "numberOfAyahs": 7
  },
  "2": {
    "name": "سُورَةُ البَقَرَةِ",
    "englishName": "Al-Baqara",
    "revelationType": "Medinan",
    "numberOfAyahs": 286
  },
  "3": {
    "name": "سُورَةُ آلِ عِمۡرَانَ",
    "englishName": "Aal-i-Imraan",
    "revelationType": "Medinan",
    "numberOfAyahs": 200
  },
  "4": {
    "name": "سُورَةُ النِّسَاءِ",
    "englishName": "An-Nisaa",
    "revelationType": "Medinan",
    "numberOfAyahs": 176
  },
  "5": {
    "name": "سُورَةُ المَائـِدَةِ",
    "englishName": "Al-Maaida",
    "revelationType": "Medinan",
    "numberOfAyahs": 120
  },
  "6": {
    "name": "سُورَةُ الأَنۡعَامِ",
    "englishName": "Al-An'aam",
    "revelationType": "Meccan",
    "numberOfAyahs": 165
  },
  "7": {
    "name": "سُورَةُ الأَعۡرَافِ",
    "englishName": "Al-A'raaf",
    "revelationType": "Meccan",
    "numberOfAyahs": 206
  },
  "8": {
    "name": "سُورَةُ الأَنفَالِ",
    "englishName": "Al-Anfaal",
    "revelationType": "Medinan",
    "numberOfAyahs": 75
  },
  "9": {
    "name": "سُورَةُ التَّوۡبَةِ",
    "englishName": "At-Tawba",
    "revelationType": "Medinan",
    "numberOfAyahs": 129
  },
  "10": {
    "name": "سُورَةُ يُونُسَ",
    "englishName": "Yunus",
    "revelationType": "Meccan",
    "numberOfAyahs": 109
  },
  "11": {
    "name": "سُورَةُ هُودٍ",
    "englishName": "Hud",
    "revelationType": "Meccan",
    "numberOfAyahs": 123
  },
  "12": {
    "name": "سُورَةُ يُوسُفَ",
    "englishName": "Yusuf",
    "revelationType": "Meccan",
    "numberOfAyahs": 111
  },
  "13": {
    "name": "سُورَةُ الرَّعۡدِ",
    "englishName": "Ar-Ra'd",
    "revelationType": "Medinan",
    "numberOfAyahs": 43
  },
  "14": {
    "name": "سُورَةُ إِبۡرَاهِيمَ",
    "englishName": "Ibrahim",
    "revelationType": "Meccan",
    "numberOfAyahs": 52
  },
  "15": {
    "name": "سُورَةُ الحِجۡرِ",
    "englishName": "Al-Hijr",
    "revelationType": "Meccan",
    "numberOfAyahs": 99
  },
  "16": {
    "name": "سُورَةُ النَّحۡلِ",
    "englishName": "An-Nahl",
    "revelationType": "Meccan",
    "numberOfAyahs": 128
  },
  "17": {
    "name": "سُورَةُ الإِسۡرَاءِ",
    "englishName": "Al-Israa",
    "revelationType": "Meccan",
    "numberOfAyahs": 111
  },
  "18": {
    "name": "سُورَةُ الكَهۡفِ",
    "englishName": "Al-Kahf",
    "revelationType": "Meccan",
    "numberOfAyahs": 110
  },
  "19": {
    "name": "سُورَةُ مَرۡيَمَ",
    "englishName": "Maryam",
    "revelationType": "Meccan",
    "numberOfAyahs": 98
  },
  "20": {
    "name": "سُورَةُ طه",
    "englishName": "Taa-Haa",
    "revelationType": "Meccan",
    "numberOfAyahs": 135
  },
  "21": {
    "name": "سُورَةُ الأَنبِيَاءِ",
    "englishName": "Al-Anbiyaa",
    "revelationType": "Meccan",
    "numberOfAyahs": 112
  },
  "22": {
    "name": "سُورَةُ الحَجِّ",
    "englishName": "Al-Hajj",
    "revelationType": "Medinan",
    "numberOfAyahs": 78
  },
  "23": {
    "name": "سُورَةُ المُؤۡمِنُونَ",
    "englishName": "Al-Muminoon",
    "revelationType": "Meccan",
    "numberOfAyahs": 118
  },
  "24": {
    "name": "سُورَةُ النُّورِ",
    "englishName": "An-Noor",
    "revelationType": "Medinan",
    "numberOfAyahs": 64
  },
  "25": {
    "name": "سُورَةُ الفُرۡقَانِ",
    "englishName": "Al-Furqaan",
    "revelationType": "Meccan",
    "numberOfAyahs": 77
  },
  "26": {
    "name": "سُورَةُ الشُّعَرَاءِ",
    "englishName": "Ash-Shu'araa",
    "revelationType": "Meccan",
    "numberOfAyahs": 227
  },
  "27": {
    "name": "سُورَةُ النَّمۡلِ",
    "englishName": "An-Naml",
    "revelationType": "Meccan",
    "numberOfAyahs": 93
  },
  "28": {
    "name": "سُورَةُ القَصَصِ",
    "englishName": "Al-Qasas",
    "revelationType": "Meccan",
    "numberOfAyahs": 88
  },
  "29": {
    "name": "سُورَةُ العَنكَبُوتِ",
    "englishName": "Al-Ankaboot",
    "revelationType": "Meccan",
    "numberOfAyahs": 69
  },
  "30": {
    "name": "سُورَةُ الرُّومِ",
    "englishName": "Ar-Room",
    "revelationType": "Meccan",
    "numberOfAyahs": 60
  },
  "31": {
    "name": "سُورَةُ لُقۡمَانَ",
    "englishName": "Luqman",
    "revelationType": "Meccan",
    "numberOfAyahs": 34
  },
  "32": {
    "name": "سُورَةُ السَّجۡدَةِ",
    "englishName": "As-Sajda",
    "revelationType": "Meccan",
    "numberOfAyahs": 30
  },
  "33": {
    "name": "سُورَةُ الأَحۡزَابِ",
    "englishName": "Al-Ahzaab",
    "revelationType": "Medinan",
    "numberOfAyahs": 73
  },
  "34": {
    "name": "سُورَةُ سَبَإٍ",
    "englishName": "Saba",
    "revelationType": "Meccan",
    "numberOfAyahs": 54
  },
  "35": {
    "name": "سُورَةُ فَاطِرٍ",
    "englishName": "Faatir",
    "revelationType": "Meccan",
    "numberOfAyahs": 45
  },
  "36": {
    "name": "سُورَةُ يسٓ",
    "englishName": "Yaseen",
    "revelationType": "Meccan",
    "numberOfAyahs": 83
  },
  "37": {
    "name": "سُورَةُ الصَّافَّاتِ",
    "englishName": "As-Saaffaat",
    "revelationType": "Meccan",
    "numberOfAyahs": 182
  },
  "38": {
    "name": "سُورَةُ صٓ",
    "englishName": "Saad",
    "revelationType": "Meccan",
    "numberOfAyahs": 88
  },
  "39": {
    "name": "سُورَةُ الزُّمَرِ",
    "englishName": "Az-Zumar",
    "revelationType": "Meccan",
    "numberOfAyahs": 75
  },
  "40": {
    "name": "سُورَةُ غَافِرٍ",
    "englishName": "Ghafir",
    "revelationType": "Meccan",
    "numberOfAyahs": 85
  },
  "41": {
    "name": "سُورَةُ فُصِّلَتۡ",
    "englishName": "Fussilat",
    "revelationType": "Meccan",
    "numberOfAyahs": 54
  },
  "42": {
    "name": "سُورَةُ الشُّورَىٰ",
    "englishName": "Ash-Shura",
    "revelationType": "Meccan",
    "numberOfAyahs": 53
  },
  "43": {
    "name": "سُورَةُ الزُّخۡرُفِ",
    "englishName": "Az-Zukhruf",
    "revelationType": "Meccan",
    "numberOfAyahs": 89
  },
  "44": {
    "name": "سُورَةُ الدُّخَانِ",
    "englishName": "Ad-Dukhaan",
    "revelationType": "Meccan",
    "numberOfAyahs": 59
  },
  "45": {
    "name": "سُورَةُ الجَاثِيَةِ",
    "englishName": "Al-Jaathiya",
    "revelationType": "Meccan",
    "numberOfAyahs": 37
  },
  "46": {
    "name": "سُورَةُ الأَحۡقَافِ",
    "englishName": "Al-Ahqaf",
    "revelationType": "Meccan",
    "numberOfAyahs": 35
  },
  "47": {
    "name": "سُورَةُ مُحَمَّدٍ",
    "englishName": "Muhammad",
    "revelationType": "Medinan",
    "numberOfAyahs": 38
  },
  "48": {
    "name": "سُورَةُ الفَتۡحِ",
    "englishName": "Al-Fath",
    "revelationType": "Medinan",
    "numberOfAyahs": 29
  },
  "49": {
    "name": "سُورَةُ الحُجُرَاتِ",
    "englishName": "Al-Hujuraat",
    "revelationType": "Medinan",
    "numberOfAyahs": 18
  },
  "50": {
    "name": "سُورَةُ قٓ",
    "englishName": "Qaaf",
    "revelationType": "Meccan",
    "numberOfAyahs": 45
  },
  "51": {
    "name": "سُورَةُ الذَّارِيَاتِ",
    "englishName": "Adh-Dhaariyat",
    "revelationType": "Meccan",
    "numberOfAyahs": 60
  },
  "52": {
    "name": "سُورَةُ الطُّورِ",
    "englishName": "At-Tur",
    "revelationType": "Meccan",
    "numberOfAyahs": 49
  },
  "53": {
    "name": "سُورَةُ النَّجۡمِ",
    "englishName": "An-Najm",
    "revelationType": "Meccan",
    "numberOfAyahs": 62
  },
  "54": {
    "name": "سُورَةُ القَمَرِ",
    "englishName": "Al-Qamar",
    "revelationType": "Meccan",
    "numberOfAyahs": 55
  },
  "55": {
    "name": "سُورَةُ الرَّحۡمَٰن",
    "englishName": "Ar-Rahmaan",
    "revelationType": "Medinan",
    "numberOfAyahs": 78
  },
  "56": {
    "name": "سُورَةُ الوَاقِعَةِ",
    "englishName": "Al-Waaqia",
    "revelationType": "Meccan",
    "numberOfAyahs": 96
  },
  "57": {
    "name": "سُورَةُ الحَدِيدِ",
    "englishName": "Al-Hadid",
    "revelationType": "Medinan",
    "numberOfAyahs": 29
  },
  "58": {
    "name": "سُورَةُ المُجَادلَةِ",
    "englishName": "Al-Mujaadila",
    "revelationType": "Medinan",
    "numberOfAyahs": 22
  },
  "59": {
    "name": "سُورَةُ الحَشۡرِ",
    "englishName": "Al-Hashr",
    "revelationType": "Medinan",
    "numberOfAyahs": 24
  },
  "60": {
    "name": "سُورَةُ المُمۡتَحنَةِ",
    "englishName": "Al-Mumtahana",
    "revelationType": "Medinan",
    "numberOfAyahs": 13
  },
  "61": {
    "name": "سُورَةُ الصَّفِّ",
    "englishName": "As-Saff",
    "revelationType": "Medinan",
    "numberOfAyahs": 14
  },
  "62": {
    "name": "سُورَةُ الجُمُعَةِ",
    "englishName": "Al-Jumu'a",
    "revelationType": "Medinan",
    "numberOfAyahs": 11
  },
  "63": {
    "name": "سُورَةُ المُنَافِقُونَ",
    "englishName": "Al-Munaafiqoon",
    "revelationType": "Medinan",
    "numberOfAyahs": 11
  },
  "64": {
    "name": "سُورَةُ التَّغَابُنِ",
    "englishName": "At-Taghaabun",
    "revelationType": "Medinan",
    "numberOfAyahs": 18
  },
  "65": {
    "name": "سُورَةُ الطَّلَاقِ",
    "englishName": "At-Talaaq",
    "revelationType": "Medinan",
    "numberOfAyahs": 12
  },
  "66": {
    "name": "سُورَةُ التَّحۡرِيمِ",
    "englishName": "At-Tahrim",
    "revelationType": "Medinan",
    "numberOfAyahs": 12
  },
  "67": {
    "name": "سُورَةُ المُلۡكِ",
    "englishName": "Al-Mulk",
    "revelationType": "Meccan",
    "numberOfAyahs": 30
  },
  "68": {
    "name": "سُورَةُ القَلَمِ",
    "englishName": "Al-Qalam",
    "revelationType": "Meccan",
    "numberOfAyahs": 52
  },
  "69": {
    "name": "سُورَةُ الحَاقَّةِ",
    "englishName": "Al-Haaqqa",
    "revelationType": "Meccan",
    "numberOfAyahs": 52
  },
  "70": {
    "name": "سُورَةُ المَعَارِجِ",
    "englishName": "Al-Ma'aarij",
    "revelationType": "Meccan",
    "numberOfAyahs": 44
  },
  "71": {
    "name": "سُورَةُ نُوحٍ",
    "englishName": "Nooh",
    "revelationType": "Meccan",
    "numberOfAyahs": 28
  },
  "72": {
    "name": "سُورَةُ الجِنِّ",
    "englishName": "Al-Jinn",
    "revelationType": "Meccan",
    "numberOfAyahs": 28
  },
  "73": {
    "name": "سُورَةُ المُزَّمِّلِ",
    "englishName": "Al-Muzzammil",
    "revelationType": "Meccan",
    "numberOfAyahs": 20
  },
  "74": {
    "name": "سُورَةُ المُدَّثِّرِ",
    "englishName": "Al-Muddaththir",
    "revelationType": "Meccan",
    "numberOfAyahs": 56
  },
  "75": {
    "name": "سُورَةُ القِيَامَةِ",
    "englishName": "Al-Qiyaama",
    "revelationType": "Meccan",
    "numberOfAyahs": 40
  },
  "76": {
    "name": "سُورَةُ الإِنسَانِ",
    "englishName": "Al-Insaan",
    "revelationType": "Medinan",
    "numberOfAyahs": 31
  },
  "77": {
    "name": "سُورَةُ المُرۡسَلَاتِ",
    "englishName": "Al-Mursalaat",
    "revelationType": "Meccan",
    "numberOfAyahs": 50
  },
  "78": {
    "name": "سُورَةُ النَّبَإِ",
    "englishName": "An-Naba",
    "revelationType": "Meccan",
    "numberOfAyahs": 40
  },
  "79": {
    "name": "سُورَةُ النَّازِعَاتِ",
    "englishName": "An-Naazi'aat",
    "revelationType": "Meccan",
    "numberOfAyahs": 46
  },
  "80": {
    "name": "سُورَةُ عَبَسَ",
    "englishName": "Abasa",
    "revelationType": "Meccan",
    "numberOfAyahs": 42
  },
  "81": {
    "name": "سُورَةُ التَّكۡوِيرِ",
    "englishName": "At-Takwir",
    "revelationType": "Meccan",
    "numberOfAyahs": 29
  },
  "82": {
    "name": "سُورَةُ الانفِطَارِ",
    "englishName": "Al-Infitaar",
    "revelationType": "Meccan",
    "numberOfAyahs": 19
  },
  "83": {
    "name": "سُورَةُ المُطَفِّفِينَ",
    "englishName": "Al-Mutaffifin",
    "revelationType": "Meccan",
    "numberOfAyahs": 36
  },
  "84": {
    "name": "سُورَةُ الانشِقَاقِ",
    "englishName": "Al-Inshiqaaq",
    "revelationType": "Meccan",
    "numberOfAyahs": 25
  },
  "85": {
    "name": "سُورَةُ البُرُوجِ",
    "englishName": "Al-Burooj",
    "revelationType": "Meccan",
    "numberOfAyahs": 22
  },
  "86": {
    "name": "سُورَةُ الطَّارِقِ",
    "englishName": "At-Taariq",
    "revelationType": "Meccan",
    "numberOfAyahs": 17
  },
  "87": {
    "name": "سُورَةُ الأَعۡلَىٰ",
    "englishName": "Al-A'laa",
    "revelationType": "Meccan",
    "numberOfAyahs": 19
  },
  "88": {
    "name": "سُورَةُ الغَاشِيَةِ",
    "englishName": "Al-Ghaashiya",
    "revelationType": "Meccan",
    "numberOfAyahs": 26
  },
  "89": {
    "name": "سُورَةُ الفَجۡرِ",
    "englishName": "Al-Fajr",
    "revelationType": "Meccan",
    "numberOfAyahs": 30
  },
  "90": {
    "name": "سُورَةُ البَلَدِ",
    "englishName": "Al-Balad",
    "revelationType": "Meccan",
    "numberOfAyahs": 20
  },
  "91": {
    "name": "سُورَةُ الشَّمۡسِ",
    "englishName": "Ash-Shams",
    "revelationType": "Meccan",
    "numberOfAyahs": 15
  },
  "92": {
    "name": "سُورَةُ اللَّيۡلِ",
    "englishName": "Al-Lail",
    "revelationType": "Meccan",
    "numberOfAyahs": 21
  },
  "93": {
    "name": "سُورَةُ الضُّحَىٰ",
    "englishName": "Ad-Dhuhaa",
    "revelationType": "Meccan",
    "numberOfAyahs": 11
  },
  "94": {
    "name": "سُورَةُ الشَّرۡحِ",
    "englishName": "Ash-Sharh",
    "revelationType": "Meccan",
    "numberOfAyahs": 8
  },
  "95": {
    "name": "سُورَةُ التِّينِ",
    "englishName": "At-Tin",
    "revelationType": "Meccan",
    "numberOfAyahs": 8
  },
  "96": {
    "name": "سُورَةُ العَلَقِ",
    "englishName": "Al-Alaq",
    "revelationType": "Meccan",
    "numberOfAyahs": 19
  },
  "97": {
    "name": "سُورَةُ القَدۡرِ",
    "englishName": "Al-Qadr",
    "revelationType": "Meccan",
    "numberOfAyahs": 5
  },
  "98": {
    "name": "سُورَةُ البَيِّنَةِ",
    "englishName": "Al-Bayyina",
    "revelationType": "Medinan",
    "numberOfAyahs": 8
  },
  "99": {
    "name": "سُورَةُ الزَّلۡزَلَةِ",
    "englishName": "Az-Zalzala",
    "revelationType": "Medinan",
    "numberOfAyahs": 8
  },
  "100": {
    "name": "سُورَةُ العَادِيَاتِ",
    "englishName": "Al-Aadiyaat",
    "revelationType": "Meccan",
    "numberOfAyahs": 11
  },
  "101": {
    "name": "سُورَةُ القَارِعَةِ",
    "englishName": "Al-Qaari'a",
    "revelationType": "Meccan",
    "numberOfAyahs": 11
  },
  "102": {
    "name": "سُورَةُ التَّكَاثُرِ",
    "englishName": "At-Takaathur",
    "revelationType": "Meccan",
    "numberOfAyahs": 8
  },
  "103": {
    "name": "سُورَةُ العَصۡرِ",
    "englishName": "Al-Asr",
    "revelationType": "Meccan",
    "numberOfAyahs": 3
  },
  "104": {
    "name": "سُورَةُ الهُمَزَةِ",
    "englishName": "Al-Humaza",
    "revelationType": "Meccan",
    "numberOfAyahs": 9
  },
  "105": {
    "name": "سُورَةُ الفِيلِ",
    "englishName": "Al-Fil",
    "revelationType": "Meccan",
    "numberOfAyahs": 5
  },
  "106": {
    "name": "سُورَةُ قُرَيۡشٍ",
    "englishName": "Quraish",
    "revelationType": "Meccan",
    "numberOfAyahs": 4
  },
  "107": {
    "name": "سُورَةُ المَاعُونِ",
    "englishName": "Al-Maa'un",
    "revelationType": "Meccan",
    "numberOfAyahs": 7
  },
  "108": {
    "name": "سُورَةُ الكَوۡثَرِ",
    "englishName": "Al-Kawthar",
    "revelationType": "Meccan",
    "numberOfAyahs": 3
  },
  "109": {
    "name": "سُورَةُ الكَافِرُونَ",
    "englishName": "Al-Kaafiroon",
    "revelationType": "Meccan",
    "numberOfAyahs": 6
  },
  "110": {
    "name": "سُورَةُ النَّصۡرِ",
    "englishName": "An-Nasr",
    "revelationType": "Medinan",
    "numberOfAyahs": 3
  },
  "111": {
    "name": "سُورَةُ المَسَدِ",
    "englishName": "Al-Masad",
    "revelationType": "Meccan",
    "numberOfAyahs": 5
  },
  "112": {
    "name": "سُورَةُ الإِخۡلَاصِ",
    "englishName": "Al-Ikhlaas",
    "revelationType": "Meccan",
    "numberOfAyahs": 4
  },
  "113": {
    "name": "سُورَةُ الفَلَقِ",
    "englishName": "Al-Falaq",
    "revelationType": "Meccan",
    "numberOfAyahs": 5
  },
  "114": {
    "name": "سُورَةُ النَّاسِ",
    "englishName": "An-Naas",
    "revelationType": "Meccan",
    "numberOfAyahs": 6
  }
};
