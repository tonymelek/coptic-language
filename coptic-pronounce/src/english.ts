import {
  COMBINING_MARKS,
  lowerCoptic,
  lowerCopticChar,
  splitTrailingPunct,
  stripLeadingPlus,
  toGraphemes,
  type Grapheme,
} from './shared';

/** Whole-word / multi-letter liturgical overrides (matched on lowercased stem). */
const LEXICAL: [RegExp, string][] = [
  [/^(ⲡ̀?ϭⲟⲓⲥ|ⲡⲟ̅ⲥ̅)$/u, 'Epshois'],
  [/^ϭⲟⲓⲥ$/u, 'shois'],
  [/^(ⲫ̀?ⲛⲟⲩϯ|ⲫϯ)$/u, 'Efnouti'],
  [/^ⲭ̅ⲉ̅$/u, 'Shere ne Maria'], // liturgical abbreviation
  [/^ⲭⲉⲣⲉ$/u, 'Shere'],
  [/^ⲡ̅?ⲭ̅ⲥ̅$/u, 'Pikhrestos'], // Ⲡⲭ̅ⲥ̅ = Ⲡⲓⲭⲣⲓⲥⲧⲟⲥ
  [/^ⲭ̅ⲥ̅$/u, 'Ekrestos'],
  [/^ⲓ̅?ⲏ̅ⲥ̅$/u, 'Isous'], // Ⲓⲏ̅ⲥ̅ = Ⲓⲏⲥⲟⲩⲥ
  [/^(ⲉ̀?̅ⲑ̅ⲩ̅|ⲉ̅ⲑ̅ⲩ̅)$/u, 'ethowab'],
  [/^ⲥ̅ⲱ̅ⲣ̅$/u, 'Sotir'],
  [/^ⲫⲓⲗⲁⲛⲑ̀?ⲣⲱⲡⲉ$/u, 'filan-ethrobe'],
  [/^ⲇⲟⲝⲁ$/u, 'Zoxa'],
];

const VOWELS = new Set(['ⲁ', 'ⲉ', 'ⲏ', 'ⲓ', 'ⲟ', 'ⲩ', 'ⲱ']);

function isVowel(letter: string): boolean {
  return VOWELS.has(lowerCopticChar(letter));
}

function letterSound(g: Grapheme, next: Grapheme | undefined): string {
  const L = lowerCopticChar(g.letter);
  const N = next ? lowerCopticChar(next.letter) : '';
  const wasUpper = g.letter !== L && isCopticBase(g.letter);

  let sound = '';

  switch (L) {
    case 'ⲁ':
      sound = 'a';
      break;
    case 'ⲃ':
      // Usually v; b before ⲥ (ϩⲱⲃⲥ → howbs)
      sound = N === 'ⲥ' ? 'b' : 'v';
      break;
    case 'ⲅ':
      sound = 'g';
      break;
    case 'ⲇ':
      sound = 'd';
      break;
    case 'ⲉ':
      sound = 'e';
      break;
    case 'ⲍ':
      sound = 'z';
      break;
    case 'ⲏ':
      // Bohairic liturgical ee/i (ϣⲏⲣⲓ → shiri, Ϩⲏⲡⲡⲉ → Hippe)
      sound = 'i';
      break;
    case 'ⲑ':
      sound = 'th';
      break;
    case 'ⲓ':
      sound = 'i';
      break;
    case 'ⲕ':
      sound = 'k';
      break;
    case 'ⲗ':
      sound = 'l';
      break;
    case 'ⲙ':
      sound = 'm';
      break;
    case 'ⲛ':
      sound = 'n';
      break;
    case 'ⲝ':
      sound = 'ks';
      break;
    case 'ⲟ':
      sound = 'o';
      break;
    case 'ⲡ':
      sound = 'p';
      break;
    case 'ⲣ':
      sound = 'r';
      break;
    case 'ⲥ':
      sound = 's';
      break;
    case 'ⲧ':
      sound = 't';
      break;
    case 'ⲩ':
      sound = 'y';
      break;
    case 'ⲫ':
      sound = 'f';
      break;
    case 'ⲭ':
      sound = 'kh';
      break;
    case 'ⲯ':
      // Word-initial / after jenkim: eps… (ⲯⲩⲭⲏ → epsishi)
      sound = 'eps';
      break;
    case 'ⲱ':
      sound = 'o';
      break;
    case 'ϣ':
      sound = 'sh';
      break;
    case 'ϥ':
      sound = 'f';
      break;
    case 'ϧ':
      sound = 'kh';
      break;
    case 'ϩ':
      sound = 'h';
      break;
    case 'ϫ':
      // soft j before front vowels, hard g before back
      sound = N === 'ⲁ' || N === 'ⲟ' || N === 'ⲱ' || N === 'ⲟ' ? 'g' : 'j';
      break;
    case 'ϭ':
      // ϭⲟⲓⲥ handled lexically; otherwise ch/tsh, or sh before ⲓ
      if (N === 'ⲓ') sound = 'sh';
      else if (N === 'ⲁ' || N === 'ⲟ' || N === 'ⲱ') sound = 'tsh';
      else sound = 'ch';
      break;
    case 'ϯ':
      sound = 'ti';
      break;
    default:
      // Pass through punctuation / unknown
      if (L === '`') return '';
      sound = g.letter.replace(COMBINING_MARKS, '');
      return sound;
  }

  if (wasUpper && sound.length > 0) {
    sound = sound[0].toUpperCase() + sound.slice(1);
  }
  return sound;
}

