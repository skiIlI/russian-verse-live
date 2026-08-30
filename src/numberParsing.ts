import type { SupportedLanguage } from "./bookDefinitions";

const RU_NUMBERS: Record<string, number> = {};
const EN_NUMBERS: Record<string, number> = {};

function add(target: Record<string, number>, value: number, words: string[]): void {
  for (const word of words) target[word] = value;
}

add(RU_NUMBERS, 1, ["один", "одна", "одно", "первый", "первая", "первое", "первую", "первого", "первой", "первом", "первым"]);
add(RU_NUMBERS, 2, ["два", "две", "второй", "вторая", "второе", "вторую", "второго", "втором", "вторым"]);
add(RU_NUMBERS, 3, ["три", "третий", "третья", "третье", "третью", "третьего", "третьей", "третьем", "третьим"]);
add(RU_NUMBERS, 4, ["четыре", "четвертый", "четвертая", "четвертое", "четвертую", "четвертого", "четвертой", "четвертом", "четго", "четого"]);
add(RU_NUMBERS, 5, ["пять", "пятый", "пятая", "пятое", "пятого", "пятой", "пятом"]);
add(RU_NUMBERS, 6, ["шесть", "шестой", "шестая", "шестое", "шестого", "шестом"]);
add(RU_NUMBERS, 7, ["семь", "седьмой", "седьмая", "седьмое", "седьмого", "седьмом"]);
add(RU_NUMBERS, 8, ["восемь", "восьмой", "восьмая", "восьмое", "восьмого", "восьмом"]);
add(RU_NUMBERS, 9, ["девять", "девятый", "девятая", "девятое", "девятого", "девятой", "девятом"]);
add(RU_NUMBERS, 10, ["десять", "десятый", "десятая", "десятое", "десятого", "десятой", "десятом"]);
add(RU_NUMBERS, 11, ["одиннадцать", "одиннадцатый", "одиннадцатая", "одиннадцатого", "одиннадцатой", "одиннадцатом"]);
add(RU_NUMBERS, 12, ["двенадцать", "двенадцатый", "двенадцатая", "двенадцатые", "двенадцатого", "двенадцатой", "двенадцатом", "днатые"]);
add(RU_NUMBERS, 13, ["тринадцать", "тринадцатый", "тринадцатая", "тринадцатого", "тринадцатой", "тринадцатом"]);
add(RU_NUMBERS, 14, ["четырнадцать", "четырнадцатый", "четырнадцатая", "четырнадцатого", "четырнадцатой", "четырнадцатом"]);
add(RU_NUMBERS, 15, ["пятнадцать", "пятнадцатый", "пятнадцатая", "пятнадцатого", "пятнадцатой", "пятнадцатом"]);
add(RU_NUMBERS, 16, ["шестнадцать", "шестнадцатый", "шестнадцатая", "шестнадцатого", "шестнадцатой", "шестнадцатом"]);
add(RU_NUMBERS, 17, ["семнадцать", "семнадцатый", "семнадцатая", "семнадцатого", "семнадцатой", "семнадцатом"]);
add(RU_NUMBERS, 18, ["восемнадцать", "восемнадцатый", "восемнадцатая", "восемнадцатого", "восемнадцатой", "восемнадцатом"]);
add(RU_NUMBERS, 19, ["девятнадцать", "девятнадцатый", "девятнадцатая", "девятнадцатого", "девятнадцатой", "девятнадцатом"]);
add(RU_NUMBERS, 20, ["двадцать", "двадцатый", "двадцатая", "двадцатые", "двадцатого", "двадцатой", "двадцатом"]);
add(RU_NUMBERS, 30, ["тридцать", "тридцатый", "тридцатая", "тридцатые", "тридцатого", "тридцатой", "тридцатом"]);
add(RU_NUMBERS, 40, ["сорок", "сороковой", "сороковая", "сороковые", "сороковых", "сорокового", "сороковом"]);
add(RU_NUMBERS, 50, ["пятьдесят", "пятидесятый", "пятидесятая", "пятидесятого", "пятидесятом"]);
add(RU_NUMBERS, 60, ["шестьдесят", "шестидесятый", "шестидесятая", "шестидесятого", "шестидесятом"]);
add(RU_NUMBERS, 70, ["семьдесят", "семидесятый", "семидесятая", "семидесятого", "семидесятом"]);
add(RU_NUMBERS, 80, ["восемьдесят", "восьмидесятый", "восьмидесятая", "восьмидесятого", "восьмидесятом"]);
add(RU_NUMBERS, 90, ["девяносто", "девяностый", "девяностая", "девяностого", "девяностом"]);
add(RU_NUMBERS, 100, ["сто", "сотый", "сотая", "сотого", "сотом"]);

