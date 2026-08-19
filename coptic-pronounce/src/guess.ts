/**
 * Best-effort reverse engine: Latin or Arabic phonetic → Coptic Unicode guess.
 *
 * This is inherently ambiguous (f→ϥ|ⲫ, i→ⲓ|ⲏ, sh→ϣ|ϭ…). We pick Bohairic
 * liturgical defaults and optionally return ranked alternates.
 */

export type GuessFrom = 'en' | 'ar' | 'english' | 'arabic';

export type GuessCandidate = {
  coptic: string;
  /** 0–1 confidence heuristic */
  score: number;
  note?: string;
};

export type GuessResult = {
  best: string;
  candidates: GuessCandidate[];
};

type Rule = { from: string; to: string; score?: number };

/** Whole-phrase / word liturgical reverse map (normalized Latin key). */
const LEXICAL_EN: Rule[] = [
  { from: 'shere ne maria', to: 'ⲭ̅ⲉ̅', score: 1 },
  { from: 'epshois', to: 'Ⲡ̀ϭⲟⲓⲥ', score: 1 },
  { from: 'pchois', to: 'Ⲡ̀ϭⲟⲓⲥ', score: 0.95 },
  { from: 'shois', to: 'ϭⲟⲓⲥ', score: 1 },
  { from: 'efnouti', to: 'Ⲫ̀ⲛⲟⲩϯ', score: 1 },
  { from: 'pnouti', to: 'ⲡⲛⲟⲩϯ', score: 0.9 },
  { from: 'ekrestos', to: 'ⲭ̅ⲥ̅', score: 1 },
  { from: 'pikhrestos', to: 'Ⲡⲭ̅ⲥ̅', score: 1 },
  { from: 'pikhristos', to: 'Ⲡⲓⲭ̀ⲣⲓⲥⲧⲟⲥ', score: 0.95 },
  { from: 'isous', to: 'Ⲓⲏ̅ⲥ̅', score: 1 },
  { from: 'ethowab', to: 'ⲉⲑⲟⲩⲁⲃ', score: 0.9 },
  { from: 'sotir', to: 'ⲥ̅ⲱ̅ⲣ̅', score: 1 },
  { from: 'filanethrobe', to: 'Ⲫⲓⲗⲁⲛⲑ̀ⲣⲱⲡⲉ', score: 1 },
  { from: 'zoxa', to: 'Ⲇⲟⲝⲁ', score: 1 },
  { from: 'shere', to: 'ⲭⲉⲣⲉ', score: 1 },
  { from: 'owoh', to: 'ⲟⲩⲟϩ', score: 0.95 },
  { from: 'ouoh', to: 'ⲟⲩⲟϩ', score: 0.9 },
  { from: 'khen', to: 'ϧⲉⲛ', score: 0.95 },
  { from: 'evol', to: 'ⲉ̀ⲃⲟⲗ', score: 0.9 },
  { from: 'ente', to: 'ⲛ̀ⲧⲉ', score: 0.95 },
  { from: 'enje', to: 'ⲛ̀ϫⲉ', score: 0.95 },
  { from: 'efiom', to: 'ⲫ̀ⲓⲟⲙ', score: 0.95 },
  { from: 'efyom', to: 'ⲫ̀ⲓⲟⲙ', score: 0.95 },
  { from: 'epsishi', to: 'ⲯⲩⲭⲏ', score: 0.95 },
  { from: 'ghar', to: 'ⲅⲁⲣ', score: 1 },
];