function isCopticBase(char: string): boolean {
  const code = char.codePointAt(0)!;
  return (
    (code >= 0x2c80 && code <= 0x2cff) ||
    (code >= 0x03e2 && code <= 0x03ef)
  );
}

function peek(gs: Grapheme[], i: number, offset: number): string {
  const g = gs[i + offset];
  return g ? lowerCopticChar(g.letter) : '';
}

/**
 * Consume multi-letter patterns starting at index.
 * Order matters: longer patterns first.
 */
function matchDigraph(gs: Grapheme[], i: number): { text: string; consumed: number } | null {
  const a = peek(gs, i, 0);
  const b = peek(gs, i, 1);
  const c = peek(gs, i, 2);
  const d = peek(gs, i, 3);
  const e = peek(gs, i, 4);

  // ⲡ̀?=ⲟⲓⲥ → pshois / Epshois (jenkim handled by caller for Ep…)
  if (a === 'ⲡ' && b === 'ϭ' && c === 'ⲟ' && d === 'ⲓ' && e === 'ⲥ') {
    const base = gs[i].jenkim ? 'Epshois' : capitalizeLike(gs[i], 'pshois');
    return { text: base, consumed: 5 };
  }
  // ϭⲟⲓⲥ → shois
  if (a === 'ϭ' && b === 'ⲟ' && c === 'ⲓ' && d === 'ⲥ') {
    return { text: capitalizeLike(gs[i], 'shois'), consumed: 4 };
  }

  // ⲯⲩⲭ → epsish (ⲯⲩⲭⲏ → epsishi)
  if (a === 'ⲯ' && b === 'ⲩ' && c === 'ⲭ') {
    return { text: capitalizeLike(gs[i], 'epsish'), consumed: 3 };
  }

  // ⲟⲩⲱ̀?ⲟⲩ → ou-ow-ou
  if (a === 'ⲟ' && b === 'ⲩ' && c === 'ⲱ' && d === 'ⲟ' && e === 'ⲩ') {
    return { text: capitalizeLike(gs[i], 'ou-ow-ou'), consumed: 5 };
  }
  // ϭⲓⲱ̀?ⲟⲩ → shi-ow-ou / itshi-ow-ou style
  if (a === 'ϭ' && b === 'ⲓ' && c === 'ⲱ' && d === 'ⲟ' && e === 'ⲩ') {
    return { text: capitalizeLike(gs[i], 'shi-ow-ou'), consumed: 5 };
  }

  // ⲅⲁⲣ → ghar
  if (a === 'ⲅ' && b === 'ⲁ' && c === 'ⲣ') {
    return { text: capitalizeLike(gs[i], 'ghar'), consumed: 3 };
  }
  // ⲇⲟⲝ → zox (Greek δόξα)
  if (a === 'ⲇ' && b === 'ⲟ' && c === 'ⲝ') {
    return { text: capitalizeLike(gs[i], 'zox'), consumed: 3 };
  }
  // ⲇⲉ particle → ze
  if (a === 'ⲇ' && b === 'ⲉ') {
    return { text: capitalizeLike(gs[i], 'ze'), consumed: 2 };
  }
  // ⲟⲩⲓ → owi (must precede ⲟⲩ)
  if (a === 'ⲟ' && b === 'ⲩ' && c === 'ⲓ') {
    return { text: capitalizeLike(gs[i], 'owi'), consumed: 3 };
  }
  // ⲏⲓ → e (ⲡ̀ⲏⲓ → ep-e)
  if (a === 'ⲏ' && b === 'ⲓ') {
    return { text: capitalizeLike(gs[i], 'e'), consumed: 2 };
  }
  // ⲱⲟⲩ → ow-ou
  if (a === 'ⲱ' && b === 'ⲟ' && c === 'ⲩ') {
    return { text: capitalizeLike(gs[i], 'ow-ou'), consumed: 3 };
  }
  // ⲟⲩⲱ → ou-o
  if (a === 'ⲟ' && b === 'ⲩ' && c === 'ⲱ') {
    return { text: capitalizeLike(gs[i], 'ou-o'), consumed: 3 };
  }
  // ⲓⲟ → io (efiom); yo is an interchangeable spelling — harness equates y/i
  // Skip when ⲟ starts ⲟⲩ so ⲁⲗⲓⲟⲩⲓ still becomes …owi
  if (a === 'ⲓ' && b === 'ⲟ' && c !== 'ⲩ') {
    return { text: capitalizeLike(gs[i], 'io'), consumed: 2 };
  }
  // ⲟⲩ → ou (ow before another vowel)
  if (a === 'ⲟ' && b === 'ⲩ') {
    const nextL = c;
    if (nextL === 'ⲟ' || nextL === 'ⲱ' || nextL === 'ⲁ') {
      return { text: capitalizeLike(gs[i], 'ow'), consumed: 2 };
    }
    return { text: capitalizeLike(gs[i], 'ou'), consumed: 2 };
  }
  if (a === 'ⲁ' && b === 'ⲩ') return { text: capitalizeLike(gs[i], 'av'), consumed: 2 };
  if (a === 'ⲉ' && b === 'ⲩ') return { text: capitalizeLike(gs[i], 'ev'), consumed: 2 };
  if (a === 'ⲏ' && b === 'ⲩ') return { text: capitalizeLike(gs[i], 'iv'), consumed: 2 };
  if (a === 'ⲉ' && b === 'ⲓ') return { text: capitalizeLike(gs[i], 'i'), consumed: 2 };
  if (a === 'ⲅ' && b === 'ⲅ') return { text: capitalizeLike(gs[i], 'ng'), consumed: 2 };
  if (a === 'ⲛ' && b === 'ⲅ') return { text: capitalizeLike(gs[i], 'ng'), consumed: 2 };
  if (a === 'ⲛ' && b === 'ⲕ') return { text: capitalizeLike(gs[i], 'nk'), consumed: 2 };
  if (a === 'ⲛ' && b === 'ⲭ') return { text: capitalizeLike(gs[i], 'nkh'), consumed: 2 };
  if (a === 'ⲃ' && b === 'ⲃ') return { text: capitalizeLike(gs[i], 'v'), consumed: 2 };
  return null;
}

