import type { SupportedLanguage } from "./bookDefinitions";
import { normalizeText } from "./numberParsing";

export type NavigationIntent = "next" | "previous";

const NEXT: Record<SupportedLanguage, RegExp[]> = {
  ru: [
    /следующ\p{L}*\s+(?:стих|текст)/u,
    /(?:перейд|переход)\p{L}*\s+(?:к\s+)?следующ/u,
    /(?:дальше|далее)\s+(?:чита|стих|текст)/u,
  ],
  en: [/next\s+(?:verse|text|passage)/, /(?:move|go|continue)\s+(?:on\s+)?to\s+the\s+next/],
};

const PREVIOUS: Record<SupportedLanguage, RegExp[]> = {
  ru: [
    /предыдущ\p{L}*\s+(?:стих|текст)/u,
    /(?:верн|возврат)\p{L}*\s+(?:назад\s+)?(?:к|на)\s+(?:предыдущ|прошл)/u,
  ],
  en: [/previous\s+(?:verse|text|passage)/, /(?:go|move|come)\s+back\s+to\s+the\s+(?:previous|last)\s+verse/],
};

export function detectNavigationIntent(text: string, language: SupportedLanguage): NavigationIntent | null {
  const normalized = normalizeText(text);
  if (NEXT[language].some((pattern) => pattern.test(normalized))) return "next";
  if (PREVIOUS[language].some((pattern) => pattern.test(normalized))) return "previous";
  return null;
}
