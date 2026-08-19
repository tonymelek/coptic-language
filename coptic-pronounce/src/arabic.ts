import {
  COMBINING_MARKS,
  lowerCopticChar,
  matchLexical,
  splitTrailingPunct,
  stripLeadingPlus,
  toGraphemes,
  type Grapheme,
} from './shared';

/** Whole-word liturgical overrides (lowercased Coptic stem). */
const LEXICAL: [RegExp, string][] = [
  [/^(ⲡ̀?ϭⲟⲓⲥ|ⲡⲟ̅ⲥ̅)$/u, 'إبشويس'],
  [/^ⲡⲉⲛ(ϭⲟⲓⲥ|ⲟ̅ⲥ̅)$/u, 'بين شويس'], // our Lord
  [/^ϭⲟⲓⲥ$/u, 'شويس'],
  [/^ⲟ̅ⲥ̅$/u, 'شويس'],
  [/^(ⲫ̀?ⲛⲟⲩϯ|ⲫϯ)$/u, 'إفنوتي'],
  [/^ⲭ̅ⲉ̅$/u, 'شيرى نى ماريا'], // liturgical abbreviation
  [/^ⲭⲉⲣⲉ$/u, 'شيرى'],
  [/^ⲡ̅?ⲭ̅ⲥ̅$/u, 'بي اخرستوس'], // Ⲡⲭ̅ⲥ̅ = Ⲡⲓⲭⲣⲓⲥⲧⲟⲥ
  [/^ⲭ̅ⲥ̅$/u, 'اخرستوس'],
  [/^ⲓ̅?ⲏ̅ⲥ̅$/u, 'إيسوس'], // Ⲓⲏ̅ⲥ̅ = Ⲓⲏⲥⲟⲩⲥ
  [/^ⲁ̅?ⲗ̅$/u, 'الليلويا'],
  [/^ⲭ̀?ⲣⲓⲥⲧⲟⲥ$/u, 'اخرستوس'],
  [/^(ⲉ̀?̅ⲑ̅ⲩ̅|ⲉ̅ⲑ̅ⲩ̅)$/u, 'اثؤاب'],
  [/^ⲥ̅ⲱ̅ⲣ̅$/u, 'سوتير'],
  [/^ⲫⲓⲗⲁⲛⲑ̀?ⲣⲱⲡⲉ$/u, 'فيلان إثروبى'],
  [/^ⲇⲟⲝⲁ$/u, 'ذوكسا'],
];

/**
 * Pronominal / clitic prefixes Arabic readers prefer as a separate word.
 * Matched longest-first; only when more of the word follows → emit + trailing space.
 * e.g. ⲙ̀ⲡⲉⲕⲥ̀ⲧⲁⲩⲣⲟⲥ → إمبيك إستافروس, ⲕ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ → إك إسماروؤت
 */
const PROCLITICS: { letters: string; arabic: string }[] = [
  { letters: 'ⲙⲡⲉⲕ', arabic: 'إمبيك' },
  { letters: 'ⲙⲡⲉϥ', arabic: 'إمبيف' },
  { letters: 'ⲙⲡⲉⲥ', arabic: 'إمبيس' },
  { letters: 'ⲙⲡⲉⲛ', arabic: 'إمبين' },
  { letters: 'ⲙⲡⲉ', arabic: 'إمبي' },
  { letters: 'ⲙⲡⲓ', arabic: 'إمبي' }, // إمبي اخرستوس
  { letters: 'ⲡⲉⲕ', arabic: 'بيك' },
  { letters: 'ⲡⲉϥ', arabic: 'بيف' },
  { letters: 'ⲡⲉⲥ', arabic: 'بيس' },
  { letters: 'ⲡⲉⲛ', arabic: 'بين' },
  { letters: 'ⲙⲫ', arabic: 'إم اف' }, // ⲙ̀ⲫ̀… → إم اف…
  { letters: 'ⲙⲡ', arabic: 'إم اب' }, // ⲙ̀ⲡ̀… → إم اب…
  { letters: 'ⲡⲓ', arabic: 'بي' }, // بي اخرستوس
  { letters: 'ⲉϥ', arabic: 'إف' },
  { letters: 'ⲉⲕ', arabic: 'إك' },
  { letters: 'ⲕ', arabic: 'إك' }, // ⲕ̀…إك إسماروؤت
];

function lettersMatch(gs: Grapheme[], start: number, pattern: string): boolean {
  if (start + pattern.length > gs.length) return false;
  for (let j = 0; j < pattern.length; j++) {
    if (lowerCopticChar(gs[start + j].letter) !== pattern[j]) return false;
  }
  return true;
}

