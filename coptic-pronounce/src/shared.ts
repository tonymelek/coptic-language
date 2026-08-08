/** Combining marks commonly found on Coptic liturgical text */
export const JENKIM = '\u0300'; // combining grave
export const OVERLINE = '\u0305'; // combining overline (nomina sacra)
export const COMBINING_MARKS = /[\u0300-\u036f]/g;

export const TRAILING_PUNCT = /[.,:;!?]+$/;
export const LEADING_PLUS = /^\+\s*/;

/** True if char is a Coptic letter (main block or supplemental). */
export function isCopticLetter(char: string): boolean {
  const code = char.codePointAt(0)!;
  return (
    (code >= 0x2c80 && code <= 0x2cff) ||
    (code >= 0x03e2 && code <= 0x03ef)
  );
}

export function isCombiningMark(char: string): boolean {
  const code = char.codePointAt(0)!;
  return code >= 0x0300 && code <= 0x036f;
}

export type Grapheme = {
  letter: string;
  jenkim: boolean;
  overline: boolean;
  marks: string[];
};

/**
 * Split a Coptic word into grapheme clusters: base letter + following combining marks.
 * Non-letter chars (punctuation, Latin leftovers) become their own clusters.
 */
export function toGraphemes(word: string): Grapheme[] {
  const chars = [...word];
  const out: Grapheme[] = [];
  let i = 0;
  while (i < chars.length) {
    const letter = chars[i];
    const marks: string[] = [];
    i++;
    while (i < chars.length && isCombiningMark(chars[i])) {
      marks.push(chars[i]);
      i++;
    }
    out.push({
      letter,
      jenkim: marks.includes(JENKIM) || letter === '`',
      overline: marks.includes(OVERLINE),
      marks,
    });
  }
  return out;
}

export function stripLeadingPlus(text: string): string {
  return text.replace(LEADING_PLUS, '');
}

export function splitTrailingPunct(word: string): { stem: string; suffix: string } {
  const match = word.match(TRAILING_PUNCT);
  if (!match) return { stem: word, suffix: '' };
  return { stem: word.slice(0, -match[0].length), suffix: match[0] };
}

/** Lowercase Coptic (Unicode doesn't case-fold Coptic via toLowerCase reliably on all runtimes). */
const COPTIC_UPPER_TO_LOWER: Record<string, string> = {
  'Ⲁ': 'ⲁ', 'Ⲃ': 'ⲃ', 'Ⲅ': 'ⲅ', 'Ⲇ': 'ⲇ', 'Ⲉ': 'ⲉ', 'Ⲍ': 'ⲍ', 'Ⲏ': 'ⲏ',
  'Ⲑ': 'ⲑ', 'Ⲓ': 'ⲓ', 'Ⲕ': 'ⲕ', 'Ⲗ': 'ⲗ', 'Ⲙ': 'ⲙ', 'Ⲛ': 'ⲛ', 'Ⲝ': 'ⲝ',
  'Ⲟ': 'ⲟ', 'Ⲡ': 'ⲡ', 'Ⲣ': 'ⲣ', 'Ⲥ': 'ⲥ', 'Ⲧ': 'ⲧ', 'Ⲩ': 'ⲩ', 'Ⲫ': 'ⲫ',
  'Ⲭ': 'ⲭ', 'Ⲯ': 'ⲯ', 'Ⲱ': 'ⲱ', 'Ϣ': 'ϣ', 'Ϥ': 'ϥ', 'Ϧ': 'ϧ', 'Ϩ': 'ϩ',
  'Ϫ': 'ϫ', 'Ϭ': 'ϭ', 'Ϯ': 'ϯ',
};

export function lowerCopticChar(char: string): string {
  return COPTIC_UPPER_TO_LOWER[char] ?? char.toLowerCase();
}

export function lowerCoptic(text: string): string {
  return [...text].map(lowerCopticChar).join('');
}