function capitalizeLike(g: Grapheme, text: string): string {
  const L = lowerCopticChar(g.letter);
  if (g.letter !== L && text.length > 0) {
    return text[0].toUpperCase() + text.slice(1);
  }
  return text;
}

function applyLexical(stem: string): string | null {
  const lower = lowerCoptic(stem);
  for (const [pattern, replacement] of LEXICAL) {
    if (pattern.test(lower)) return replacement;
  }
  return null;
}

/**
 * Jenkim on a consonant → epenthetic "e" before that consonant's sound.
 * Jenkim on a vowel → syllable break hyphen after the vowel sound (e-ep…).
 */
function pronounceWord(copticWord: string): string {
  const { stem, suffix } = splitTrailingPunct(copticWord);
  if (!stem) return suffix;

  const lexical = applyLexical(stem);
  if (lexical) return lexical + suffix;

  const gs = toGraphemes(stem);
  let out = '';
  let i = 0;

  while (i < gs.length) {
    const g = gs[i];

    // Skip lone combining leftovers / backticks already folded into jenkim
    if (g.letter === '`' || (COMBINING_MARKS.test(g.letter) && !isCopticBase(g.letter))) {
      i++;
      continue;
    }

    const digraph = matchDigraph(gs, i);
    if (digraph) {
      // Patterns that already encode jenkim epenthesis (Epshois, etc.)
      const encodesJenkim =
        /pshois|Epshois|shois|epsish|shi-ow-ou|ou-ow-ou/i.test(digraph.text);

      if (g.jenkim && !isVowel(g.letter) && !encodesJenkim) {
        if (out.length > 0 && /[aeiouy]$/i.test(out.replace(/-+$/g, '')) && !out.endsWith('-')) {
          out += '-';
        }
        out += 'e';
      }
      if (g.jenkim && isVowel(g.letter) && out.length > 0) {
        if (!out.endsWith('-')) out += '-';
      }
      let piece = digraph.text;
      // ⲡ̀ϭⲟⲓⲥ mid-word after vowel jenkim hyphen: e-Epshois
      if (
        encodesJenkim &&
        g.jenkim &&
        !isVowel(g.letter) &&
        /pshois/i.test(piece)
      ) {
        piece = capitalizeLike(g, 'Epshois');
      }
      out += piece;
      i += digraph.consumed;
      continue;
    }

    const next = gs[i + 1];
    let sound = letterSound(g, next);

    if (g.jenkim) {
      if (!isVowel(g.letter)) {
        // consonant jenkim → epenthetic e before sound: ⲛ̀ → en, ⲡ̀ → ep
        const ep = 'e';
        // After a vowel sound, use hyphen: ⲉ̀ⲡ̀ → e-ep
        if (out.length > 0 && /[aeiouy]$/i.test(out.replace(/-+$/g, '')) && !out.endsWith('-')) {
          out += '-';
        }
        out += ep + sound.toLowerCase();
        // Preserve capitalization for word-initial: Ⲡ̀ → Ep
        if (i === 0 && g.letter !== lowerCopticChar(g.letter) && out.length > 0) {
          out = out[0].toUpperCase() + out.slice(1);
        }
      } else {
        // vowel jenkim → emit vowel, then hyphen if more follows
        out += sound;
        if (i + 1 < gs.length && !out.endsWith('-')) out += '-';
      }
    } else {
      out += sound;
    }

    i++;
  }

  // Clean doubled hyphens / leftover marks
  out = out
    .replace(COMBINING_MARKS, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  return out + suffix;
}

export function copticTextToEnglish(textArray: string[]): string[] {
  return textArray.map((text) => {
    const cleaned = stripLeadingPlus(text);
    const words = cleaned.split(/(\s+)/);
    return words
      .map((token) => (/^\s+$/.test(token) ? token : pronounceWord(token)))
      .join('');
  });
}