/**
 * Match a spaced proclitic at index i when the rest of the word continues.
 * Jenkim on the first consonant of ⲙ̀ⲡⲉⲕ / ⲕ̀ / ⲥ̀ is assumed for short forms.
 */
function matchProclitic(
  gs: Grapheme[],
  i: number,
): { text: string; consumed: number } | null {
  for (const { letters, arabic } of PROCLITICS) {
    if (!lettersMatch(gs, i, letters)) continue;
    const consumed = letters.length;
    if (i + consumed >= gs.length) continue; // nothing follows — keep attached

    // Short single-letter clitics (ⲕ̀, ⲥ̀) require jenkim on that letter
    if (letters.length === 1 && !gs[i].jenkim) continue;
    // ⲙⲫ / ⲙⲡ two-letter: require jenkim on ⲙ (and typically on ⲫ/ⲡ)
    if ((letters === 'ⲙⲫ' || letters === 'ⲙⲡ') && !gs[i].jenkim) continue;
    // ⲙⲡⲉ… family: jenkim usually on ⲙ
    if (letters.startsWith('ⲙⲡⲉ') && !gs[i].jenkim && i === 0) {
      // allow ⲡⲉⲕ… without leading ⲙ
    }

    // Don't treat plain ⲡⲓ at end-ish without following content (already checked)
    // Avoid splitting ⲡⲓϭⲟⲓⲥ — handled by digraph/lexical first; proclitic runs after digraph miss
    if (letters === 'ⲡⲓ') {
      const next = gs[i + consumed];
      const n = next ? lowerCopticChar(next.letter) : '';
      // only space before Greek-loan / heavy nouns (ⲭ, ⲥ̀, ⲁ…)
      if (n !== 'ⲭ' && n !== 'ⲥ' && n !== 'ⲡ' && n !== 'ⲛ') continue;
    }

    return { text: arabic + ' ', consumed };
  }
  return null;
}

const VOWELS = new Set(['ⲁ', 'ⲉ', 'ⲏ', 'ⲓ', 'ⲟ', 'ⲩ', 'ⲱ']);

function isVowel(letter: string): boolean {
  return VOWELS.has(lowerCopticChar(letter));
}

function isCopticBase(char: string): boolean {
  const code = char.codePointAt(0)!;
  return (
    (code >= 0x2c80 && code <= 0x2cff) ||
    (code >= 0x03e2 && code <= 0x03ef)
  );
}

/**
 * Epenthetic vowel for consonant jenkim — golden liturgical Arabic uses إ.
 * Word-medial after content stays compact (إنتى not ا نتى).
 */
function epenthetic(out: string): string {
  return out.length > 0 ? 'ا' : 'إ';
}

function letterSound(g: Grapheme, next: Grapheme | undefined, atEnd: boolean): string {
  const L = lowerCopticChar(g.letter);
  const N = next ? lowerCopticChar(next.letter) : '';

  switch (L) {
    case 'ⲁ':
      return 'ا';
    case 'ⲃ':
      // ب before ⲥ; else ف/ڤ — goldens usually ف
      return N === 'ⲥ' ? 'ب' : 'ف';
    case 'ⲅ':
      return 'غ';
    case 'ⲇ':
      return 'د';
    case 'ⲉ':
    case 'ⲏ':
    case 'ⲓ':
      // Final front vowel → ى (شيرى، إنتى)
      return atEnd ? 'ى' : 'ي';
    case 'ⲍ':
      return 'ز';
    case 'ⲑ':
      return 'ث';
    case 'ⲕ':
      return 'ك';
    case 'ⲗ':
      return 'ل';
    case 'ⲙ':
      return 'م';
    case 'ⲛ':
      return 'ن';
    case 'ⲝ':
      return 'كس';
    case 'ⲟ':
    case 'ⲱ':
      return 'و';
    case 'ⲡ':
      return 'ب';
    case 'ⲣ':
      return 'ر';
    case 'ⲥ':
      return 'س';
    case 'ⲧ':
      return 'ت';
    case 'ⲩ':
      return atEnd ? 'ى' : 'ي';
    case 'ⲫ':
      return 'ف';
    case 'ⲭ':
      return 'خ';
    case 'ⲯ':
      return 'بس';
    case 'ϣ':
      return 'ش';
    case 'ϥ':
      return 'ف';
    case 'ϧ':
      return 'خ';
    case 'ϩ':
      return 'ه';
    case 'ϫ':
      return 'ج';
    case 'ϭ':
      if (N === 'ⲓ') return 'ش';
      return 'تش';
    case 'ϯ':
      return 'تي';
    default:
      if (L === '`') return '';
      return g.letter.replace(COMBINING_MARKS, '');
  }
}