/** Arabic liturgical reverse (after orthography normalize). */
const LEXICAL_AR: Rule[] = [
  { from: 'شيرى نى ماريا', to: 'ⲭ̅ⲉ̅', score: 1 },
  { from: 'شيري ني ماريا', to: 'ⲭ̅ⲉ̅', score: 1 },
  { from: 'شيرىنىماريا', to: 'ⲭ̅ⲉ̅', score: 1 },
  { from: 'شيرينيماريا', to: 'ⲭ̅ⲉ̅', score: 1 },
  { from: 'ابشويس', to: 'Ⲡ̀ϭⲟⲓⲥ', score: 1 },
  { from: 'شويس', to: 'ϭⲟⲓⲥ', score: 1 },
  { from: 'افنوتي', to: 'Ⲫ̀ⲛⲟⲩϯ', score: 1 },
  { from: 'اخرستوس', to: 'ⲭ̅ⲥ̅', score: 0.95 },
  { from: 'بيخرستوس', to: 'Ⲡⲭ̅ⲥ̅', score: 1 },
  { from: 'ايسوس', to: 'Ⲓⲏ̅ⲥ̅', score: 1 },
  { from: 'ذوكسا', to: 'Ⲇⲟⲝⲁ', score: 1 },
  { from: 'شيرى', to: 'ⲭⲉⲣⲉ', score: 1 },
  { from: 'شيري', to: 'ⲭⲉⲣⲉ', score: 1 },
  { from: 'اووه', to: 'ⲟⲩⲟϩ', score: 0.95 },
  { from: 'خين', to: 'ϧⲉⲛ', score: 0.95 },
  { from: 'انتى', to: 'ⲛ̀ⲧⲉ', score: 0.95 },
  { from: 'انتي', to: 'ⲛ̀ⲧⲉ', score: 0.95 },
  { from: 'انجى', to: 'ⲛ̀ϫⲉ', score: 0.95 },
  { from: 'انجي', to: 'ⲛ̀ϫⲉ', score: 0.95 },
  { from: 'ايابشوى', to: 'ⲉ̀ⲡ̀ϣⲱⲓ', score: 0.85 },
  { from: 'ايابشوي', to: 'ⲉ̀ⲡ̀ϣⲱⲓ', score: 0.85 },
  { from: 'افيوم', to: 'ⲫ̀ⲓⲟⲙ', score: 0.95 },
  { from: 'بسيكى', to: 'ⲯⲩⲭⲏ', score: 0.9 },
  { from: 'بسيكي', to: 'ⲯⲩⲭⲏ', score: 0.9 },
  { from: 'امبيكاستافروس', to: 'ⲙ̀ⲡⲉⲕⲥ̀ⲧⲁⲩⲣⲟⲥ', score: 0.95 },
  { from: 'امبيك استافروس', to: 'ⲙ̀ⲡⲉⲕⲥ̀ⲧⲁⲩⲣⲟⲥ', score: 0.95 },
  { from: 'اكاسمارووت', to: 'ⲕ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ', score: 0.9 },
  { from: 'اك اسمارووت', to: 'ⲕ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ', score: 0.9 },
];

/** Longest-first phonetic chunks → Coptic (Latin, normalized). */
const PHONEME_EN: Rule[] = [
  { from: 'ouowou', to: 'ⲟⲩⲱ̀ⲟⲩ', score: 0.9 },
  { from: 'owou', to: 'ⲱⲟⲩ', score: 0.9 },
  { from: 'epsish', to: 'ⲯⲩⲭ', score: 0.9 },
  { from: 'epshois', to: 'Ⲡ̀ϭⲟⲓⲥ', score: 1 },
  { from: 'tsh', to: 'ϭ', score: 0.85 },
  { from: 'ch', to: 'ϭ', score: 0.7 },
  { from: 'sh', to: 'ϣ', score: 0.9 },
  { from: 'th', to: 'ⲑ', score: 0.95 },
  { from: 'kh', to: 'ϧ', score: 0.85 }, // alt ⲭ
  { from: 'ks', to: 'ⲝ', score: 0.95 },
  { from: 'ps', to: 'ⲯ', score: 0.9 },
  { from: 'eps', to: 'ⲯ', score: 0.85 },
  { from: 'ng', to: 'ⲛⲅ', score: 0.9 },
  { from: 'nk', to: 'ⲛⲕ', score: 0.9 },
  { from: 'owi', to: 'ⲟⲩⲓ', score: 0.95 },
  { from: 'ou', to: 'ⲟⲩ', score: 0.95 },
  { from: 'ow', to: 'ⲟⲩ', score: 0.85 },
  { from: 'av', to: 'ⲁⲩ', score: 0.9 },
  { from: 'ev', to: 'ⲉⲩ', score: 0.9 },
  { from: 'ti', to: 'ϯ', score: 0.85 },
  // jenkim-style epenthetic e + consonant
  { from: 'en', to: 'ⲛ̀', score: 0.8 },
  { from: 'em', to: 'ⲙ̀', score: 0.8 },
  { from: 'ep', to: 'ⲡ̀', score: 0.8 },
  { from: 'es', to: 'ⲥ̀', score: 0.8 },
  { from: 'et', to: 'ⲧ̀', score: 0.75 },
  { from: 'ek', to: 'ⲕ̀', score: 0.75 },
  { from: 'ef', to: 'ⲫ̀', score: 0.75 },
  { from: 'eh', to: 'ϩ̀', score: 0.7 },
  // singles
  { from: 'a', to: 'ⲁ', score: 0.9 },
  { from: 'b', to: 'ⲃ', score: 0.7 },
  { from: 'v', to: 'ⲃ', score: 0.9 },
  { from: 'g', to: 'ⲅ', score: 0.85 }, // ϫ also possible before a/o
  { from: 'j', to: 'ϫ', score: 0.9 },
  { from: 'd', to: 'ⲇ', score: 0.9 },
  { from: 'z', to: 'ⲍ', score: 0.7 }, // ⲇ in Greek loans
  { from: 'e', to: 'ⲉ', score: 0.85 },
  { from: 'i', to: 'ⲓ', score: 0.85 }, // ⲏ also
  { from: 'y', to: 'ⲩ', score: 0.85 },
  { from: 'k', to: 'ⲕ', score: 0.9 },
  { from: 'l', to: 'ⲗ', score: 0.95 },
  { from: 'm', to: 'ⲙ', score: 0.95 },
  { from: 'n', to: 'ⲛ', score: 0.95 },
  { from: 'o', to: 'ⲟ', score: 0.85 }, // ⲱ also
  { from: 'p', to: 'ⲡ', score: 0.95 },
  { from: 'r', to: 'ⲣ', score: 0.95 },
  { from: 's', to: 'ⲥ', score: 0.95 },
  { from: 't', to: 'ⲧ', score: 0.95 },
  { from: 'f', to: 'ϥ', score: 0.8 }, // ⲫ also
  { from: 'h', to: 'ϩ', score: 0.95 },
];

