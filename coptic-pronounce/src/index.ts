import { copticTextToArabic } from './arabic';
import { copticTextToEnglish } from './english';
import {
  guessCoptic,
  toCoptic,
  type GuessCandidate,
  type GuessFrom,
  type GuessResult,
} from './guess';
import { isCombiningMark, isCopticLetter, stripLeadingPlus } from './shared';

export type PronounceLang = 'en' | 'ar' | 'english' | 'arabic';

export { stripLeadingPlus } from './shared';
export { guessCoptic, toCoptic };
export type { GuessCandidate, GuessFrom, GuessResult };

function isAllowedChar(char: string): boolean {
  if (isCopticLetter(char) || isCombiningMark(char)) return true;
  if (char === '`' || char === '+' || char === '\u200F' || char === '\u200E') return true;
  if (/[.,:;!?()'"""''\-–—/]/.test(char)) return true;
  if (/\s/.test(char)) return true;
  return false;
}

function getFirstCopticWord(texts: string[]): string | null {
  for (const text of texts) {
    if (!text) continue;
    const cleaned = stripLeadingPlus(text);
    for (const word of cleaned.trim().split(/\s+/)) {
      if (!word) continue;
      if ([...word].some(isCopticLetter)) return word;
    }
  }
  return null;
}

function assertCopticWord(word: string): void {
  for (const char of word) {
    if (isAllowedChar(char)) continue;
    const code = char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0');
    throw new Error(
      `Expected Coptic Unicode text; found "${char}" (U+${code}) in "${word}"`,
    );
  }
}

export function pronounce(copticText: string, lang: PronounceLang): string;
export function pronounce(copticText: string[], lang: PronounceLang): string[];
export function pronounce(
  copticText: string | string[],
  lang: PronounceLang,
): string | string[] {
  const isArray = Array.isArray(copticText);
  const texts = isArray ? copticText : [copticText];

  if (texts.length === 0) return isArray ? [] : '';

  const firstWord = getFirstCopticWord(texts);
  if (firstWord) assertCopticWord(firstWord);

  const normalized = String(lang).toLowerCase();

  if (normalized === 'en' || normalized === 'english') {
    const result = copticTextToEnglish(texts);
    return isArray ? result : result[0];
  }

  if (normalized === 'ar' || normalized === 'arabic') {
    const result = copticTextToArabic(texts);
    return isArray ? result : result[0];
  }

  throw new Error(`Unsupported language "${lang}". Use "en" or "ar".`);
}