function matchDigraph(
  gs: Grapheme[],
  i: number,
): { text: string; consumed: number; encodesJenkim?: boolean } | null {
  const a = lowerCopticChar(gs[i].letter);
  const b = gs[i + 1] ? lowerCopticChar(gs[i + 1].letter) : '';
  const c = gs[i + 2] ? lowerCopticChar(gs[i + 2].letter) : '';
  const d = gs[i + 3] ? lowerCopticChar(gs[i + 3].letter) : '';
  const e = gs[i + 4] ? lowerCopticChar(gs[i + 4].letter) : '';

  // ⲭ̀?ⲣⲓⲥⲧⲟⲥ → اخرستوس
  if (
    a === 'ⲭ' &&
    b === 'ⲣ' &&
    c === 'ⲓ' &&
    d === 'ⲥ' &&
    e === 'ⲧ' &&
    lowerCopticChar(gs[i + 5]?.letter ?? '') === 'ⲟ' &&
    lowerCopticChar(gs[i + 6]?.letter ?? '') === 'ⲥ'
  ) {
    return { text: 'اخرستوس', consumed: 7, encodesJenkim: true };
  }

  // ⲥ̀ⲧⲁⲩⲣⲟⲥ → إستافروس (keep as one word after a spaced pronoun)
  if (
    a === 'ⲥ' &&
    gs[i].jenkim &&
    b === 'ⲧ' &&
    c === 'ⲁ' &&
    d === 'ⲩ' &&
    e === 'ⲣ' &&
    lowerCopticChar(gs[i + 5]?.letter ?? '') === 'ⲟ' &&
    lowerCopticChar(gs[i + 6]?.letter ?? '') === 'ⲥ'
  ) {
    return { text: 'إستافروس', consumed: 7, encodesJenkim: true };
  }

  // ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ → إسماروؤت
  if (
    a === 'ⲥ' &&
    gs[i].jenkim &&
    b === 'ⲙ' &&
    c === 'ⲁ' &&
    d === 'ⲣ' &&
    e === 'ⲱ' &&
    lowerCopticChar(gs[i + 5]?.letter ?? '') === 'ⲟ' &&
    lowerCopticChar(gs[i + 6]?.letter ?? '') === 'ⲩ' &&
    lowerCopticChar(gs[i + 7]?.letter ?? '') === 'ⲧ'
  ) {
    return { text: 'إسماروؤت', consumed: 8, encodesJenkim: true };
  }

  // ⲡ̀?=ⲟⲓⲥ → إبشويس / بشويس
  if (a === 'ⲡ' && b === 'ϭ' && c === 'ⲟ' && d === 'ⲓ' && e === 'ⲥ') {
    const text = gs[i].jenkim ? 'إبشويس' : 'بشويس';
    return { text, consumed: 5, encodesJenkim: true };
  }
  if (a === 'ϭ' && b === 'ⲟ' && c === 'ⲓ' && d === 'ⲥ') {
    return { text: 'شويس', consumed: 4 };
  }

  // ⲯⲩⲭ → (إ)بسيك — golden إبسيكى (χ as ك in psyche)
  if (a === 'ⲯ' && b === 'ⲩ' && c === 'ⲭ') {
    return { text: 'بسيك', consumed: 3 };
  }

  // ⲟⲩⲱ̀?ⲟⲩ → وؤ
  if (a === 'ⲟ' && b === 'ⲩ' && c === 'ⲱ' && d === 'ⲟ' && e === 'ⲩ') {
    return { text: 'وؤ', consumed: 5 };
  }

  if (a === 'ⲟ' && b === 'ⲩ' && c === 'ⲓ') return { text: 'اوي', consumed: 3 };
  if (a === 'ⲅ' && b === 'ⲁ' && c === 'ⲣ') return { text: 'غار', consumed: 3 };
  if (a === 'ⲇ' && b === 'ⲟ' && c === 'ⲝ') return { text: 'ذوكس', consumed: 3 };
  if (a === 'ⲇ' && b === 'ⲉ') return { text: 'ذى', consumed: 2 };
  if (a === 'ⲱ' && b === 'ⲟ' && c === 'ⲩ') return { text: 'وؤ', consumed: 3 };

  // ⲟⲩⲟ… → أوو… (ⲟⲩⲟϩ → أووه) when word-initial-ish
  if (a === 'ⲟ' && b === 'ⲩ' && (c === 'ⲟ' || c === 'ⲱ' || c === 'ⲁ')) {
    return { text: i === 0 ? 'أو' : 'و', consumed: 2 };
  }

  // ⲟⲩ → أو at word start, else و
  if (a === 'ⲟ' && b === 'ⲩ') {
    return { text: i === 0 ? 'أو' : 'و', consumed: 2 };
  }

  if (a === 'ⲏ' && b === 'ⲓ') return { text: 'ى', consumed: 2 };
  if (a === 'ⲓ' && b === 'ⲟ' && c !== 'ⲩ') return { text: 'يو', consumed: 2 };
  if (a === 'ⲁ' && b === 'ⲩ') return { text: 'اف', consumed: 2 };
  if (a === 'ⲉ' && b === 'ⲩ') return { text: 'يف', consumed: 2 };
  if (a === 'ⲏ' && b === 'ⲩ') return { text: 'ي', consumed: 2 };
  if (a === 'ⲉ' && b === 'ⲓ') return { text: 'ي', consumed: 2 };
  if (a === 'ⲅ' && b === 'ⲅ') return { text: 'نج', consumed: 2 };
  if (a === 'ⲛ' && b === 'ⲅ') return { text: 'نج', consumed: 2 };
  if (a === 'ⲛ' && b === 'ⲕ') return { text: 'نك', consumed: 2 };
  if (a === 'ⲛ' && b === 'ⲭ') return { text: 'نخ', consumed: 2 };
  if (a === 'ⲃ' && b === 'ⲃ') return { text: 'ف', consumed: 2 };
  return null;
}