add(EN_NUMBERS, 1, ["one", "first"]);
add(EN_NUMBERS, 2, ["two", "second"]);
add(EN_NUMBERS, 3, ["three", "third"]);
add(EN_NUMBERS, 4, ["four", "fourth"]);
add(EN_NUMBERS, 5, ["five", "fifth"]);
add(EN_NUMBERS, 6, ["six", "sixth"]);
add(EN_NUMBERS, 7, ["seven", "seventh"]);
add(EN_NUMBERS, 8, ["eight", "eighth"]);
add(EN_NUMBERS, 9, ["nine", "ninth"]);
add(EN_NUMBERS, 10, ["ten", "tenth"]);
add(EN_NUMBERS, 11, ["eleven", "eleventh"]);
add(EN_NUMBERS, 12, ["twelve", "twelfth"]);
add(EN_NUMBERS, 13, ["thirteen", "thirteenth"]);
add(EN_NUMBERS, 14, ["fourteen", "fourteenth"]);
add(EN_NUMBERS, 15, ["fifteen", "fifteenth"]);
add(EN_NUMBERS, 16, ["sixteen", "sixteenth"]);
add(EN_NUMBERS, 17, ["seventeen", "seventeenth"]);
add(EN_NUMBERS, 18, ["eighteen", "eighteenth"]);
add(EN_NUMBERS, 19, ["nineteen", "nineteenth"]);
add(EN_NUMBERS, 20, ["twenty", "twentieth"]);
add(EN_NUMBERS, 30, ["thirty", "thirtieth"]);
add(EN_NUMBERS, 40, ["forty", "fortieth"]);
add(EN_NUMBERS, 50, ["fifty", "fiftieth"]);
add(EN_NUMBERS, 60, ["sixty", "sixtieth"]);
add(EN_NUMBERS, 70, ["seventy", "seventieth"]);
add(EN_NUMBERS, 80, ["eighty", "eightieth"]);
add(EN_NUMBERS, 90, ["ninety", "ninetieth"]);
add(EN_NUMBERS, 100, ["hundred", "hundredth"]);

const FILLERS: Record<SupportedLanguage, Set<string>> = {
  ru: new Set(["номер", "це", "это", "з", "із", "с", "со", "по", "и"]),
  en: new Set(["number", "the", "and", "from", "at"]),
};

export function normalizeText(text: string): string {
  return text.toLocaleLowerCase().replaceAll("ё", "е").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

export function tokenize(text: string): string[] {
  return normalizeText(text).match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function isNumberToken(token: string, language: SupportedLanguage): boolean {
  return /^\d{1,3}$/.test(token) || (language === "ru" ? RU_NUMBERS : EN_NUMBERS)[token] !== undefined;
}

export function parseNumberTokens(input: string[], language: SupportedLanguage, max = 176): number | null {
  const words = input.filter((word) => !FILLERS[language].has(word));
  if (words.length === 0) return null;
  if (words.length === 1 && /^\d{1,3}$/.test(words[0])) {
    const numeric = Number(words[0]);
    return numeric >= 1 && numeric <= max ? numeric : null;
  }
  if (words.some((word) => /^\d/.test(word))) return null;

  const map = language === "ru" ? RU_NUMBERS : EN_NUMBERS;
  let hundreds = 0;
  let current = 0;
  for (const word of words) {
    const value = map[word];
    if (!value) return null;
    if (value === 100) {
      if (hundreds || current > 9) return null;
      hundreds = (current || 1) * 100;
      current = 0;
      continue;
    }
    if (value >= 20) {
      if (current !== 0) return null;
      current = value;
      continue;
    }
    if (current >= 20 && current < 100) current += value;
    else if (current === 0) current = value;
    else return null;
  }
  const total = hundreds + current;
  return total >= 1 && total <= max ? total : null;
}

export function parseTrailingNumber(words: string[], language: SupportedLanguage, max = 176): number | null {
  for (let length = Math.min(6, words.length); length >= 1; length -= 1) {
    const value = parseNumberTokens(words.slice(-length), language, max);
    if (value) return value;
  }
  return null;
}

export function parseLeadingNumber(words: string[], language: SupportedLanguage, max = 176): number | null {
  for (let length = Math.min(6, words.length); length >= 1; length -= 1) {
    const value = parseNumberTokens(words.slice(0, length), language, max);
    if (value) return value;
  }
  return null;
}

export function parseTwoNumbers(words: string[], language: SupportedLanguage): [number, number] | null {
  const clean = words.filter((word) => !FILLERS[language].has(word));
  for (let split = 1; split < clean.length; split += 1) {
    const first = parseNumberTokens(clean.slice(0, split), language, 150);
    const second = parseNumberTokens(clean.slice(split), language, 176);
    if (first && second) return [first, second];
  }
  return null;
}