const PHONEME_AR: Rule[] = [
  { from: 'تش', to: 'ϭ', score: 0.85 },
  { from: 'ش', to: 'ϣ', score: 0.9 },
  { from: 'ث', to: 'ⲑ', score: 0.95 },
  { from: 'خ', to: 'ϧ', score: 0.85 },
  { from: 'كس', to: 'ⲝ', score: 0.95 },
  { from: 'بس', to: 'ⲯ', score: 0.85 },
  { from: 'تي', to: 'ϯ', score: 0.85 },
  { from: 'اوي', to: 'ⲟⲩⲓ', score: 0.9 },
  { from: 'وو', to: 'ⲟⲩⲟ', score: 0.7 },
  { from: 'او', to: 'ⲟⲩ', score: 0.85 },
  { from: 'و', to: 'ⲟ', score: 0.7 },
  { from: 'ا', to: 'ⲁ', score: 0.75 },
  { from: 'إ', to: '', score: 0.5 }, // often jenkim marker — handled specially
  { from: 'ي', to: 'ⲓ', score: 0.8 },
  { from: 'ى', to: 'ⲉ', score: 0.75 },
  { from: 'ب', to: 'ⲡ', score: 0.75 },
  { from: 'ف', to: 'ϥ', score: 0.8 },
  { from: 'ڤ', to: 'ⲃ', score: 0.9 },
  { from: 'غ', to: 'ⲅ', score: 0.9 },
  { from: 'ج', to: 'ϫ', score: 0.9 },
  { from: 'د', to: 'ⲇ', score: 0.9 },
  { from: 'ذ', to: 'ⲇ', score: 0.85 },
  { from: 'ز', to: 'ⲍ', score: 0.9 },
  { from: 'ك', to: 'ⲕ', score: 0.9 },
  { from: 'ل', to: 'ⲗ', score: 0.95 },
  { from: 'م', to: 'ⲙ', score: 0.95 },
  { from: 'ن', to: 'ⲛ', score: 0.95 },
  { from: 'ر', to: 'ⲣ', score: 0.95 },
  { from: 'س', to: 'ⲥ', score: 0.95 },
  { from: 'ت', to: 'ⲧ', score: 0.95 },
  { from: 'ه', to: 'ϩ', score: 0.95 },
];

function normalizeFrom(lang: GuessFrom): 'en' | 'ar' {
  const n = String(lang).toLowerCase();
  if (n === 'en' || n === 'english') return 'en';
  if (n === 'ar' || n === 'arabic') return 'ar';
  throw new Error(`Unsupported language "${lang}". Use "en" or "ar".`);
}