function pronounceLetters(stem: string, moreFollows = false): string {
  const gs = toGraphemes(stem);
  let out = '';
  let i = 0;

  while (i < gs.length) {
    const g = gs[i];
    if (g.letter === '`' || (COMBINING_MARKS.test(g.letter) && !isCopticBase(g.letter))) {
      i++;
      continue;
    }

    const digraph = matchDigraph(gs, i);
    if (digraph) {
      if (g.jenkim && !isVowel(g.letter) && !digraph.encodesJenkim) {
        out += epenthetic(out);
      }
      if (g.jenkim && isVowel(g.letter)) {
        // ⲉ̀ + digraph → إى …
        out += out.length > 0 ? ' إى' : 'إى';
        if (!out.endsWith(' ')) out += ' ';
        // skip emitting vowel sound; digraph follows
        out += digraph.text;
        i += digraph.consumed;
        continue;
      }
      out += digraph.text;
      i += digraph.consumed;
      continue;
    }

    // Pronoun / clitic prefixes → separate Arabic word (إمبيك استافروس)
    const proclitic = matchProclitic(gs, i);
    if (proclitic) {
      out += proclitic.text;
      i += proclitic.consumed;
      continue;
    }

    const next = gs[i + 1];
    const atEnd =
      !moreFollows &&
      (i === gs.length - 1 || (i === gs.length - 2 && next && !isCopticBase(next.letter)));
    const sound = letterSound(g, next, atEnd);

    if (g.jenkim && !isVowel(g.letter)) {
      out += epenthetic(out) + sound;
    } else if (g.jenkim && isVowel(g.letter)) {
      // Vowel jenkim: ⲉ̀ → إى (golden), then space before following cluster
      const L = lowerCopticChar(g.letter);
      if (L === 'ⲉ' || L === 'ⲏ' || L === 'ⲓ') {
        out += out.length > 0 ? ' إى' : 'إى';
      } else if (L === 'ⲁ') {
        out += out.length > 0 ? ' آ' : 'آ';
      } else {
        out += sound;
      }
      if (i + 1 < gs.length || moreFollows) out += ' ';
    } else {
      out += sound;
    }
    i++;
  }

  return out.replace(COMBINING_MARKS, '').replace(/ {2,}/g, ' ').trim();
}

function joinLexical(prefixOut: string, replacement: string): string {
  if (!prefixOut) return replacement;
  if (/\s$/.test(prefixOut) || /[ىآ]$/.test(prefixOut.trimEnd())) {
    return `${prefixOut.trimEnd()} ${replacement}`.replace(/ {2,}/g, ' ');
  }
  return prefixOut.replace(/ +$/g, '') + replacement;
}

function pronounceWord(copticWord: string): string {
  const { stem, suffix } = splitTrailingPunct(copticWord);
  if (!stem) return suffix;

  const lexical = matchLexical(stem, LEXICAL);
  if (lexical) {
    if (!lexical.prefix) return lexical.replacement + suffix;
    return joinLexical(pronounceLetters(lexical.prefix, true), lexical.replacement) + suffix;
  }

  return pronounceLetters(stem) + suffix;
}

export function copticTextToArabic(textArray: string[]): string[] {
  return textArray.map((text) => {
    const cleaned = stripLeadingPlus(text);
    const words = cleaned.split(/(\s+)/);
    return words
      .map((token) => (/^\s+$/.test(token) ? token : pronounceWord(token)))
      .join('');
  });
}