function normalizeEnInput(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ō/g, 'o')
    .replace(/-/g, '')
    .replace(/[.,:;!?()'"""'']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeArInput(s: string): string {
  return s
    .trim()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ڤ/g, 'ف')
    .replace(/[.,:;!?()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sortRules(rules: Rule[]): Rule[] {
  return [...rules].sort((a, b) => b.from.length - a.from.length);
}

function applyLexicalWhole(
  word: string,
  rules: Rule[],
  normalizeKey: (s: string) => string,
): GuessCandidate | null {
  const key = normalizeKey(word);
  const keyTight = key.replace(/\s+/g, '');
  for (const rule of rules) {
    const from = normalizeKey(rule.from);
    const fromTight = from.replace(/\s+/g, '');
    if (key === from || keyTight === fromTight) {
      return { coptic: rule.to, score: rule.score ?? 0.9, note: 'lexical' };
    }
  }
  return null;
}

/**
 * Greedy longest-match decode of a single normalized token.
 */
function decodeToken(
  token: string,
  phonemes: Rule[],
  alts?: { at: number; choice: Rule }[],
): { coptic: string; score: number; unmatched: number } {
  const rules = sortRules(phonemes);
  let i = 0;
  let out = '';
  let scoreSum = 0;
  let parts = 0;
  let unmatched = 0;

  while (i < token.length) {
    // skip spaces inside token (Arabic spaced pronouns already split)
    if (/\s/.test(token[i])) {
      i++;
      continue;
    }

    // Arabic epenthetic إ/ا before consonant → jenkim on next letter
    if (token[i] === 'ا' || token[i] === 'إ') {
      // peek: try match next phoneme and put jenkim on first consonant letter
      i++;
      let matched = false;
      for (const rule of rules) {
        if (rule.from === 'ا' || rule.from === 'إ') continue;
        if (token.startsWith(rule.from, i) && rule.to) {
          const letters = [...rule.to];
          if (letters.length > 0 && !letters[0].includes('\u0300')) {
            // add jenkim to first base letter
            out += letters[0] + '\u0300' + letters.slice(1).join('');
          } else {
            out += rule.to;
          }
          scoreSum += rule.score ?? 0.7;
          parts++;
          i += rule.from.length;
          matched = true;
          break;
        }
      }
      if (!matched) unmatched++;
      continue;
    }

    // Latin leading "e-" style already stripped hyphens; "e" + consonant handled via en/em/ep rules

    let hit: Rule | null = null;
    for (const rule of rules) {
      if (token.startsWith(rule.from, i)) {
        hit = rule;
        break;
      }
    }

    if (hit) {
      out += hit.to;
      scoreSum += hit.score ?? 0.8;
      parts++;
      i += hit.from.length;
    } else {
      unmatched++;
      i++;
    }
  }

  const score = parts === 0 ? 0 : (scoreSum / parts) * (unmatched === 0 ? 1 : 0.7);
  return { coptic: out, score, unmatched };
}

function guessWord(word: string, from: 'en' | 'ar'): GuessCandidate[] {
  const lexical = from === 'en' ? LEXICAL_EN : LEXICAL_AR;
  const phonemes = from === 'en' ? PHONEME_EN : PHONEME_AR;
  const normalize = from === 'en' ? normalizeEnInput : normalizeArInput;
  const norm = normalize(word);
  if (!norm) return [];

  const candidates: GuessCandidate[] = [];

  const lex = applyLexicalWhole(norm, lexical, normalize);
  if (lex) candidates.push(lex);

  const lexTight = applyLexicalWhole(norm.replace(/\s+/g, ''), lexical, normalize);
  if (lexTight && !candidates.some((c) => c.coptic === lexTight.coptic)) {
    candidates.push(lexTight);
  }

  const decoded = decodeToken(norm.replace(/\s+/g, from === 'ar' ? '' : ''), phonemes);
  if (decoded.coptic) {
    candidates.push({
      coptic: decoded.coptic,
      score: decoded.score,
      note: decoded.unmatched ? 'phoneme-partial' : 'phoneme',
    });
  }

  // Ambiguity alternates for Latin f/kh/i/o
  if (from === 'en' && decoded.coptic) {
    const altF = decoded.coptic.replace(/ϥ/g, 'ⲫ');
    if (altF !== decoded.coptic) {
      candidates.push({ coptic: altF, score: decoded.score * 0.85, note: 'alt ϥ→ⲫ' });
    }
    const altKh = decoded.coptic.replace(/ϧ/g, 'ⲭ');
    if (altKh !== decoded.coptic) {
      candidates.push({ coptic: altKh, score: decoded.score * 0.85, note: 'alt ϧ→ⲭ' });
    }
  }

  // Deduplicate by coptic, keep highest score
  const byCoptic = new Map<string, GuessCandidate>();
  for (const c of candidates) {
    const prev = byCoptic.get(c.coptic);
    if (!prev || c.score > prev.score) byCoptic.set(c.coptic, c);
  }

  return [...byCoptic.values()].sort((a, b) => b.score - a.score);
}

/**
 * Guess Coptic Unicode from English or Arabic phonetic text.
 *
 * @example
 * guessCoptic('Epshois', 'en').best // Ⲡ̀ϭⲟⲓⲥ
 * guessCoptic('إبشويس', 'ar').best  // Ⲡ̀ϭⲟⲓⲥ
 * guessCoptic('shere ne Maria', 'en').best // ⲭ̅ⲉ̅
 */
export function guessCoptic(text: string, from: GuessFrom): GuessResult;
export function guessCoptic(text: string[], from: GuessFrom): GuessResult[];
export function guessCoptic(
  text: string | string[],
  from: GuessFrom,
): GuessResult | GuessResult[] {
  const lang = normalizeFrom(from);
  const isArray = Array.isArray(text);
  const texts = isArray ? text : [text];

  const results = texts.map((line) => {
    const cleaned = String(line ?? '').replace(/^\+\s*/, '').trim();
    if (!cleaned) return { best: '', candidates: [] };

    const lexical = lang === 'en' ? LEXICAL_EN : LEXICAL_AR;
    const normalize = lang === 'en' ? normalizeEnInput : normalizeArInput;
    const normLine = normalize(cleaned);

    // Prefer whole-line / whole-phrase liturgical matches first
    const lineLex = applyLexicalWhole(normLine, lexical, normalize);
    if (lineLex) {
      return { best: lineLex.coptic, candidates: [lineLex] };
    }

    // Preserve punctuation tokens roughly by splitting on spaces
    const parts = cleaned.split(/(\s+)/);
    const wordGuesses: GuessCandidate[][] = [];

    for (const part of parts) {
      if (!part || /^\s+$/.test(part)) {
        wordGuesses.push([{ coptic: part, score: 1, note: 'space' }]);
        continue;
      }
      if (/^[.,:;!?()]+$/.test(part)) {
        wordGuesses.push([{ coptic: part, score: 1, note: 'punct' }]);
        continue;
      }

      const g = guessWord(part, lang);
      wordGuesses.push(g.length ? g : [{ coptic: part, score: 0, note: 'passthrough' }]);
    }

    const best = wordGuesses.map((g) => g[0]?.coptic ?? '').join('');
    const avgScore =
      wordGuesses.reduce((s, g) => s + (g[0]?.score ?? 0), 0) / Math.max(wordGuesses.length, 1);

    const contentParts = parts.filter(
      (p) => p && !/^\s+$/.test(p) && !/^[.,:;!?()]+$/.test(p),
    );
    const isSingleWord = contentParts.length <= 1;

    let candidates: GuessCandidate[];
    if (isSingleWord) {
      candidates = wordGuesses.find((g) => g[0]?.note !== 'space' && g[0]?.note !== 'punct') ?? [
        { coptic: best, score: avgScore },
      ];
    } else {
      candidates = [{ coptic: best, score: avgScore, note: 'line-best' }];
      const altParts = wordGuesses.map((g) => (g[1] ? g[1].coptic : g[0]?.coptic ?? ''));
      const alt = altParts.join('');
      if (alt && alt !== best) {
        candidates.push({ coptic: alt, score: avgScore * 0.85, note: 'line-alt' });
      }
    }

    return { best, candidates };
  });

  return isArray ? results : results[0];
}

/** Convenience: return only the best Coptic guess string. */
export function toCoptic(text: string, from: GuessFrom): string;
export function toCoptic(text: string[], from: GuessFrom): string[];
export function toCoptic(text: string | string[], from: GuessFrom): string | string[] {
  const isArray = Array.isArray(text);
  if (isArray) {
    return (guessCoptic(text, from) as GuessResult[]).map((r) => r.best);
  }
  return (guessCoptic(text, from) as GuessResult).best;
}
